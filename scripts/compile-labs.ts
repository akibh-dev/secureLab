import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import { labSchema } from "../packages/lab-schema/src/index";

const root = "packages/lab-content/lessons";
const output = "packages/lab-content/src/catalog.generated.json";

async function readProse(folder: string, filename: string) {
  const path = join(root, folder, filename);
  const value = (await Bun.file(path).text()).trim();
  if (/<\/?[a-z][^>]*>/i.test(value)) {
    throw new Error(
      `${path}: use prose paragraphs. Place links in lab.yaml references.`,
    );
  }
  return value.replace(/\r\n/g, "\n").replace(/([^\n])\n(?=[^\n])/g, "$1 ");
}

const folders = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const labs = [];
for (const folder of folders) {
  const path = join(root, folder, "lab.yaml");
  const fields: unknown = parse(await Bun.file(path).text());
  if (typeof fields !== "object" || fields === null || Array.isArray(fields)) {
    throw new Error(`${path}: expected a YAML mapping`);
  }
  const result = labSchema.safeParse({
    ...fields,
    scenario: await readProse(folder, "scenario.md"),
    explanation: await readProse(folder, "explanation.md"),
  });
  if (!result.success) throw new Error(`${path}: ${result.error.message}`);
  if (folder !== result.data.id.toLowerCase()) {
    throw new Error(`${path}: lesson directory must match the ID`);
  }
  labs.push(result.data);
}
const generated = JSON.stringify(labs, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (
    !(await Bun.file(output).exists()) ||
    (await Bun.file(output).text()) !== generated
  ) {
    throw new Error(
      "Lab catalog has changed. Run bun run compile:labs and commit the regenerated catalog.",
    );
  }
} else {
  await Bun.write(output, generated);
}
