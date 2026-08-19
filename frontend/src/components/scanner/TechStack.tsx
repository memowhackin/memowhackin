import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { TECH_ICON_PATHS } from "@/components/scanner/techIcons";
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

  if (path === undefined) {
    // A monogram, for the handful of brands that publish no mark.
    return (
      <span
        aria-hidden="true"
        className="font-display text-mist/70 grid size-5 shrink-0 place-items-center text-[0.6875rem]"
      >
        {technology.name.slice(0, 2)}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="text-mist/75 group-hover:text-mist size-5 shrink-0 transition-colors"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export function TechStack({
  technologies,
}: {
  technologies: readonly DetectedTechnology[];
}) {
  const { t } = useTranslation();
  if (technologies.length === 0) return null;

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: technologies.filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section data-testid="scan-tech" className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
          {t("scanner.report.stackTitle")}
        </h3>
        <p className="text-mist/70 text-base leading-relaxed text-pretty">
          {t("scanner.report.stackBody")}
        </p>
      </div>

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
            <p className="text-mist/40 shrink-0 pt-2 text-xs sm:w-44">
              {t(`scanner.stackCategories.${group.category}`)}
            </p>

            <ul className="flex flex-wrap gap-2.5">
              {group.items.map((technology) => (
                <li key={technology.id}>
                  {/*
                    A single hairline outline and nothing else. The badge is a
                    container, so it is the quietest one that still groups a
                    mark with its version: no fill, no shadow, no second
                    radius inside it.
                  */}
                  <span
                    data-testid={`tech-${technology.id}`}
                    title={technology.name}
                    className="group border-indigo-deep hover:border-lavender/50 flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
                  >
                    <Mark technology={technology} />

                    {/* The name, for screen readers only. */}
                    <span className="sr-only">{technology.name}</span>

                    <span
                      className={clsx(
                        "text-xs tabular-nums",
                        technology.version === undefined
                          ? "text-mist/30"
                          : "text-mist/70",
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
