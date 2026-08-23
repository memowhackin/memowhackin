import { useTranslation } from "react-i18next";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";
import type { WebsiteResult } from "@/config/scanner";

/*
 * The files the site actually serves at a known address.
 *
 * One flat list, not a set of labelled groups: the group headings (Policy,
 * Crawlers, Platform, Config) were more chrome than information for a handful
 * of rows, and the reader does not sort these by category. Each row is the
 * path, its size, and a `200` tag stating the one thing that matters, which is
 * that the file answered rather than 404'd.
 *
 * Only 200 OK is shown. A guarded path (401/403) or a missing one is not
 * something the site is exposing, so it is left out; every row here is a file
 * the site hands to anyone who asks.
 */

/** Bytes as a short figure, or nothing. */
function size(bytes: number | undefined): string | undefined {
  if (bytes === undefined || bytes <= 0) return undefined;
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${String(Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PublishedPaths({ paths }: { paths: WebsiteResult["paths"] }) {
  const { t } = useTranslation();

  const found = paths.entries.filter((entry) => entry.state === "found");
  if (found.length === 0) return null;

  return (
    <section data-testid="scan-paths" className={SECTION_SHELL}>
      <SectionHeading
        id="paths"
        title={t("scanner.report.pathsTitle")}
        count={String(found.length)}
      />

      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {found.map((entry) => {
          const bytes = size(entry.bytes);
          return (
            <li
              key={entry.path}
              className="glass flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition hover:brightness-125"
            >
              <span className="bg-lavender/15 text-lavender shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-medium">
                200
              </span>
              <span className="text-mist/85 min-w-0 flex-1 truncate font-mono text-sm">
                {entry.path}
              </span>
              {bytes !== undefined && (
                <span className="text-mist/45 shrink-0 font-mono text-xs tabular-nums">
                  {bytes}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
