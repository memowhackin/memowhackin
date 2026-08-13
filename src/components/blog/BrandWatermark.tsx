import { LogoMark } from "@/components/common/Logo";

/**
 * The brand mark held behind a blog page while the reader scrolls.
 *
 * Fixed rather than scrolled: the mark belongs to the page, not to a point in
 * the article, so it stays put and the content travels over it. It sits at a
 * whisper of the accent, the treatment the lead card on the index used to
 * carry on its own, and is clipped to the viewport so it can never widen the
 * page.
 *
 * It is one mark per page by design. Two of these competing, one fixed and one
 * pinned inside a card, read as a printing error rather than as a watermark.
 */
export function BrandWatermark() {
  return (
    <div
      aria-hidden="true"
      data-testid="blog-watermark"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <LogoMark className="text-lavender/[0.035] absolute -right-[8%] -bottom-[12%] w-[34rem] lg:w-[46rem]" />
    </div>
  );
}
