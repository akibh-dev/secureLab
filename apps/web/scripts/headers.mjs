import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

function hashes(html, tag) {
  const contents = [
    ...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "g")),
  ];
  return [
    ...new Set(
      contents
        .map(([, value]) => value)
        .filter(Boolean)
        .map(
          (value) =>
            `'sha256-${createHash("sha256").update(value).digest("base64")}'`,
        ),
    ),
  ];
}
export async function headers(files) {
  const common = [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin",
    "  X-Frame-Options: DENY",
    "/sw.js",
    "  Cache-Control: no-cache",
    "/_astro/*",
    "  Cache-Control: public, max-age=31536000, immutable",
  ];
  for (const file of files.filter((file) => file.endsWith(".html"))) {
    const html = await readFile(join("dist", file), "utf8");
    const policy = [
      "default-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "connect-src 'self'",
      "worker-src 'self'",
      ["script-src 'self'", ...hashes(html, "script")].join(" "),
      ["style-src 'self'", ...hashes(html, "style")].join(" "),
    ];
    const line = "  Content-Security-Policy: " + policy.join("; ");
    if (line.length > 2000)
      throw new Error(`Cloudflare header exceeds 2000 characters for ${file}`);
    const path = "/" + file.replace(/(^|\/)index\.html$/, "$1");
    common.push(path, "  Cache-Control: no-cache", line);
  }
  if (common.filter((line) => line.startsWith("/")).length > 100) {
    throw new Error("Cloudflare supports up to 100 header rules");
  }
  return common.join("\n") + "\n";
}
