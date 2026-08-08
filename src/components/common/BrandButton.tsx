import clsx from "clsx";
import type { ReactNode } from "react";

type BrandButtonVariant = "solid" | "sweep" | "dark" | "ghost";
type BrandButtonSize = "sm" | "md";

interface BrandButtonProps {
  href: string;
  children: ReactNode;
  /**
   * `solid` — lavender block with a small radius (the in-page CTAs).
   * `sweep` — dark-to-lavender gradient pill with the soft indigo halo
   *   (header "Book demo", hero CTA).
   * `dark` — near-black block with a thin indigo edge (the skyline CTA).
   * `ghost` — outlined, for secondary actions.
   */
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  /** External links open in a new tab and get the safe `rel`. */
  external?: boolean;
  className?: string;
  "data-testid": string;
}

const variants: Record<BrandButtonVariant, string> = {
  solid:
    "bg-lavender text-ink-deep rounded-field hover:bg-lavender-soft active:bg-lavender/85",
  sweep:
    "brand-sweep-y border-indigo-deep/30 text-mist rounded-selector border-4 hover:brightness-125 active:brightness-95",
  dark: "bg-ink-deep border-indigo-deep rounded-field border text-white hover:border-lavender/60 hover:bg-indigo-deep/40 active:bg-indigo-deep/70",
  ghost:
    "border-lavender/40 text-mist rounded-selector border hover:border-lavender hover:bg-lavender/10 active:bg-lavender/20",
};

/* Both sizes clear the comfortable touch target on the smallest phones. */
const sizes: Record<BrandButtonSize, string> = {
  sm: "min-h-10 px-5 py-2.5 text-sm",
  md: "min-h-12 px-6 py-3 text-base",
};

/**
 * The call-to-action used across every landing section.
 *
 * `className` cannot hide the button: the base class list sets `inline-flex`,
 * and Tailwind emits `.hidden` ahead of the display utilities, so an unprefixed
 * `hidden` passed in here loses the cascade. Wrap the button in an element that
 * carries the responsive display classes instead.
 */
export function BrandButton({
  href,
  children,
  variant = "solid",
  size = "md",
  external = true,
  className,
  "data-testid": testId,
}: BrandButtonProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      data-testid={testId}
      className={clsx(
        "focus-visible:outline-lavender inline-flex max-w-full items-center justify-center gap-2 text-center leading-normal font-medium text-balance transition focus-visible:outline-2 focus-visible:outline-offset-4",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
