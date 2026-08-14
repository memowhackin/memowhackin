import { describe, expect, it } from "vitest";
import { sanitizeBody, sanitizeExcerpt } from "./sanitize.js";

/*
 * These are the tests that matter most in this service. Post bodies are
 * rendered with dangerouslySetInnerHTML on the public marketing site, so
 * anything that survives sanitizeBody runs in a visitor's browser.
 */

describe("sanitizeBody", () => {
  it("strips script tags entirely", () => {
    const output = sanitizeBody("<p>hi</p><script>alert(1)</script>");
    expect(output).toBe("<p>hi</p>");
    expect(output).not.toContain("alert");
  });

  it("strips event handler attributes", () => {
    const output = sanitizeBody(
      '<img src="/media/blog/a.webp" onerror="alert(1)">',
    );
    expect(output).not.toContain("onerror");
    expect(output).toContain('src="/media/blog/a.webp"');
  });

  it("drops javascript: hrefs but keeps the link text", () => {
    const output = sanitizeBody('<a href="javascript:alert(1)">click</a>');
    expect(output).not.toContain("javascript:");
    expect(output).toContain("click");
  });

  it("removes svg, iframe, object and form", () => {
    const output = sanitizeBody(
      '<svg onload="alert(1)"></svg><iframe src="https://evil.test"></iframe>' +
        "<object data='x'></object><form action='/x'><input></form>",
    );
    expect(output).not.toContain("svg");
    expect(output).not.toContain("iframe");
    expect(output).not.toContain("object");
    expect(output).not.toContain("form");
  });

  it("forces rel on external links", () => {
    const output = sanitizeBody('<a href="https://example.test">x</a>');
    expect(output).toContain('rel="noopener noreferrer nofollow"');
  });

  it("keeps relative image sources, which every published image depends on", () => {
    // If this ever fails, every uploaded image silently disappears from the
    // published site.
    const output = sanitizeBody(
      '<img src="/api/public/media/abc-123.webp" alt="x">',
    );
    expect(output).toContain('src="/api/public/media/abc-123.webp"');
  });

  it("keeps the legacy media path, still present in older bodies", () => {
    // Bodies written before the CMS became the runtime source store
    // /media/blog/<file>; the admin editor upgrades them on next save, but
    // until then they must survive a PATCH untouched.
    const output = sanitizeBody('<img src="/media/blog/abc-123.webp" alt="x">');
    expect(output).toContain('src="/media/blog/abc-123.webp"');
  });

  it("drops style but keeps the data attribute used for image sizing", () => {
    const output = sanitizeBody(
      '<img src="/media/blog/a.webp" style="width:75%" data-display-width="75%">',
    );
    expect(output).not.toContain("style");
    expect(output).toContain('data-display-width="75%"');
  });

  it("drops h1, which the page template owns", () => {
    expect(sanitizeBody("<h1>title</h1><h2>section</h2>")).toBe(
      "title<h2>section</h2>",
    );
  });

  it("keeps the formatting an author actually uses", () => {
    const input =
      "<p>a <strong>b</strong> <em>c</em></p><h2>d</h2><ul><li>e</li></ul>" +
      "<blockquote>f</blockquote><pre><code>g</code></pre>";
    expect(sanitizeBody(input)).toBe(input);
  });

  it("is idempotent", () => {
    const input =
      '<p>x</p><script>alert(1)</script><a href="https://e.test">y</a>';
    const once = sanitizeBody(input);
    expect(sanitizeBody(once)).toBe(once);
  });
});

describe("sanitizeExcerpt", () => {
  it("strips every tag", () => {
    expect(sanitizeExcerpt("<p>hello <b>there</b></p>")).toBe("hello there");
  });

  it("strips script content rather than leaving the source visible", () => {
    expect(sanitizeExcerpt("ok<script>alert(1)</script>")).toBe("ok");
  });
});

describe("image layout attributes", () => {
  /*
   * These carry the size and alignment an author sets in the editor. They exist
   * only because `style` is stripped, so if the allowlist ever loses them the
   * arrangement is discarded on save with nothing to show it happened — which
   * is exactly what used to happen.
   */
  it("keeps the size and alignment the editor writes", () => {
    const output = sanitizeBody(
      '<img src="/media/blog/a.webp" data-display-width="50" data-align="right">',
    );
    expect(output).toContain('data-display-width="50"');
    expect(output).toContain('data-align="right"');
  });

  it("still refuses inline style on an image", () => {
    const output = sanitizeBody(
      '<img src="/media/blog/a.webp" style="width:62%" data-display-width="75">',
    );
    expect(output).not.toContain("style");
    expect(output).toContain('data-display-width="75"');
  });
});
