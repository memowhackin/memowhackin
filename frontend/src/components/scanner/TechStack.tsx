import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  TECH_ICON_COLORS,
  TECH_ICON_PATHS,
} from "@/components/scanner/techIcons";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";
import type { DetectedTechnology } from "@/config/scanner";

/*
 * What the site is built on.
 *
 * A badge per technology: the brand mark, and the version beside it. The name
 * is not printed — the mark is the identification, which is what makes the row
 * scannable at a glance and is how every stack list worth reading is set. It
 * is still announced to assistive technology, where a logo is not an
 * identification at all.
 *
 * The version is always shown, including when there is none. "N/A" is a real
 * answer here: it means the target did not state a version, which is mildly
 * good news, and an empty space would read as a rendering fault instead.
 *
 * The three technologies with no published mark (IIS, LiteSpeed, the AWS
 * wordmark) fall back to a monogram, so a badge is never blank.
 */

const CATEGORY_ORDER = [
  "server",
  "cdn",
  "platform",
  "language",
  "framework",
  "ui",
  "analytics",
] as const;

function Mark({ technology }: { technology: DetectedTechnology }) {
  const path = TECH_ICON_PATHS[technology.id];
  const colour = TECH_ICON_COLORS[technology.id];

  if (path === undefined) {
    /*
     * A monogram, for the handful of brands that publish no single-path mark.
     * It takes the brand colour too, so a badge never falls back to grey
     * beside coloured neighbours and read as the one that failed to load.
     */
    return (
      <span
        aria-hidden="true"
        style={colour === undefined ? undefined : { color: colour }}
        className="font-display grid size-5 shrink-0 place-items-center text-[0.6875rem] font-medium"
      >
        {technology.name.slice(0, 2)}
      </span>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <path d={path} fill={colour ?? "currentColor"} />
    </svg>
  );
}

export function TechStack({
  technologies,
}: {
  technologies: readonly DetectedTechnology[];
}) {
  const { t } = useTranslation();

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: technologies.filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section data-testid="scan-tech" className={SECTION_SHELL}>
      <SectionHeading
        id="stack"
        title={t("scanner.report.stackTitle")}
        count={
          technologies.length === 0 ? undefined : String(technologies.length)
        }
      >
        {t("scanner.report.stackBody")}
      </SectionHeading>

      {/*
        Nothing detected is a result, not an absence. Returning null made the
        whole section disappear, which reads as a feature that failed rather
        than as a site that volunteers little about itself — and volunteering
        little is the better posture, so it is worth saying out loud.
      */}
      {groups.length === 0 && (
        <p className="text-mist/60 max-w-prose text-base leading-relaxed">
          {t("scanner.report.stackEmpty")}
        </p>
      )}

      {/*
        Label beside its badges from `sm` up, rather than stacked above them.
        Stacked, three detected technologies took six rows and most of the
        section was empty label lines; set as a two-column list it reads as a
        compact table and stays that way when a site turns up twenty.
      */}
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div
            key={group.category}
            className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <p className="text-mist/50 shrink-0 pt-2 text-sm sm:w-44">
              {t(`scanner.stackCategories.${group.category}`)}
            </p>

            <ul className="flex flex-wrap gap-2.5">
              {group.items.map((technology) => (
                <li key={technology.id}>
                  {/*
                    A filled chip rather than a hairline outline. A coloured
                    mark needs a surface under it or it floats on the page,
                    and the fill is what makes a run of these read as a set of
                    badges instead of a row of loose glyphs.
                  */}
                  <span
                    data-testid={`tech-${technology.id}`}
                    title={technology.name}
                    className="glass flex items-center gap-2.5 rounded-xl px-3 py-2 transition hover:brightness-125"
                  >
                    <Mark technology={technology} />

                    {/* The name, for screen readers only. */}
                    <span className="sr-only">{technology.name}</span>

                    <span
                      className={clsx(
                        "font-mono text-sm tabular-nums",
                        technology.version === undefined
                          ? "text-mist/35"
                          : "text-mist/80",
                      )}
                    >
                      {technology.version ?? t("scanner.report.versionUnknown")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
