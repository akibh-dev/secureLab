import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

import { headers } from "./headers.mjs";

const files = (await readdir("dist", { recursive: true, withFileTypes: true }))
  .filter((file) => file.isFile())
  .map((file) => join(file.parentPath, file.name).slice(5))
  .filter(
    (file) => !file.startsWith("_headers") && !file.startsWith("_redirects"),
  )
  .sort();
const hash = createHash("sha256");
for (const file of files)
  hash.update(file).update(await readFile(join("dist", file)));
const source = await readFile("scripts/sw.js");
hash.update(source);
const routes = files.map(
  (file) => "/" + file.replace(/(^|\/)index\.html$/, "$1"),
);
await writeFile(
  "dist/sw.js",
  `const cacheName = "securelab-${hash.digest("hex").slice(0, 16)}";\nconst paths = ${JSON.stringify(routes)};\n` +
    source,
);

await writeFile("dist/_headers", await headers(files));
