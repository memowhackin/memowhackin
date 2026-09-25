import clsx from "clsx";

interface SectionStripesProps {
  /**
   * `dark` — the muted band between the showcase and the skyline.
   * `bright` — the lavender band that opens the "Why AssistSec" section.
   */
  tone?: "dark" | "bright";
  className?: string;
}

/*
 * The two exports are not the same size — the dark band came out of Figma at
 * 2x — so each carries its own intrinsic dimensions. Sharing one hard-coded
 * pair described the dark band as 1920×129 when it is really 3840×376, which
 * reserved the wrong space for it before it loaded.
 *
 * `surround` is the colour of the sections either side of the band. The dark
 * band runs between two `ink-deep` sections and the bright one between two
 * `ink` ones; painting both on `ink` put a visibly lighter strip between the
 * showcase and the skyline, which is what made that join read as a seam.
 */
const bands: Record<
  "dark" | "bright",
  {
    src: string;
    width: number;
    height: number;
    surround: string;
    heightClass: string;
  }
> = {
  dark: {
    src: "/assets/section-stripes.webp",
    width: 3840,
    height: 376,
    surround: "bg-ink-deep",
    /* 376/3840 of the width, which is the export's own ratio. */
    heightClass: "h-[clamp(2.5rem,9.79vw,11.75rem)]",
  },
  bright: {
    src: "/assets/section-stripes-bright.webp",
    width: 1920,
    height: 129,
    surround: "bg-ink",
    /* 129/1920. Thinner than the dark band because the artwork is. */
    heightClass: "h-[clamp(1.7rem,6.72vw,8.06rem)]",
  },
};

/**
 * The full-bleed gradient stripe band the design uses to change key between
 * sections. Purely decorative, so it is hidden from assistive tech.
 *
 * The frame draws it 188px tall on a 1920 canvas, so the height is held as that
 * fraction of the viewport rather than as a fixed 4rem: at 4rem it had thinned
 * to a smudge that read as a rendering artefact rather than as a band.
 */
export function SectionStripes({
  tone = "dark",
  className,
}: SectionStripesProps) {
  const band = bands[tone];

  return (
    <div
      className={clsx(band.surround, "leading-none", className)}
      data-testid={`section-stripes-${tone}`}
      aria-hidden="true"
    >
      <img
        src={band.src}
        alt=""
        width={band.width}
        height={band.height}
        loading="lazy"
        /*
         * Each band is held at its own ratio. One height was being used for
         * both, and it was the dark export's — 376/3840 is 9.79% of the width,
         * which is where the 9.8vw came from. The bright export is 129/1920,
         * a third shallower, so that height magnified it about 1.5× and
         * `object-cover` then took a third of its width off the sides. Its bars
         * came out heavy and blunt, and the band read as banding rather than as
         * the run-in it is. At its own ratio nothing is scaled or cropped.
         *
         * Cover rather than fill is still what handles the cap at the top of
         * each clamp: stretching an export to a height its artwork was not
         * drawn for skews the bars to a different angle.
         *
         * No mask. The band is a ramp of bars that start sparse and close up
         * towards the section below, so the artwork already is the fade —
         * feathering the edges cut off the dense end just where it should meet
         * the next section, which is what left a smudge rather than a run-in.
         */
        className={clsx("w-full object-cover", band.heightClass)}
      />
    </div>
  );
}
