import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, LOCALES, localePrefix } from "./locales.mjs";

/*
 * Serves dist/ the way nginx does in production: an exact file if there is one,
 * then <route>/index.html, and only then the SPA shell.
 *
 * That order is the point. `vite preview` answers every unknown path with the
 * root shell, which would hide a route whose prerendered file is missing — the
 * e2e suite would pass against a build that ships no static HTML at all.
 */

const DIST = path.resolve(process.argv[2] ?? "dist");
const PORT = Number(process.env.PORT ?? 3000);
/*
 * `||`, not `??`, deliberately: in the browser bundle an empty VITE_CMS_API_URL
 * means "same origin", but a node script has no origin — the Docker image build
 * exports exactly that empty string, and passing it through would make every
 * fetch target the unparseable URL "/api/...". Empty here means "not told",
 * which falls back to the dev backend's address.
 */
const API_BASE = (
  process.env.VITE_CMS_API_URL || "http://localhost:8001"
).replace(/\/+$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

/** The language a path belongs to, from its prefix. */
function localeFor(urlPath) {
  return (
    LOCALES.find((locale) => {
      const prefix = localePrefix(locale);
      return (
        prefix !== "" &&
        (urlPath === prefix || urlPath.startsWith(`${prefix}/`))
      );
    }) ?? DEFAULT_LOCALE
  );
}

function resolveFile(urlPath) {
  const direct = path.join(DIST, urlPath);
  if (!direct.startsWith(DIST)) return undefined; // traversal attempt

  if (existsSync(direct) && statSync(direct).isFile()) return direct;

  const indexed = path.join(direct, "index.html");
  if (existsSync(indexed)) return indexed;

  // SPA fallback, into the right language: sending /nl/anything to the English
  // shell would load the wrong bundle at a Dutch URL.
  const locale = localeFor(urlPath);
  const prefix = localePrefix(locale);
  return path.join(DIST, prefix, "index.html");
}

/*
 * Proxy /api to the CMS, exactly as nginx does in production.
 *
 * Without this the page is served from 127.0.0.1:<port> while the app fetches
 * the CMS on another port, which is cross-origin — the browser blocks the
 * response and every article renders as the error component. Proxying makes the
 * request same-origin here too, so what is prerendered matches what a visitor
 * gets and no CORS entry is needed for a throwaway port.
 */
async function proxyApi(req, res) {
  const target = `${API_BASE}${req.url ?? ""}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { accept: req.headers.accept ?? "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    res.statusCode = upstream.status;
    res.setHeader(
      "content-type",
      upstream.headers.get("content-type") ?? "application/json",
    );
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.statusCode = 502;
    res.end('{"error":"cms_unreachable"}');
  }
}

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);

  if (urlPath.startsWith("/api/")) {
    void proxyApi(req, res);
    return;
  }
  const file = resolveFile(urlPath);

  if (file === undefined || !existsSync(file)) {
    res.statusCode = 404;
    res.end("not found");
    return;
  }

  res.setHeader(
    "content-type",
    MIME[path.extname(file)] ?? "application/octet-stream",
  );
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`serving ${DIST} on http://localhost:${String(PORT)}`);
});
