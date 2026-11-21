import type { APIRoute } from "astro";
import { publishedLabs } from "@securelab/lab-content";
import { modules } from "../features/progress/modules";

export const GET: APIRoute = ({ site }) => {
  const paths = [
    "/",
    "/learn/",
    "/labs/",
    "/glossary/",
    "/about/",
    "/privacy/",
    "/contribute/",
    "/accessibility/",
    ...modules.map(({ slug }) => `/learn/${slug}/`),
    ...publishedLabs.map(({ slug }) => `/labs/${slug}/`),
  ];
  const entries = site
    ? paths
        .map((path) => `<url><loc>${new URL(path, site)}</loc></url>`)
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { "content-type": "application/xml" } },
  );
};
