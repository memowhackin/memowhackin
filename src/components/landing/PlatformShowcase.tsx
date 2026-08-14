import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { chipClass, chipMarkerClass } from "@/components/common/chipClass";
import { LogoMark } from "@/components/common/Logo";
import { ScrollFillText } from "@/components/common/ScrollFillText";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useReveal } from "@/components/common/useReveal";
import { sectionIds } from "@/config/site";

/**
 * Partner marks under the lead paragraph. Heights are the Figma heights, so the
 * marks keep their drawn proportions instead of being forced to one size.
 */
const partners = [
  {
    key: "strix",
    name: "Strix",
    src: "/assets/logo-strix.svg",
    width: 71,
    height: 20,
  },
  {
    key: "splunk",
    name: "Splunk",
    src: "/assets/logo-splunk.svg",
    width: 68,
    height: 20,
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
 *
 * Measured off the frame, the three sit at 72.3/23.8, 85.1/60.3 and 44.7/67.8 of
 * that box: one upper right, one out on the right flank, one low and left. That
 * triangle is the arrangement — the graph reads as having nodes on three sides
 * rather than a list down one edge — so it is what the offsets below keep.
 *
 * The two on the right are pulled in from the frame's radius, as above. The only
 * other change is the gap between them. The frame has them 7.5% apart, which is
 * 81px on its 1086 box and clears a 32px chip easily; this box is 272px on a
 * small phone, where the same 7.5% is 20px and two 30px chips overlap by 11.
 * Opening that pair to 15% is the least that clears at every width, and it keeps
 * both on the flank they were drawn on.
 */
const tags = [
  {
    key: "apiTesting",
    label: "platform.tags.apiTesting",
    position: "left-[66%] top-[33%]",
  },
  {
    key: "xss",
    label: "platform.tags.xss",
    /*
     * On a phone the drawn 71% puts this chip — the widest of the three —
     * half over the brand mark and out against the section's right edge, so
     * below `lg` it moves to the left flank, under the mark and clear of it.
     */
    position: "left-[32%] top-[60%] lg:left-[71%] lg:top-[57%]",
  },
  {
    key: "sqlInjection",
    label: "platform.tags.sqlInjection",
    position: "left-[44%] top-[72%]",
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
      /*
       * A flex column so `order-last` on the constellation holds below `lg`:
       * the copy reads first on a stacked viewport, the graphic closes the
       * section. Layout is otherwise identical to the block it was.
       */
      className="bg-ink-deep relative flex w-full flex-col overflow-hidden"
    >
      {/*
        Constellation: 1086 square, bleeding off the left edge of the canvas.

        It sits after the copy in the markup on purpose. On a phone the two
        stack in document order, and opening the section on a decorative graph
        pushed the actual statement below the fold — so the words come first
        and the constellation closes the section. From `lg` the graphic is
        absolutely positioned, where source order has no say.

        It stays centred, and the room it needs is bought from the section
        rather than taken out of the graphic.

        The graphic is square and sized off the viewport while the section's
        height is set by the copy beside it, so past about 1400 it is simply
        taller than the section it sits in. Centred, that overflows evenly at
        both ends and costs nothing — the mask has faded the artwork almost to
        nothing out there, so what gets clipped is the last few percent of the
        radius.

        Sliding it down to clear the hero is what broke it. The overflow all
        moved to one end — 318px at 1920 — and the clip stopped cutting faded
        edge and started cutting the body of the graph, which left it ending on
        a hard horizontal line with the third tag gone under it.

        So the clearance comes from the section's own foot instead: `pb` below
        carries enough height that the centred graphic clears the hero by about
        60px at 1440, and the cap keeps it inside that on the widest screens.
        Measured across `lg` and up, the clip never starts before 90% of the
        radius, and all three tags stay in view.

        The bleed is a translate rather than a negative `left` so that it stays
        proportional to the graphic: `-27%` of its own width is the distance the
        frame's `-14%` of a 1920 canvas was, and it holds when the cap bites.

        `lg:p-0`, not just `lg:pt-0`: the element is centred through its own
        box, so any padding left on it at `lg` would shift the artwork off the
        section's midline.
      */}
      <div className="order-last mx-auto w-full max-w-sm px-6 pt-6 pb-20 sm:max-w-md sm:px-10 sm:pt-8 sm:pb-28 lg:absolute lg:top-1/2 lg:left-0 lg:mx-0 lg:w-[52%] lg:max-w-[56rem] lg:-translate-x-[27%] lg:-translate-y-1/2 lg:p-0">
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
              /*
                A wrapped capability tag reads as a broken label, so they stay
                on one line and sit far enough inside the graphic that the
                section's clipped edges never cut one in half. Same chip as the
                agent alerts over the skyline — the frame draws both from its
                "Workflows" component.
              */
              className={chipClass(
                clsx(
                  "absolute inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
                  tag.position,
                ),
              )}
            >
              <span className={chipMarkerClass} aria-hidden="true" />
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

          The run-in also sets the top of the section box the constellation is
          centred in, so the last 2.5rem of it is there for the graphic rather
          than the copy — it pushes the graph a further 1.25rem clear of the
          hero, which is what stops its upper arc crowding the panel above.
        */
        className={clsx(
          "flex flex-col gap-10 px-6 pt-20 pb-4 sm:gap-12 sm:px-10 sm:pt-28 sm:pb-6 lg:ml-[40.4%] lg:w-[52.5%] lg:gap-14 lg:px-0 lg:pt-[13.625rem] lg:pb-[12rem] xl:pt-[17.625rem] xl:pb-[13rem]",
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
            The same badge the services section is headed with, so the two
            sections open in one voice. It is the section's heading rather than
            an ornament above one — this is a named destination in the nav
            ("About us"), and without it anyone moving through the page by
            headings went from the hero straight to the skyline.

            What it costs is 78px above the statement, and the run-in below has
            been shortened by exactly that so the statement itself does not move.
          */}
          <SectionBadge data-testid="platform-badge">
            {t("platform.eyebrow")}
          </SectionBadge>

          {/*
            The statement fills as it is scrolled through rather than arriving
            at two fixed weights. The second sentence used to be muted for good,
            which read as an aside; running the same weight along the whole
            paragraph makes it one statement being read out instead.
          */}
          <p className="text-mist text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]">
            <ScrollFillText>{t("platform.lead")}</ScrollFillText>
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
