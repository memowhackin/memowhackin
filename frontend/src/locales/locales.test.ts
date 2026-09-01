import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/config/locale";
import en from "@/locales/en/translation.json";
import nl from "@/locales/nl/translation.json";

/*
 * The integrity of the translation files, asserted rather than assumed.
 *
 * These are the two failures a bilingual site actually suffers, and neither is
 * visible in a typecheck: a `t()` call whose key was renamed in one place and
 * not the other renders the raw key to a visitor, and a key added to English
 * and forgotten in Dutch silently falls back to English mid-page.
 *
 * This lives as a test rather than as a generated `resources.d.ts` because the
 * generator only covers static keys — two in five `t()` calls here build their
 * key from a value, and no type can follow those. Reading the sources catches
 * both halves at no cost: no dependency, and no generated file to regenerate
 * whenever a key moves.
 *
 * The sources are read through `import.meta.glob` rather than `node:fs` on
 * purpose. Everything under `src` is browser code, so the app's TypeScript
 * project deliberately carries no node types; a test that reached for `fs`
 * would have to widen that project and, with it, permit any component to
 * import from the filesystem.
 */

const SOURCES: Record<string, string> = import.meta.glob("../**/*.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
});

/*
 * Keys written out in full. A key containing `${` is built at runtime from a
 * category, a locale or a finding id; its parent is exercised by the component
 * tests instead, because the set of values it can take lives in the API rather
 * than in this repository.
 */
function staticKeys(): { file: string; key: string }[] {
  const found: { file: string; key: string }[] = [];

  for (const [file, source] of Object.entries(SOURCES)) {
    if (file.includes(".test.")) continue;

    for (const match of source.matchAll(/\bt\(\s*(["`])([^"`$\s]+)\1/g)) {
      const key = match[2];
      if (key?.includes(".") === true) {
        found.push({ file: file.replace(/^\.\.\//, ""), key });
      }
    }
  }

  return found;
}

interface Tree {
  [key: string]: string | Tree;
}

function resolve(tree: Tree, key: string): string | Tree | undefined {
  let node: string | Tree | undefined = tree;
  for (const segment of key.split(".")) {
    if (typeof node !== "object") return undefined;
    node = node[segment];
  }
  return node;
}

/** i18next appends a plural suffix, so the bare key need not exist alone. */
function has(tree: Tree, key: string): boolean {
  return (
    resolve(tree, key) !== undefined ||
    resolve(tree, `${key}_other`) !== undefined
  );
}

function leaves(node: string | Tree, prefix = ""): string[] {
  if (typeof node !== "object") return [prefix];
  return Object.entries(node).flatMap(([key, value]) =>
    leaves(value, prefix === "" ? key : `${prefix}.${key}`),
  );
}

const BUNDLES: Record<string, Tree> = { en, nl };

describe("translations", () => {
  it("reads the sources it is meant to be checking", () => {
    // A glob that matched nothing would make every assertion below vacuous.
    expect(Object.keys(SOURCES).length).toBeGreaterThan(50);
    expect(staticKeys().length).toBeGreaterThan(100);
  });

  it("covers every language the site is built for", () => {
    expect(Object.keys(BUNDLES).sort()).toEqual(
      [...SUPPORTED_LANGUAGES].sort(),
    );
  });

  it.each(Object.keys(BUNDLES))("resolves every static key in %s", (locale) => {
    const bundle = BUNDLES[locale];
    expect(bundle).toBeDefined();
    if (bundle === undefined) return;

    const missing = staticKeys()
      .filter(({ key }) => !has(bundle, key))
      .map(({ file, key }) => `${file}: ${key}`);

    // Named in the failure so the fix is the message, not a bisect.
    expect(missing).toEqual([]);
  });

  it("keeps every language carrying the same keys", () => {
    const reference = leaves(en).sort();

    for (const [locale, bundle] of Object.entries(BUNDLES)) {
      expect({ locale, keys: leaves(bundle).sort() }).toEqual({
        locale,
        keys: reference,
      });
    }
  });
});
