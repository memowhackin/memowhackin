import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { ScrollFillText } from "@/components/common/ScrollFillText";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { useSeo } from "@/localization/useSeo";
import {
  SERVICE_AREA_SERVED,
  type AwarenessDefinition,
} from "@/config/services";
import { site } from "@/config/site";

/** One subject on the syllabus: what it is called, and what a session does with it. */
function Topic({ topic, index }: { topic: string; index: number }) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 4) * 60,
  });

  return (
    <li
      ref={ref}
      style={style}
      data-testid={`awareness-topic-${topic}`}
      /*
       * Heading beside copy on a hairline, which is the rhythm the about page
       * tells its story in — and deliberately not the bordered grid of icons
       * the two pentest pages list their coverage on. A syllabus is a list of
       * subjects, not a matrix of attack surface, and the page should not have
       * to say so.
       */
      className={clsx(
        "border-indigo-deep/60 grid gap-2 border-t py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 lg:py-8",
        className,
      )}
    >
      <h3 className="font-display text-mist text-xl font-normal text-balance sm:text-2xl">
        {t(`servicePages.awareness.topics.items.${topic}.title`)}
      </h3>

      <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
        {t(`servicePages.awareness.topics.items.${topic}.body`)}
      </p>
    </li>
  );
}

/**
 * Security awareness, as its own page rather than as the pentest template with
 * different words in it.
 *
 * The two pentest pages share a template because they are the same engagement
 * pointed at different targets. This is not that: there is no scope call, no
 * findings, no report to hand over and nothing to retest. It is a programme that
 * runs on people, repeats, and is measured by what they do differently next
 * quarter — so the page is built from the parts of the design system the other
 * two do not use. The filling statement is the about page's; the
 * heading-beside-copy rows are its story rhythm. Nothing new was invented for
 * it, and nothing was borrowed from the pages it should not resemble.
 *
 * What it does share with the pentest pages is the opening and the close: the
 * same centred hero on one action, and the same accordion. Those are the parts
 * a reader crossing between services should recognise.
 */
export function AwarenessPage({ service }: { service: AwarenessDefinition }) {
  const { t } = useTranslation();

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: cycleRef, className: cycleReveal } = useReveal<HTMLDivElement>();
  const { ref: fitRef, className: fitReveal } = useReveal<HTMLDivElement>();

  const faq = useMemo(
    () =>
      service.faqs.map((entry) => ({
        question: t(`servicePages.awareness.faq.items.${entry}.q`),
        answer: t(`servicePages.awareness.faq.items.${entry}.a`),
      })),
    [service, t],
  );

  const serviceSchema = useMemo(
    () => ({
      name: t(`pages.${service.pageKey}.heading`),
      serviceType: service.serviceType,
      areaServed: SERVICE_AREA_SERVED,
    }),
    [service, t],
  );

  useSeo({
    title: t(`pages.${service.pageKey}.title`),
    description: t(`pages.${service.pageKey}.description`),
    path: service.path,
    service: serviceSchema,
    faq,
  });

  return (
    <div data-testid="service-awareness" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      {/* The page opening every route below the home page shares. It is the one
          part that should look the same on all three services: the headline,
          what the service is in a sentence, and one action — no badge over it
          and no ornament under it. */}
      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-hero"
        innerClassName="flex flex-col items-center gap-6 pt-12 pb-16 text-center sm:pt-16 lg:pt-24 lg:pb-24"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`pages.${service.pageKey}.heading`)}
            <span aria-hidden="true" className="text-lavender">
              .
            </span>
          </h1>

          <p className="text-mist/85 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`pages.${service.pageKey}.body`)}
          </p>

          {/*
            One action, as the pentest pages open on. The page has a contact
            link in the header, another in the footer and a whole closing
            section of its own; a second pill beside the first was a choice the
            reader did not need to make in order to get past the fold.

            It stays `nav.bookDemo` rather than taking the pentest pages'
            "Request pentest": this is a training programme, and asking for a
            pentest is not what the button does.
          */}
          <BrandButton
            href={site.bookDemoUrl}
            variant="sweep"
            data-testid="page-book-demo"
            className="mt-2 text-nowrap"
          >
            {t("nav.bookDemo")}
          </BrandButton>
        </div>
      </SectionShell>

      {/*
        The case for the whole service, as one sentence that fills in as it is
        read. The site keeps this device for the things it means most — the
        home page's lead and the about page's manifesto — and the argument for
        awareness training is precisely one sentence long.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-statement"
        innerClassName="flex flex-col gap-6 py-14 lg:py-20"
      >
        <p className="text-mist max-w-[52.5rem] text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]">
          <ScrollFillText>
            {t("servicePages.awareness.statement.body")}
          </ScrollFillText>
        </p>
      </SectionShell>

      {/* The syllabus. */}
      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-topics"
        innerClassName="flex flex-col gap-8 pb-16 lg:gap-10 lg:pb-24"
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t("servicePages.awareness.topics.title")}
          </h2>
          <p className="text-mist/80 max-w-2xl text-base leading-relaxed text-pretty">
            {t("servicePages.awareness.topics.intro")}
          </p>
        </div>

        <ul className="flex flex-col">
          {service.topics.map((topic, index) => (
            <Topic key={topic} topic={topic} index={index} />
          ))}
        </ul>
      </SectionShell>

      {/*
        How a programme runs. Four phases, set as a compact ordered list beside
        its heading rather than as the pentest pages' rail of six — this is a
        loop that repeats, not a route with a destination, and giving it the
        same big numbered stations would have said the opposite.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-cycle"
        innerClassName="pb-16 lg:pb-24"
      >
        <div
          ref={cycleRef}
          className={clsx(
            "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16",
            cycleReveal,
          )}
        >
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
              {t("servicePages.awareness.cycle.title")}
            </h2>
            <p className="text-mist/80 text-base leading-relaxed text-pretty">
              {t("servicePages.awareness.cycle.intro")}
            </p>
          </div>

          <ol className="flex max-w-2xl flex-col gap-5">
            {service.phases.map((phase, index) => (
              <li
                key={phase}
                data-testid={`awareness-phase-${phase}`}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-4"
              >
                {/*
                  A small numeral in the display face, sized to the copy beside
                  it. The other service pages set their step numbers at five
                  times this and give them a whole column; here the number is a
                  marker in a list, which is what keeps the two from reading as
                  the same section twice.
                */}
                <span
                  aria-hidden="true"
                  className="font-display text-lavender text-sm tabular-nums"
                >
                  {(index + 1).toString().padStart(2, "0")}
                </span>

                <p className="text-mist/85 text-base leading-relaxed text-pretty">
                  <span className="text-mist font-medium">
                    {t(`servicePages.awareness.cycle.phases.${phase}.title`)}
                    <span aria-hidden="true" className="text-lavender">
                      .
                    </span>
                  </span>{" "}
                  {t(`servicePages.awareness.cycle.phases.${phase}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </SectionShell>

      {/* What the programme is cut to fit. */}
      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-fit"
        innerClassName="pb-16 lg:pb-24"
      >
        <div
          ref={fitRef}
          className={clsx(
            "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16",
            fitReveal,
          )}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t("servicePages.awareness.fit.title")}
          </h2>

          <div className="flex max-w-2xl flex-col gap-5">
            <p className="text-mist/85 text-base leading-relaxed text-pretty sm:text-lg">
              {t("servicePages.awareness.fit.body")}
            </p>

            <dl className="flex flex-col gap-4">
              {service.tailoring.map((item) => (
                <div
                  key={item}
                  data-testid={`awareness-fit-${item}`}
                  className="border-indigo-deep/60 flex flex-col gap-1 border-l pl-5"
                >
                  <dt className="text-mist text-base font-medium">
                    {t(`servicePages.awareness.fit.items.${item}.title`)}
                  </dt>
                  <dd className="text-mist/85 text-base leading-relaxed text-pretty">
                    {t(`servicePages.awareness.fit.items.${item}.body`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        className="bg-transparent"
        data-testid="service-awareness-faq"
        innerClassName="pb-16 lg:pb-24"
      >
        {/* The heading is the accordion's own — see `ServiceFaq`. */}
        <ServiceFaq base="servicePages.awareness.faq" entries={service.faqs} />
      </SectionShell>

      <ClosingCta />
    </div>
  );
}
