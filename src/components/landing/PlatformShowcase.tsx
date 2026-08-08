import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useReveal } from "@/components/common/useReveal";
import { sectionIds } from "@/config/site";

/**
 * Partner marks under the lead paragraph. Heights are the Figma heights, so the
 * marks keep their drawn proportions instead of being forced to one size.
 */
const partners = [
  {
    key: "trendMicro",
    name: "Trend Micro",
    src: "/assets/logo-trendmicro.svg",
    width: 81,
    height: 17,
  },
  {
    key: "checkPoint",
    name: "Check Point",
    src: "/assets/logo-checkpoint.svg",
    width: 143,
    height: 21,
  },
  {
    key: "algotech",
    name: "Algotech",
    src: "/assets/logo-algotech.svg",
    width: 109,
    height: 25,
  },
  {
    key: "fortinet",
    name: "Fortinet",
    src: "/assets/logo-fortinet.svg",
    width: 112,
    height: 13,
  },
] as const;

/**
 * Capability tags floating over the constellation, as fractions of the
 * graphic's own box.
 *
 * The frame draws that box 1086 square, running from x=-310 to x=776 on the
 * canvas, and scatters the tags across it. Held at the drawn radius they landed
 * out where the graph has already faded to nothing, so each one read as a chip
 * dropped on empty background rather than as a node on the graph. They are
 * pulled in to sit on the dense body of the constellation, spaced around the
 * brand mark at its centre.
 *
 * The vertical band is deliberately narrow. The box is square and grows with the
 * viewport while the section's height is set by the copy beside it, so on a wide
 * screen only the middle slice of the box is on screen at all — at 2560 that is
 * the middle 47% of it, and a tag drawn at the frame's radius was cut in half by
 * the section's own edge.
 */
const tags = [
  {
    key: "apiTesting",
    label: "platform.tags.apiTesting",
    position: "left-[66%] top-[33%]",
  },
  {
    key: "credentials",
    label: "platform.tags.credentials",
    position: "left-[71%] top-[60%]",
  },
  {
    key: "pentesting",
    label: "platform.tags.pentesting",
    position: "left-[44%] top-[67%]",
  },
] as const;

/**
 * The proof section: the constellation graphic beside the lead statement.
 *
 * The frame hangs both off the canvas rather than off a content column: the
 * graph is a 1086 square bleeding 310px past the left edge, and the copy runs
 * from x=776 to x=1784, top-aligned, with the partner block pushed to the foot
 * of an 820px column.
 *
 * Reproduced literally that reads as a hole. The two ends of the copy get
 * pinned to the extremes of a tall box with nothing between them, and the graph
 * sits low and left of it all. So the geometry is kept — square graph, same
 * bleed, same column — but the two are centred against each other and the copy
 * flows normally, which fills the band instead of bracketing it.
 */
export function PlatformShowcase() {
  const { t } = useTranslation();
  const { ref: revealRef, className: revealClassName } =
    useReveal<HTMLDivElement>();

  return (
    <section
      id={sectionIds.about}
      data-testid="platform-showcase"
      className="bg-ink-deep relative w-full overflow-hidden"
    >
      {/* Constellation: 1086 square, bleeding off the left edge of the canvas. */}
      <div className="mx-auto w-full max-w-sm px-6 pt-24 sm:max-w-md sm:px-10 sm:pt-32 lg:absolute lg:top-1/2 lg:left-[-14%] lg:mx-0 lg:w-[52%] lg:max-w-none lg:-translate-y-1/2 lg:px-0 lg:pt-0">
        <div className="relative aspect-square">
          <img
            src="/assets/constellation.webp"
            alt=""
            width={1552}
            height={2172}
            loading="lazy"
            aria-hidden="true"
            className="size-full object-cover mix-blend-screen"
            /*
             * Radii of 50% reach exactly the edges of the box, so the screen
             * blend has faded out completely by the time it gets there and
             * leaves no rectangle behind.
             *
             * The solid core runs to 30% rather than 15%: the graph is the only
             * thing carrying the left half of this section, and starting the
             * falloff a sixth of the way out left it a faint smudge with three
             * bright tags sitting on top of it.
             */
            style={{
              maskImage:
                "radial-gradient(50% 50% at 50% 50%, #000 30%, transparent 100%)",
            }}
          />

          {/*
            The brand mark at the centre of the graph — node 83:41738, which the
            frame calls a "Btn": a 150 disc in `ink-deep` behind a 6px edge in
            `indigo-bright` at 74%, carrying a 25px blur at 18px of spread in
            the same colour at 70%. That glow is what seats the mark in the
            constellation; without it the disc reads as a sticker laid on top.

            It had a 1px lavender ring and a much wider, fainter wash in
            `indigo` — 80px of blur at 24px spread — which is a different thing
            altogether: too diffuse to bloom and too dim to see. The glyph is
            40.2% of the disc, as drawn, and the edge steps down on narrow
            viewports where 6px on a 40px disc would be a third of it.
          */}
          <span
            className="bg-ink-deep absolute top-[47.9%] left-[52.7%] flex aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[0.1875rem] border-[#6046cabd] shadow-[0_0_1.5625rem_1.125rem_#6046cab3] sm:border-[0.25rem] lg:border-[0.375rem]"
            aria-hidden="true"
          >
            <LogoMark className="text-lavender w-[40.2%]" />
          </span>

          {tags.map((tag) => (
            <span
              key={tag.key}
              data-testid={`platform-tag-${tag.key}`}
              className={clsx(
                // A wrapped capability tag reads as a broken label, so they
                // stay on one line and sit far enough inside the graphic that
                // the section's clipped edges never cut one in half.
                //
                // Same chip as the agent alerts over the skyline — the frame
                // draws both from its "Workflows" component, and they had
                // drifted into two different chips here.
                "bg-lavender text-indigo-deep absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.3125rem] rounded-md border border-[#6b728033] py-2.5 pr-3 pl-2 text-sm leading-5 font-medium whitespace-nowrap shadow-[0_0.0625rem_0.0625rem_rgba(74,86,99,0.1),0_0.375rem_0.4375rem_rgba(74,86,99,0.08)]",
                tag.position,
              )}
            >
              <span
                className="bg-indigo-deep size-2 shrink-0"
                aria-hidden="true"
              />
              {t(tag.label)}
            </span>
          ))}
        </div>
      </div>

      {/* Copy column: x=776 to x=1784 on the canvas, set in normal flow. */}
      <div
        ref={revealRef}
        /*
          The lead-in is deliberately long. The hero's panel dissolves into this
          section's own background, so there is no colour seam to mark the join —
          which meant the statement started the moment the screenshot faded out
          and read as though it had been cut off the section above. The extra
          height is the transition.

          The frame leaves 200px of clear ground between the foot of the hero
          and the top of "We combine the expertise…", and the hero above this is
          still dissolving through the last of that gap, so the run-in is longer
          again here than the frame's own number: the statement should arrive
          well after the screenshot has finished going, not as it goes.
        */
        className={clsx(
          "flex flex-col gap-10 px-6 pt-20 pb-16 sm:gap-12 sm:px-10 sm:pt-28 sm:pb-24 lg:ml-[40.4%] lg:w-[52.5%] lg:gap-14 lg:px-0 lg:pt-64 lg:pb-28 xl:pt-80 xl:pb-32",
          revealClassName,
        )}
      >
        {/*
          The section is a named destination in the header nav ("About us") and
          had no heading at all, so anyone moving through the page by headings
          skipped from the hero straight to the skyline. It doubles as the visual
          start the band was missing.
        */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {/*
            The same badge the services section is headed with. As a bare mono
            eyebrow this was the one section opening in a different voice from
            the rest of the page, and at 14px it sat well under the weight of
            the statement it introduces.
          */}
          <SectionBadge data-testid="platform-badge">
            {t("platform.eyebrow")}
          </SectionBadge>

          <p className="text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]">
            <span className="text-mist">{t("platform.leadStrong")}</span>{" "}
            <span className="text-mist/60">{t("platform.leadMuted")}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-lavender max-w-sm text-base leading-[1.4] sm:text-lg">
            {t("platform.poweredBy")}
          </p>

          <ul className="flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
            {partners.map((partner) => (
              <li key={partner.key}>
                <img
                  src={partner.src}
                  alt={t("platform.partnerAlt", { name: partner.name })}
                  width={partner.width}
                  height={partner.height}
                  loading="lazy"
                  className="w-auto"
                  style={{ height: `${(partner.height / 16).toString()}rem` }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
