import { readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../dist/", import.meta.url);
const directory = Bun.fileURLToPath(root);
const files = new Map();
for (const entry of await readdir(directory, {
  recursive: true,
  withFileTypes: true,
})) {
  if (!entry.isFile()) continue;
  const filename = join(entry.parentPath, entry.name);
  const path =
    "/" + filename.slice(directory.length).replace(/(^|\/)index\.html$/, "$1");
  files.set(path, Bun.file(filename));
}

const rules = (await Bun.file(new URL("_headers", root)).text())
  .trim()
  .split("\n");
const groups = new Map();
let current;
for (const rule of rules) {
  if (!rule.startsWith(" ")) {
    current = [];
    groups.set(rule, current);
  } else {
    current.push(rule.trim());
  }
}

function makeHeaders(path) {
  const headers = new Headers();
  for (const [pattern, headersList] of groups) {
    const matches = pattern.endsWith("*")
      ? path.startsWith(pattern.slice(0, -1))
      : path === pattern;
    if (!matches) continue;
    for (const header of headersList) {
      if (header.startsWith("! ")) headers.delete(header.slice(2));
      else {
        const separator = header.indexOf(":");
        headers.set(
          header.slice(0, separator),
          header.slice(separator + 1).trim(),
        );
      }
    }
  }
  return headers;
}

Bun.serve({
  hostname: "127.0.0.1",
  port: 4322,
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, { status: 405 });
    if (!files.has(path) && files.has(path + "/"))
      return Response.redirect(new URL(path + "/", request.url));
    const found = files.has(path) && path !== "/_headers";
    const file = files.get(found ? path : "/404.html");
    const headers = makeHeaders(found ? path : "/404.html");
    if (file?.type) headers.set("content-type", file.type);
    return new Response(request.method === "HEAD" ? null : file, {
      status: found ? 200 : 404,
      headers,
    });
  },
});
