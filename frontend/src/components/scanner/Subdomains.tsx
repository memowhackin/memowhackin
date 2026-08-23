import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";

/*
 * Every hostname the target carries, enumerated from Certificate Transparency.
 *
 * This is passive: CT is a public, append-only log of every certificate issued
 * since 2018, so reading it maps a domain's names without sending a single
 * packet to the target. Nothing here is guessed or requested from the site.
 *
 * The apex is pulled to the front and flagged, and every other name is set with
 * its shared suffix dimmed, so the part that is actually different, the label
 * that tells the reader what the host is for, is the part that stands out.
 */

/** The apex is the shortest name; everything else sits under it. */
function apexOf(hosts: readonly string[]): string {
  return hosts.reduce(
    (shortest, host) => (host.length < shortest.length ? host : shortest),
    hosts[0] ?? "",
  );
}

/** Split a host into its own label and the shared apex suffix. */
function split(host: string, apex: string): { label: string; suffix: string } {
  if (host === apex) return { label: host, suffix: "" };
  if (host.endsWith(`.${apex}`)) {
    return {
      label: host.slice(0, host.length - apex.length - 1),
      suffix: `.${apex}`,
    };
  }
  return { label: host, suffix: "" };
}

/** Above this, the tail is folded behind a "+N more" toggle by default. */
const VISIBLE = 20;

export function Subdomains({ hosts }: { hosts: readonly string[] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (hosts.length === 0) return null;

  const apex = apexOf(hosts);
  const sorted = [...hosts].sort((a, b) => {
    if (a === apex) return -1;
    if (b === apex) return 1;
    return a.localeCompare(b);
  });

  // A long estate is folded so the section does not run the page to a mile.
  // The apex sorts first, so it is always in the visible head.
  const foldable = sorted.length > VISIBLE;
  const shown = foldable && !expanded ? sorted.slice(0, VISIBLE) : sorted;
  const remaining = sorted.length - VISIBLE;

  return (
    <section data-testid="scan-hosts" className={SECTION_SHELL}>
      <SectionHeading
        id="hosts"
        title={t("scanner.report.hostsTitle")}
        count={String(hosts.length)}
      >
        {t("scanner.report.hostsBody")}
      </SectionHeading>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((host) => {
          const isApex = host === apex;
          const { label, suffix } = split(host, apex);

          return (
            <li
              key={host}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                isApex
                  ? "bg-lavender/10 ring-1 ring-lavender/25"
                  : "glass hover:brightness-125",
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "size-1.5 shrink-0 rounded-full",
                  isApex ? "bg-lavender" : "bg-indigo-bright",
                )}
              />
              <span className="min-w-0 flex-1 truncate font-mono text-sm">
                <span className="text-mist/90">{label}</span>
                <span className="text-mist/40">{suffix}</span>
              </span>
              {isApex && (
                <span className="text-lavender/70 shrink-0 text-xs">
                  {t("scanner.report.hostsApex")}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {foldable && (
        <button
          type="button"
          onClick={() => {
            setExpanded((open) => !open);
          }}
          data-testid="scan-hosts-toggle"
          className="glass text-mist/70 hover:text-mist focus-visible:outline-lavender group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-fit"
        >
          {expanded
            ? t("scanner.report.hostsShowLess")
            : t("scanner.report.hostsShowMore", { count: remaining })}
          <ChevronDown
            aria-hidden="true"
            className={clsx(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </section>
  );
}
