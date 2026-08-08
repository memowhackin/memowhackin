import clsx from "clsx";

interface SectionStripesProps {
  /**
   * `dark` — the muted band between the showcase and the skyline.
   * `bright` — the lavender band that opens the "Get hacked" section.
   */
  tone?: "dark" | "bright";
  className?: string;
}

/*
 * The two exports are not the same size — the dark band came out of Figma at
 * 2x — so each carries its own intrinsic dimensions. Sharing one hard-coded
 * pair described the dark band as 1920×129 when it is really 3840×376, which
 * reserved the wrong space for it before it loaded.
 */
const sources: Record<
  "dark" | "bright",
  { src: string; width: number; height: number }
> = {
  dark: { src: "/assets/section-stripes.webp", width: 3840, height: 376 },
  bright: {
    src: "/assets/section-stripes-bright.webp",
    width: 1920,
    height: 129,
  },
};

/**
 * The full-bleed gradient stripe band the design uses to change key between
 * sections. Purely decorative, so it is hidden from assistive tech.
 */
export function SectionStripes({
  tone = "dark",
  className,
}: SectionStripesProps) {
  return (
    <div
      className={clsx("bg-ink leading-none", className)}
      data-testid={`section-stripes-${tone}`}
      aria-hidden="true"
    >
      <img
        src={sources[tone].src}
        alt=""
        width={sources[tone].width}
        height={sources[tone].height}
        loading="lazy"
        /* Cover, not fill: the band is drawn as diagonal stripes, and stretching
           two differently proportioned exports into one strip height skewed
           them to different angles. */
        className="h-10 w-full object-cover sm:h-12 lg:h-16"
      />
    </div>
  );
}
