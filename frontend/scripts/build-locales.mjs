import { execFileSync } from "node:child_process";
import { LOCALES, localeBase, localeOutDir } from "./locales.mjs";

/*
 * Builds the site once per language.
 *
 * One bundle that switches language at runtime cannot be indexed in more than
 * one language — there is only ever one URL per page, and a crawler has no way
 * to reach the others. So each language gets its own build, its own path and
 * its own prerendered HTML.
 *
 * The default language builds to dist/ at the site root, which keeps every
 * existing URL and inbound link intact. The rest build to dist/<locale>/.
 */

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

for (const locale of LOCALES) {
  const base = localeBase(locale);
  const outDir = localeOutDir(locale);

  console.log(`building ${locale} -> ${outDir} (base ${base})`);

  execFileSync(
    npx,
    [
      "vite",
      "build",
      "--mode=production",
      "--sourcemap=false",
      `--base=${base}`,
      `--outDir=${outDir}`,
      "--emptyOutDir",
    ],
    {
      stdio: "inherit",
      // Read by src/config/locale.ts, which fixes this bundle's language.
      env: { ...process.env, VITE_SITE_LOCALE: locale },
    },
  );
}

console.log(`built ${String(LOCALES.length)} locales: ${LOCALES.join(", ")}`);
