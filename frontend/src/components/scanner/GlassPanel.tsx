import clsx from "clsx";
import type { ReactNode } from "react";

/*
 * The shell the large scanner surfaces sit in: the scanning console, the
 * feature figures, the image gallery. It is just the shared `glass` border
 * around a rounded box; the interior is the page. See the `glass` utility in
 * index.css.
 */
export function GlassPanel({
  className,
  innerClassName,
  children,
  ref,
}: {
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  /** Forwarded to the outer frame, so a figure can observe its own arrival. */
  ref?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={ref}
      className={clsx("glass rounded-[1.75rem]", className, innerClassName)}
    >
      {children}
    </div>
  );
}
