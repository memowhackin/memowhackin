import { describe, expect, it } from "vitest";
import { mediaPath } from "./media.js";
import { readMinutes } from "./readTime.js";
import { referencedImages } from "./serialize.js";
import { safeSlug, slugify } from "./slug.js";

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
