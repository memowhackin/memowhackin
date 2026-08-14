import { useMemo } from "react";
import clsx from "clsx";

/*
 * The image panel on a blog card.
 *
 * The posts carry no artwork of their own, so the brand's constellation stands
 * in for all of them. Showing every card the identical crop of it would be the
 * same template problem a repeated flat band has, so the frame each article
 * gets is picked from its slug: a stable position and zoom, different per post,
 * always landing inside the dense middle of the graphic where it reads as a
 * network rather than as empty space.
 */

/** Where the graphic is worth cropping into, as a percentage of its own box. */
const X_ORIGIN = 14;
const X_RANGE = 44;
const Y_ORIGIN = 26;
const Y_RANGE = 38;

/** Zoom steps. Enough spread to change the composition, not the character. */
const ZOOM_BASE = 1.12;
const ZOOM_STEP = 0.09;
const ZOOM_STEPS = 5;

/** A stable integer from the slug, so a re-render never reframes the picture. */
function seedFrom(slug: string): number {
  let hash = 7;
  for (const character of slug) {
    hash = (hash * 31 + character.codePointAt(0)!) % 1000003;
  }
  return hash;
}

interface PostCoverProps {
  slug: string;
  className?: string;
  /**
   * `card` keeps the wash light so small type beside it stays legible.
   * `featured` leans into the accent, since it has the room to carry it.
   */
  tone?: "card" | "featured";
}

export function PostCover({ slug, className, tone = "card" }: PostCoverProps) {
  const frame = useMemo(() => {
    const seed = seedFrom(slug);
    const x = X_ORIGIN + (seed % X_RANGE);
    const y = Y_ORIGIN + ((seed >> 3) % Y_RANGE);
    /*
     * Rounded once, at the end. Adding the base to an already-formatted string
     * concatenates rather than sums, which sent `scale` out as "1.120". CSS
     * read that as two values, so the y axis came through as 0 and the picture
     * collapsed to a line.
     */
    const zoom = ZOOM_BASE + ((seed >> 6) % ZOOM_STEPS) * ZOOM_STEP;

    return {
      objectPosition: `${x.toString()}% ${y.toString()}%`,
      scale: zoom.toFixed(2),
    };
  }, [slug]);

  const featured = tone === "featured";

  return (
    <div
      aria-hidden="true"
      className={clsx("bg-ink-deep relative overflow-hidden", className)}
    >
      <img
        src="/assets/constellation.webp"
        alt=""
        loading="lazy"
        style={{
          objectPosition: frame.objectPosition,
          scale: frame.scale,
        }}
        className="absolute inset-0 size-full object-cover"
      />

      {/* Brand light through the graphic, so it is lit rather than tinted. */}
      <div
        className={clsx(
          "absolute inset-0",
          featured
            ? "bg-[radial-gradient(65%_65%_at_35%_45%,color-mix(in_oklab,var(--color-indigo-bright)_42%,transparent),transparent_72%)]"
            : "bg-[radial-gradient(70%_70%_at_40%_45%,color-mix(in_oklab,var(--color-indigo-bright)_26%,transparent),transparent_75%)]",
        )}
      />

      {/* The picture sinks into the card rather than stopping at a hard edge. */}
      <div className="from-ink-deep absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
    </div>
  );
}
