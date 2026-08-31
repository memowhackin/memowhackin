import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import {
  AsideShot,
  BleedShot,
  ShowcaseShot,
  StackShot,
  StepShot,
  TriptychShot,
} from "@/components/argus/ArgusShots";
import type { ArgusSection } from "@/config/argus";

/*
 * The section vocabulary the ARGUS pages are composed from.
 *
 * The prose devices are the home page's: a centred label, heading and paragraph
 * to open a section, columns of short entries under a centred heading, a
 * numbered walk. The imagery is not shared at all, on purpose. Each page shows
 * the portal the way its own screen asks for (see `ArgusShots`), so the six
 * read as one product without any two of them looking like the same layout with
 * different words in it.
 */

interface SectionProps {
  page: string;
  section: ArgusSection;
}

/** The centred label and heading most sections open on. */
function Head({
  base,
  heading,
  align = "center",
}: {
  base: string;
  heading?: boolean;
  align?: "center" | "start";
}) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
      )}
    >
      <p className="eyebrow text-lavender/70">{t(`${base}.eyebrow`)}</p>
      {heading === true && (
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(`${base}.title`)}
        </h2>
      )}
    </div>
  );
}

/** Centred label, heading and copy. */
function Statement({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "statement") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="py-14 lg:py-20"
    >
      <div
        ref={ref}
        className={clsx(
          "mx-auto flex max-w-3xl flex-col items-center gap-5 text-center",
          className,
        )}
      >
        <p className="eyebrow text-lavender/70">{t(`${base}.eyebrow`)}</p>

        {section.heading === true && (
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl lg:text-4xl">
            {t(`${base}.title`)}
          </h2>
        )}

        <div className="text-mist/75 flex flex-col gap-4 text-base leading-relaxed text-pretty sm:text-lg">
          <p>{t(`${base}.p1`)}</p>
          {section.paragraphs === 2 && <p>{t(`${base}.p2`)}</p>}
        </div>
      </div>
    </SectionShell>
  );
}

/** Centred copy over one wide screen. */
function Showcase({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "showcase") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col items-center gap-10 py-14 lg:gap-14 lg:py-20"
    >
      <div
        ref={ref}
        className={clsx(
          "mx-auto flex max-w-3xl flex-col items-center gap-5 text-center",
          className,
        )}
      >
        <p className="eyebrow text-lavender/70">{t(`${base}.eyebrow`)}</p>
        <h2 className="font-display text-service text-mist font-normal text-balance">
          {t(`${base}.title`)}
        </h2>
        <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${base}.p1`)}
        </p>
      </div>

      <ShowcaseShot page={page} shot={section.shot} />
    </SectionShell>
  );
}

/** Copy beside a queue and the item opened from it. */
function Stack({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "stack") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="overflow-x-clip bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24"
    >
      <div ref={ref} className={clsx("flex flex-col gap-5", className)}>
        <Head base={base} align="start" />
        <h2 className="font-display text-service text-mist font-normal text-balance">
          {t(`${base}.title`)}
        </h2>
        <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
          {t(`${base}.p1`)}
        </p>
      </div>

      <StackShot page={page} front={section.front} back={section.back} />
    </SectionShell>
  );
}

/** Questions in a wide column, the conversation itself in a narrow one. */
function Aside({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "aside") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col gap-10 py-14 lg:py-20"
    >
      <Head base={base} align="start" />

      <div ref={ref} className={className}>
        <AsideShot page={page} shot={section.shot}>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {section.items.map((item) => (
              <div
                key={item}
                data-testid={`argus-asked-${item}`}
                className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
              >
                <dt className="font-display text-mist text-lg font-normal text-balance">
                  {t(`${base}.items.${item}.q`)}
                </dt>
                <dd className="text-mist/70 m-0 text-base leading-relaxed text-pretty">
                  {t(`${base}.items.${item}.a`)}
                </dd>
              </div>
            ))}
          </dl>
        </AsideShot>
      </div>
    </SectionShell>
  );
}

/** Copy with a screen that runs off the page. */
function Bleed({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "bleed") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="overflow-x-clip bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="py-14 lg:py-24"
    >
      <div ref={ref} className={className}>
        <BleedShot page={page} shot={section.shot}>
          <div className="flex flex-col gap-5">
            <Head base={base} align="start" />
            <h2 className="font-display text-service text-mist font-normal text-balance">
              {t(`${base}.title`)}
            </h2>
            <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
              {t(`${base}.p1`)}
            </p>
          </div>
        </BleedShot>
      </div>
    </SectionShell>
  );
}

/** A centred heading over columns of short entries. */
function Grid({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLUListElement>();
  if (section.kind !== "grid") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col items-center gap-10 py-14 lg:gap-14 lg:py-20"
    >
      <Head base={base} heading={section.heading} />

      <ul
        ref={ref}
        className={clsx(
          "grid w-full gap-x-10 gap-y-10",
          section.items.length % 3 === 0
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2",
          className,
        )}
      >
        {section.items.map((item) => (
          <li
            key={item}
            data-testid={`argus-item-${item}`}
            className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
          >
            <span className="font-display text-mist text-lg font-normal text-balance">
              {t(`${base}.items.${item}.title`)}
            </span>
            <span className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
              {t(`${base}.items.${item}.body`)}
            </span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

/** An ordered walk, with the screen inside it where the page asks for that. */
function Steps({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLOListElement>();
  if (section.kind !== "steps") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col items-center gap-10 py-14 lg:py-20"
    >
      <Head base={base} heading={section.heading} />

      <ol
        ref={ref}
        className={clsx("flex w-full max-w-3xl flex-col", className)}
      >
        {section.items.map((item, index) => (
          <li
            key={item}
            data-testid={`argus-step-${item}`}
            className="border-indigo-deep/60 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t py-5 sm:gap-6"
          >
            <span
              aria-hidden="true"
              className="font-display text-lavender/70 pt-0.5 tabular-nums"
            >
              {(index + 1).toString().padStart(2, "0")}
            </span>

            <div className="flex flex-col gap-1.5">
              <span className="font-display text-mist text-lg font-normal">
                {t(`${base}.items.${item}.title`)}
              </span>
              <span className="text-mist/70 text-base leading-relaxed text-pretty">
                {t(`${base}.items.${item}.body`)}
              </span>

              {section.shot !== undefined && section.shotAt === item && (
                <StepShot page={page} shot={section.shot} />
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

/** Three destinations, three frames. */
function Triptych({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "triptych") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col items-center gap-10 py-14 lg:gap-14 lg:py-20"
    >
      <Head base={base} heading={section.heading} />

      <div ref={ref} className={clsx("flex w-full flex-col gap-12", className)}>
        <TriptychShot page={page} shots={section.shots} />

        <ul className="grid w-full gap-x-10 gap-y-8 sm:grid-cols-2">
          {section.items.map((item) => (
            <li
              key={item}
              data-testid={`argus-item-${item}`}
              className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
            >
              <span className="font-display text-mist text-lg font-normal text-balance">
                {t(`${base}.items.${item}.title`)}
              </span>
              <span className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
                {t(`${base}.items.${item}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

/** Where the feature sits against the alternatives. */
function Comparison({ page, section }: SectionProps) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();
  if (section.kind !== "table") return null;

  const base = `argusPages.${page}.${section.key}`;

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`argus-${page}-${section.key}`}
      innerClassName="flex flex-col items-center gap-10 py-14 lg:py-20"
    >
      <p className="eyebrow text-lavender/70">{t(`${base}.eyebrow`)}</p>

      <div ref={ref} className={clsx("w-full overflow-x-auto", className)}>
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <caption className="sr-only">{t(`${base}.caption`)}</caption>

          <thead>
            <tr>
              <th scope="col" className="w-[22%] pb-4" />
              {section.columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={clsx(
                    "px-5 pb-4 text-base font-medium",
                    index === 0 ? "text-mist" : "text-mist/50",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "mb-4 block h-px",
                      index === 0 ? "bg-lavender" : "bg-indigo-deep/60",
                    )}
                  />
                  {t(`${base}.columns.${column}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {section.rows.map((row) => (
              <tr
                key={row}
                data-testid={`argus-row-${row}`}
                className="border-indigo-deep/60 border-t"
              >
                <th
                  scope="row"
                  className="text-mist py-4 pr-5 align-top text-base font-medium text-pretty"
                >
                  {t(`${base}.rows.${row}.label`)}
                </th>

                {section.columns.map((column, index) => (
                  <td
                    key={column}
                    className={clsx(
                      "px-5 py-4 align-top text-base leading-relaxed text-pretty",
                      index === 0
                        ? "bg-indigo-deep/20 text-mist"
                        : "text-mist/55",
                    )}
                  >
                    {t(`${base}.rows.${row}.${column}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}

/** One section, by the kind the page asked for. */
export function ArgusSectionBlock({ page, section }: SectionProps) {
  switch (section.kind) {
    case "statement":
      return <Statement page={page} section={section} />;
    case "showcase":
      return <Showcase page={page} section={section} />;
    case "stack":
      return <Stack page={page} section={section} />;
    case "aside":
      return <Aside page={page} section={section} />;
    case "bleed":
      return <Bleed page={page} section={section} />;
    case "grid":
      return <Grid page={page} section={section} />;
    case "steps":
      return <Steps page={page} section={section} />;
    case "triptych":
      return <Triptych page={page} section={section} />;
    case "table":
      return <Comparison page={page} section={section} />;
  }
}
