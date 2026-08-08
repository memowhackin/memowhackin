import clsx from "clsx";

interface SectionStripesProps {
  /**
   * `dark` — the muted band between the showcase and the skyline.
   * `bright` — the lavender band that opens the "Get hacked" section.
   */
  tone?: "dark" | "bright";
  className?: string;
}

const sources: Record<"dark" | "bright", string> = {
  dark: "/assets/section-stripes.webp",
  bright: "/assets/section-stripes-bright.webp",
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
        src={sources[tone]}
        alt=""
        width={1920}
        height={129}
        loading="lazy"
        className="h-10 w-full object-fill sm:h-12 lg:h-16"
      />
    </div>
  );
}
