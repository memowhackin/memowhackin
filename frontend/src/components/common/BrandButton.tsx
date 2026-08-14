import type { ReactNode } from "react";
import {
  brandButtonClass,
  type BrandButtonSize,
  type BrandButtonVariant,
} from "@/components/common/brandButtonClass";

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

/**
 * The call-to-action used across every landing section. The look itself lives in
 * `brandButtonClass`, which the router links on the error pages share.
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
      className={brandButtonClass({ variant, size, className })}
    >
      {children}
    </a>
  );
}
