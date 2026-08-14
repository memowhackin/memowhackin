import sanitizeHtml from "sanitize-html";

/*
 * The security boundary of this service.
 *
 * Post bodies are rendered on the marketing site with dangerouslySetInnerHTML,
 * and are written by several people through a rich editor that will happily
 * carry whatever HTML someone pasted into it. So bodies are sanitized HERE, on
 * write, and only the sanitized result is stored: the database never holds
 * hostile markup, and every consumer — the static build, the admin preview, a
 * future feed — is safe without having to remember to sanitize.
 *
 * Sanitizing only at render time would leave the payload sitting in the
 * database waiting for the one consumer that forgets.
 */

const ALLOWED_TAGS = [
  "p",
  // h1 is deliberately absent: the page template renders the post title as the
  // document's only h1, and an author-inserted one is an outline bug.
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "b",
  "i",
  "a",
  "img",
  "figure",
  "figcaption",
  "code",
  "pre",
  "br",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
];

/*
 * No `style` anywhere. The editor sizes images with inline styles today; that
 * becomes a data attribute here and is styled by the site's own CSS, because
 * author-controlled CSS is a clickjacking and data-exfiltration surface, not a
 * formatting feature.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    // `rel` has to be allowed here or the transform below adds it and the
    // attribute filter immediately strips it again.
    a: ["href", "title", "rel"],
    // `data-display-width` and `data-align` carry the layout the author chose
    // in the editor. They exist because `style` is stripped below, and if they
    // are not allowed here the arrangement is silently discarded on save.
    img: ["src", "alt", "width", "height", "data-display-width", "data-align"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Relative URLs must survive: uploaded images are stored as
  // /api/public/media/<file>
  // and that exact path is what the static site serves.
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
    }),
  },
  disallowedTagsMode: "discard",
};

/** Sanitize a post body. Idempotent: sanitize(sanitize(x)) === sanitize(x). */
export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}

/**
 * Excerpts render as plain text in cards and as the meta description, so every
 * tag is stripped rather than filtered.
 */
export function sanitizeExcerpt(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}
