import { describe, expect, it } from "vitest";
import { mediaPath } from "./media.js";
import { readMinutes } from "./readTime.js";
import { referencedImages } from "./serialize.js";
import {
  buildSlug,
  MAX_SLUG_LENGTH,
  safeSlug,
  slugify,
  slugSuffix,
} from "./slug.js";

const ID = "9a6a4a3a-8302-4c1e-9b77-2f5d6e7a8b90";
const OTHER_ID = "11111111-2222-4333-8444-555555555555";

/** A `taken` probe over a fixed set of slugs. */
function taken(...used: string[]) {
  return (candidate: string) => Promise.resolve(used.includes(candidate));
}

const free = taken();

describe("slugify", () => {
  it("matches the slugs the file-based blog produced", () => {
    expect(slugify("What is CTEM? The five stages explained")).toBe(
      "what-is-ctem-the-five-stages-explained",
    );
  });

  it("folds accents and collapses punctuation", () => {
    expect(slugify("Bèta — release!!")).toBe("beta-release");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  ...hello...  ")).toBe("hello");
  });

  it("ignores case, so two spellings of one title agree", () => {
    expect(slugify("PRACTICAL Guide FOR x")).toBe(
      slugify("practical guide for X"),
    );
  });

  it("emits nothing outside [a-z0-9-]", () => {
    // The public lookup runs the requested slug through safeSlug, which strips
    // to ASCII. A slug that does not survive that round trip is a post no URL
    // can reach, which is how a Cyrillic title used to become unreachable.
    for (const title of [
      "Кибербезопасность",
      "日本語のタイトル",
      "Sécurité des données — ça marche",
      "C++ & C#: what's the difference?",
      "../../etc/passwd",
    ]) {
      const slug = slugify(title);
      expect(safeSlug(slug)).toBe(slug);
      expect(slug).not.toMatch(/[^a-z0-9-]/);
    }
  });

  it("returns nothing when a title has nothing to transliterate", () => {
    // buildSlug is what turns this into a usable URL; slugify only reports it.
    for (const title of ["🔒🔥", "!!! ??? ***", "", "   ", "日本語"]) {
      expect(slugify(title)).toBe("");
    }
  });

  it("caps length without splitting the last word or trailing a hyphen", () => {
    const slug = slugify("The Quick Brown Fox ".repeat(20));
    expect(slug.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expect(slug).not.toMatch(/-$/);
    expect(slug.endsWith("fox")).toBe(true);
  });

  it("caps a single unbroken word too", () => {
    expect(slugify("a".repeat(300))).toHaveLength(MAX_SLUG_LENGTH);
  });
});

describe("buildSlug", () => {
  it("uses the readable form when nothing else claims it", async () => {
    expect(await buildSlug(ID, "Practical Guide for X", free)).toBe(
      "practical-guide-for-x",
    );
  });

  it("gives a duplicate title its own address", async () => {
    const first = await buildSlug(ID, "Practical Guide for X", free);
    const second = await buildSlug(
      OTHER_ID,
      "Practical Guide for X",
      taken(first),
    );

    expect(second).not.toBe(first);
    expect(second).toBe(`practical-guide-for-x-${slugSuffix(OTHER_ID)}`);
  });

  it("derives the suffix from the post id, so it never drifts", async () => {
    // Re-saving a post must not move it. Two builds of the same row agree
    // because the suffix comes from its primary key, not from a fresh random.
    const once = await buildSlug(ID, "Practical Guide for X", taken("x"));
    const again = await buildSlug(ID, "Practical Guide for X", taken("x"));
    expect(again).toBe(once);
  });

  it("keeps three posts sharing a title distinct", async () => {
    const a = await buildSlug(ID, "Same Title", free);
    const b = await buildSlug(OTHER_ID, "Same Title", taken(a));
    const c = await buildSlug(
      "77777777-8888-4999-8aaa-bbbbbbbbbbbb",
      "Same Title",
      taken(a, b),
    );
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it("still produces a URL when the title transliterates to nothing", async () => {
    for (const title of ["🔒🔥", "!!!", "日本語のタイトル"]) {
      const slug = await buildSlug(ID, title, free);
      expect(slug).toBe(`post-${slugSuffix(ID)}`);
      expect(slug).toMatch(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/);
    }
  });

  it("leaves room for the suffix instead of overflowing the column", async () => {
    const slug = await buildSlug(ID, "The Quick Brown Fox ".repeat(20), () =>
      Promise.resolve(true),
    );
    expect(slug.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expect(slug.endsWith(slugSuffix(ID))).toBe(true);
  });

  it("always satisfies the shape the database enforces", async () => {
    const shape = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    for (const title of [
      "Practical Guide for X",
      "🔒🔥",
      "-leading-and-trailing-",
      "a".repeat(300),
      "Кибербезопасность",
      "C++ & C#",
    ]) {
      expect(await buildSlug(ID, title, free)).toMatch(shape);
      expect(await buildSlug(ID, title, () => Promise.resolve(true))).toMatch(
        shape,
      );
    }
  });
});

describe("safeSlug", () => {
  it("removes anything that could escape a path", () => {
    expect(safeSlug("../../etc/passwd")).toBe("etcpasswd");
    expect(safeSlug("a/b.json")).toBe("abjson");
  });
});

describe("readMinutes", () => {
  it("ignores markup and rounds up at 200 words a minute", () => {
    const body = `<p>${"word ".repeat(201)}</p>`;
    expect(readMinutes(body)).toBe(2);
  });

  it("never returns zero", () => {
    expect(readMinutes("<p>short</p>")).toBe(1);
  });
});

describe("referencedImages", () => {
  it("collects each uploaded file once, sorted", () => {
    const body =
      '<img src="/api/public/media/b.webp">' +
      '<img src="/api/public/media/a.webp">' +
      '<img src="/api/public/media/b.webp">';
    expect(referencedImages(body)).toEqual(["a.webp", "b.webp"]);
  });

  it("still sees images referenced by the legacy path", () => {
    // Bodies written before the CMS became the runtime source store
    // /media/blog/<file>; both forms name the same upload.
    expect(
      referencedImages(
        '<img src="/media/blog/old.webp"><img src="/api/public/media/new.webp">',
      ),
    ).toEqual(["new.webp", "old.webp"]);
  });

  it("ignores images hosted elsewhere", () => {
    expect(referencedImages('<img src="https://evil.test/x.webp">')).toEqual(
      [],
    );
  });
});

describe("mediaPath", () => {
  it("rejects traversal and anything that is not a generated filename", () => {
    expect(mediaPath("../../etc/passwd")).toBeUndefined();
    expect(mediaPath("a/b.webp")).toBeUndefined();
    expect(mediaPath("shell.php")).toBeUndefined();
    expect(mediaPath("x.webp.php")).toBeUndefined();
  });

  it("accepts a generated filename", () => {
    expect(mediaPath("0f9c2b1a-4d3e.webp")).toContain("0f9c2b1a-4d3e.webp");
  });
});
