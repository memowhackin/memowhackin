import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { GlassPanel } from "@/components/scanner/GlassPanel";

/*
 * The four figures beside the scanner's feature sections.
 *
 * Each one loops a single gesture that is the check itself: a certificate
 * chain assembling, a probe running the length of a DNS record and returning a
 * verdict, a sweep travelling a list of discovered hosts, a character being
 * substituted in a domain name.
 *
 * There is almost no writing in them on purpose. The prose beside each figure
 * already explains the check, so a figure that repeats it in smaller type is
 * two labels for one idea. What is left is the only text that cannot be
 * inferred from the drawing: hostnames, record names, and the substituted
 * character. No captions, no headings, no status words.
 *
 * The worked example is `acmecorp.com`, the long-standing stand-in for a
 * fictional company. The formats, record names and homoglyph substitutions are
 * exactly what this scanner produces; the subject is a placeholder, and no
 * finding shown here describes any real organisation.
 *
 * Everything animated sits behind `motion-safe`. A reader who has asked for
 * less motion gets the resting state, which is the finished state and never an
 * empty box.
 */

/**
 * True once the element has been scrolled into view.
 *
 * Starts true where there is no observer, so the figure is never left in its
 * pre-animation state on a browser that cannot tell us when it appears.
 */
function useInView<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (element === null || seen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [seen]);

  return [ref, seen];
}

/** Uniform stage, so all four figures line up down the page. */
function Stage({
  children,
  className,
  stageRef,
}: {
  children: ReactNode;
  className?: string;
  stageRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <GlassPanel
      ref={stageRef}
      className="w-full"
      innerClassName={clsx(
        "relative flex min-h-[17rem] items-center justify-center overflow-hidden p-6 sm:min-h-[20rem] sm:p-8",
        className,
      )}
    >
      {children}
    </GlassPanel>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Transport: the certificate chain assembling, root to leaf.
 *
 * Three plates slide into register in order. The only writing is the
 * negotiated protocol and the days left on the leaf, because those are the two
 * facts the drawing cannot carry by itself.
 */
export function TransportArt() {
  const plates = [
    { key: "root", left: "0rem", top: "0rem", tone: "muted", delay: 0 },
    {
      key: "intermediate",
      left: "2.25rem",
      top: "2rem",
      tone: "mid",
      delay: 260,
    },
    { key: "leaf", left: "4.5rem", top: "4rem", tone: "lead", delay: 520 },
  ] as const;

  return (
    <Stage>
      <div className="relative h-[13rem] w-[15rem] sm:h-[14.5rem] sm:w-[17rem]">
        {plates.map((plate) => (
          <div
            key={plate.key}
            style={{
              left: plate.left,
              top: plate.top,
              animationDelay: `${String(plate.delay)}ms`,
            }}
            className={clsx(
              "absolute h-[7.5rem] w-[10.5rem] rounded-2xl ring-1 sm:h-[8.5rem] sm:w-[12rem]",
              "motion-safe:animate-plate-in",
              plate.tone === "lead" &&
                "bg-indigo-bright/85 ring-lavender/50 shadow-[0_1rem_2rem_-0.75rem_rgba(0,0,0,0.85)]",
              plate.tone === "mid" && "bg-indigo/70 ring-mist/15",
              plate.tone === "muted" && "bg-indigo-deep/80 ring-mist/10",
            )}
          >
            {plate.tone === "lead" && (
              <div className="flex h-full flex-col justify-between p-4">
                <span className="text-lavender-soft font-mono text-xs">
                  TLS 1.3
                </span>
                <span className="text-mist font-mono text-2xl tabular-nums sm:text-3xl">
                  47
                  <span className="text-lavender-soft/70 ml-1 text-sm">d</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Stage>
  );
}

/**
 * Email authentication: a probe running each record, then its verdict.
 *
 * The bar is the lookup travelling the record; the mark at the end is what
 * came back. Two of the three resolve to a fault, which is the ordinary result
 * and the reason the section exists.
 */
export function EmailAuthArt() {
  const records = [
    { name: "SPF", fault: true, delay: 0 },
    { name: "DMARC", fault: true, delay: 700 },
    { name: "MTA-STS", fault: false, delay: 1400 },
  ];

  return (
    <Stage>
      <div className="flex w-full max-w-sm flex-col gap-8">
        {records.map((record) => (
          <div key={record.name} className="flex items-center gap-4">
            <span className="text-mist/60 w-20 shrink-0 font-mono text-xs sm:w-24 sm:text-sm">
              {record.name}
            </span>

            <span className="bg-mist/8 relative h-0.5 min-w-0 flex-1 rounded-full">
              <span
                style={{ animationDelay: `${String(record.delay)}ms` }}
                className={clsx(
                  "absolute inset-0 origin-left rounded-full motion-safe:animate-record-fill",
                  record.fault ? "bg-ember/80" : "bg-lavender/80",
                )}
              />
            </span>

            <span
              style={{ animationDelay: `${String(record.delay)}ms` }}
              className={clsx(
                "size-2.5 shrink-0 rounded-full motion-safe:animate-record-verdict",
                record.fault ? "bg-ember" : "bg-lavender",
              )}
            />
          </div>
        ))}
      </div>
    </Stage>
  );
}

/**
 * Public surface: a sweep travelling the hosts found in certificate logs.
 *
 * The hostnames are the point of this check and the only text here. Two carry
 * the alert colour, which is what a forgotten host looks like in a real
 * report.
 */
export function SurfaceArt() {
  const [ref, seen] = useInView<HTMLDivElement>();

  const hosts = [
    { name: "acmecorp.com", alert: false },
    { name: "www.acmecorp.com", alert: false },
    { name: "mail.acmecorp.com", alert: false },
    { name: "vpn.acmecorp.com", alert: true },
    { name: "staging.acmecorp.com", alert: false },
    { name: "old-portal.acmecorp.com", alert: true },
  ];

  return (
    <Stage className="justify-start" stageRef={ref}>
      <div className="relative w-full">
        <ul className="flex flex-col gap-4">
          {hosts.map((host, index) => (
            <li
              key={host.name}
              style={
                seen
                  ? { animationDelay: `${String(index * 130)}ms` }
                  : undefined
              }
              className={clsx(
                "flex items-center gap-3",
                // Hidden only while it has not arrived; once seen, reduced
                // motion lands on the finished state rather than nothing.
                seen ? "motion-safe:animate-host-arrive" : "opacity-0",
              )}
            >
              <span
                className={clsx(
                  "size-1.5 shrink-0 rounded-full",
                  host.alert ? "bg-ember" : "bg-indigo-bright",
                )}
              />
              <span
                className={clsx(
                  "truncate font-mono text-sm sm:text-base",
                  host.alert ? "text-mist" : "text-mist/65",
                )}
              >
                {host.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Stage>
  );
}

/**
 * Impersonation: one character of the name being substituted, on a loop.
 *
 * A slot in the middle of the word rolls through four characters that all read
 * as the same letter at a glance. Showing the substitution happen inside the
 * real name is the only way to make the point land, because the whole risk is
 * that the difference is invisible until the variants are stacked.
 */
export function ImpersonationArt() {
  // Latin o, digit zero, Greek omicron, Armenian oh. All four render as the
  // same shape in most faces, which is the entire point of the attack.
  const swaps = ["o", "0", "\u03bf", "\u0585"];

  return (
    <Stage>
      <p className="flex items-center font-mono text-2xl sm:text-4xl">
        <span className="text-mist/70">acmec</span>

        {/*
          A fixed-height window over a vertical strip of the four glyphs. The
          strip rolls and the window crops, so it reads as a mechanical
          substitution rather than a crossfade. That is what the attack is.
        */}
        <span
          aria-hidden="true"
          className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden align-bottom"
        >
          <span className="motion-safe:animate-glyph-roll absolute inset-x-0 top-0 flex flex-col">
            {swaps.map((glyph) => (
              <span
                key={glyph}
                className="text-ember flex h-[1.2em] items-center justify-center"
              >
                {glyph}
              </span>
            ))}
          </span>
        </span>

        <span className="text-mist/70">rp.com</span>
      </p>
    </Stage>
  );
}
