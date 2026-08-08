import clsx from "clsx";

export type BrandButtonVariant = "solid" | "sweep" | "dark" | "ghost";
export type BrandButtonSize = "sm" | "md";

const variants: Record<BrandButtonVariant, string> = {
  solid:
    "bg-lavender text-ink-deep rounded-field hover:bg-lavender-soft active:bg-lavender/85",
  /*
   * The frame draws both sweep pills (nodes 246:12066 and 246:12074) at a 40px
   * radius with the gradient running top to bottom, and rings them in blue —
   * with the ring drawn *outside* the pill, not eating into it. That is why the
   * rings are box-shadows and not a border: a 6px border on a 44px pill leaves
   * 32px of it for the label, and the button came out visibly shorter than the
   * frame's. See `sweepRings` for the sizes.
   */
  sweep:
    "brand-sweep-y text-white rounded-selector hover:brightness-125 active:brightness-95",
  /*
   * The frame draws this one (node 83:41767) as a plain dark block with an 8px
   * radius and no outline. It had a 4px radius and an indigo border, which over
   * the skyline's warm sky read as a cut-out rather than a button.
   */
  dark: "bg-ink-deep rounded-lg text-white hover:bg-ink-deep/80 active:bg-ink-deep/90",
  ghost:
    "border-lavender/40 text-mist rounded-selector border hover:border-lavender hover:bg-lavender/10 active:bg-lavender/20",
};

/* Both sizes clear the comfortable touch target on the smallest phones. */
const sizes: Record<BrandButtonSize, string> = {
  sm: "min-h-10 px-5 py-2.5 text-sm leading-normal",
  md: "min-h-12 px-6 py-3 text-base leading-normal",
};

/*
 * The sweep pills are measured off the frame instead, because the two of them
 * are the buttons the design is most specific about.
 *
 * `sm` is the header pill (node 246:12066): 123×35 around 16/24 type with 20px
 * sides, so 5.5px of air above and below the line box. `md` is the hero pill
 * (node 246:12074): 199×44 around 18/26 type with 28px sides, and 8/10 rather
 * than 9/9 — the label sits a hair above centre.
 *
 * 35px is under the comfortable touch target, so `sm` keeps a 44px floor up to
 * the `sm` breakpoint. That is the only width at which this pill is thumbed:
 * the header hides it below `sm` and the mobile menu carries it instead.
 */
const sweepSizes: Record<BrandButtonSize, string> = {
  sm: "min-h-11 px-5 py-[0.34375rem] text-base leading-6 sm:min-h-0",
  md: "min-h-11 px-7 pt-2 pb-2.5 text-lg leading-[1.625rem]",
};

/*
 * The two rings around the sweep pills, drawn outside the button. The header
 * gets a single 4px ring in `indigo-deep`; the hero gets the frame's pair — 6px
 * of `indigo-bright` with a further 8px of the same colour at a tenth of its
 * strength, which is the soft halo around it.
 */
const sweepRings: Record<BrandButtonSize, string> = {
  sm: "shadow-[0_0_0_0.25rem_#2923624d]",
  md: "shadow-[0_0_0_0.375rem_#6046ca4d,0_0_0_0.875rem_#6046ca1a]",
};

/**
 * The call-to-action's class list on its own.
 *
 * `BrandButton` renders an `<a href>`, which the router links and the retry
 * button on the error pages cannot use — they own their own element. They take
 * the look from here instead, so there is one definition of what the site's
 * primary action looks like rather than a copy per page.
 *
 * It lives outside `BrandButton.tsx` because a module that exports both a
 * component and a plain function cannot be hot-reloaded.
 */
export function brandButtonClass({
  variant = "solid",
  size = "md",
  className,
}: {
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  className?: string;
} = {}): string {
  const sweep = variant === "sweep";

  return clsx(
    "focus-visible:outline-lavender inline-flex max-w-full items-center justify-center gap-2 text-center font-medium text-balance transition focus-visible:outline-2 focus-visible:outline-offset-4",
    variants[variant],
    sweep ? sweepSizes[size] : sizes[size],
    sweep && sweepRings[size],
    className,
  );
}
