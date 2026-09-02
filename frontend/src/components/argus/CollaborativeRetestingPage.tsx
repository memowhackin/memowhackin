import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Check, RotateCcw } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { FlowScene } from "@/components/argus/FlowScene";
import { LightBand } from "@/components/argus/LightBand";
import { PortalCapture } from "@/components/argus/PortalCapture";
import {
  ChatThread,
  PortalPanel,
  RequestPair,
  SampleNote,
  StateTrail,
} from "@/components/argus/PortalUI";
import { SEVERITY_TONE } from "@/components/argus/severityTone";
import { relatedLeaves } from "@/components/argus/related";
import { useSeo } from "@/localization/useSeo";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Collaborative retesting.
 *
 * The page follows one finding from "we shipped a fix" to a recorded verdict,
 * so it is built as a narrative: a centred opening, the workflow walked as a
 * wide sequence, then each part of that workflow given its own section. Where
 * the monthly page argues from a calendar, this one argues from a single
 * conversation and the state changes around it.
 */

const PATH = "/argus/collaborative-retesting";
const KEY = "argusPages.retest";

const FLOW_STEPS = [
  "select",
  "request",
  "respond",
  "verify",
  "record",
] as const;

const FAQ_ENTRIES = ["who", "fail", "cost"] as const;

/**
 * The finding's masthead, shared by every stage of the sequence so the reader
 * watches one object change state rather than five pictures replace each
 * other.
 */
function FindingHead({ state, tone }: { state: string; tone: string }) {
  const { t } = useTranslation();

  return (
    <div className="border-indigo-deep/60 flex flex-wrap items-center gap-3 border-b px-4 py-3.5">
      <span
        className={clsx(
          "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
          SEVERITY_TONE.high,
        )}
      >
        {t("argusUi.severity.high")}
      </span>
      <span className="text-mist min-w-0 flex-1 text-sm font-medium text-pretty">
        {t(`${KEY}.ui.finding.title`)}
      </span>
      <span
        className={clsx(
          "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
          tone,
        )}
      >
        {state}
      </span>
    </div>
  );
}

const OPEN_TONE = "border-warning/25 bg-warning/10 text-warning";
const REQUESTED_TONE = "border-lavender/30 bg-lavender/10 text-lavender";
const CLOSED_TONE = "border-success/30 bg-success/10 text-success";

/** Step 1: the fixed finding, with the one action on it. */
function SelectStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.findingLabel`)}>
      <FindingHead state={t(`${KEY}.ui.finding.stateOpen`)} tone={OPEN_TONE} />
      <div className="flex flex-col gap-3 px-4 py-4">
        <span className="text-mist/50 font-mono text-xs">
          {t(`${KEY}.ui.finding.asset`)}
        </span>
        <span className="border-lavender/40 bg-lavender/10 text-lavender w-fit rounded-md border px-3 py-1.5 text-xs font-medium">
          {t(`${KEY}.ui.finding.requestButton`)}
        </span>
      </div>
    </PortalPanel>
  );
}

/** Step 2: the request is on the record. */
function RequestStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.findingLabel`)}>
      <FindingHead
        state={t(`${KEY}.ui.finding.stateRequested`)}
        tone={REQUESTED_TONE}
      />
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Check aria-hidden="true" className="text-lavender size-4 shrink-0" />
        <span className="text-mist/70 text-sm">
          {t(`${KEY}.ui.finding.requestedNote`)}
        </span>
      </div>
    </PortalPanel>
  );
}

/** Step 3: the pentester picks it up, in the finding's own thread. */
function RespondStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.threadLabel`)}>
      <ChatThread
        messages={(["fix", "ack"] as const).map((message) => ({
          side: message === "ack" ? "pentester" : "them",
          author: t(`${KEY}.ui.msgs.${message}.author`),
          time: t(`${KEY}.ui.msgs.${message}.time`),
          body: t(`${KEY}.ui.msgs.${message}.body`),
        }))}
      />
    </PortalPanel>
  );
}

/** Step 4: the original reproduction, replayed step for step. */
function VerifyStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.verifyLabel`)}>
      <ul className="divide-indigo-deep/60 divide-y">
        {(["auth", "list"] as const).map((row, index) => (
          <li key={row} className="flex flex-col gap-2 px-4 py-3.5">
            <span className="flex items-center justify-between gap-3">
              <span className="text-mist/85 min-w-0 truncate font-mono text-xs">
                {t(`${KEY}.ui.verify.${row}.name`)}
              </span>
              <span
                className={clsx(
                  "shrink-0 text-xs",
                  index === 0 ? "text-success" : "text-lavender",
                )}
              >
                {t(`${KEY}.ui.verify.${row}.state`)}
              </span>
            </span>
            {index === 1 && (
              <span className="bg-indigo-deep/60 h-1 overflow-hidden rounded-full">
                <span
                  className="bg-lavender block h-full origin-left rounded-full"
                  style={{ transform: "scaleX(0.7)" }}
                />
              </span>
            )}
          </li>
        ))}
      </ul>
    </PortalPanel>
  );
}

/** Step 5: the verdict, with the response that earned it. */
function RecordStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.resultLabel`)}>
      <FindingHead
        state={t(`${KEY}.ui.finding.stateClosed`)}
        tone={CLOSED_TONE}
      />
      <div className="p-4">
        <RequestPair
          request={t(`${KEY}.ui.pair.request`)}
          before={{
            label: t(`${KEY}.ui.pair.before.label`),
            response: t(`${KEY}.ui.pair.before.response`),
          }}
          after={{
            label: t(`${KEY}.ui.pair.after.label`),
            response: t(`${KEY}.ui.pair.after.response`),
          }}
        />
      </div>
    </PortalPanel>
  );
}

/** A stage constrained to the sequence's stage width. */
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl">{children}</div>;
}

export function CollaborativeRetestingPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/live-pentest-workspace",
    "/argus/monthly-security-scans",
    "/services/api-pentesting",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: threadRef, className: threadReveal } =
    useReveal<HTMLDivElement>();
  const { ref: historyRef, className: historyReveal } =
    useReveal<HTMLDivElement>();
  const { ref: outcomeRef, className: outcomeReveal } =
    useReveal<HTMLDivElement>();

  const faq = useMemo(
    () =>
      FAQ_ENTRIES.map((entry) => ({
        question: t(`${KEY}.faq.items.${entry}.q`),
        answer: t(`${KEY}.faq.items.${entry}.a`),
      })),
    [t],
  );
  const serviceSchema = useMemo(
    () => ({
      name: t("pages.argusRetest.heading"),
      serviceType: "Remediation verification",
      areaServed: SERVICE_AREA_SERVED,
    }),
    [t],
  );

  useSeo({
    title: t("pages.argusRetest.title"),
    description: t("pages.argusRetest.description"),
    path: PATH,
    service: serviceSchema,
    faq,
  });

  const trailEntries = [
    "published",
    "deployed",
    "requested",
    "attacked",
    "closed",
  ] as const;
  /* Which history entries changed the finding's state. A deploy and a replay
     are events on the record; they move nothing by themselves. */
  const trailStates = new Set(["published", "requested", "closed"]);

  return (
    <div data-testid="argus-retest" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      {/* Centred opening: this page's argument is one sentence long. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-hero"
        innerClassName="flex flex-col items-center gap-6 pt-12 pb-14 text-center sm:pt-16 lg:pt-20"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          <p
            className="font-display text-lavender/80 text-sm font-light tracking-[0.5em] uppercase"
            aria-label="ARGUS"
          >
            Argus
          </p>

          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              data-testid="page-book-demo"
              className="text-nowrap"
            >
              {t("nav.bookDemo")}
            </BrandButton>

            <Link
              to="/contact"
              data-testid="argus-retest-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>
      </SectionShell>

      {/* The workflow, walked as one wide sequence under the opening. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-workflow"
        innerClassName="flex flex-col gap-10 pb-16 lg:pb-24"
      >
        <FlowScene
          base={`${KEY}.flow`}
          steps={FLOW_STEPS}
          layout="top"
          stages={[
            <Stage key="select">
              <SelectStage />
            </Stage>,
            <Stage key="request">
              <RequestStage />
            </Stage>,
            <Stage key="respond">
              <RespondStage />
            </Stage>,
            <Stage key="verify">
              <VerifyStage />
            </Stage>,
            <Stage key="record">
              <RecordStage />
            </Stage>,
          ]}
          data-testid="argus-retest-flow"
        />
      </SectionShell>

      {/* Requesting a retest from the finding. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-request"
        innerClassName="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20"
      >
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-lavender/70">
            {t(`${KEY}.request.eyebrow`)}
          </p>
          <h2 className="font-display text-service text-mist font-normal text-balance">
            {t(`${KEY}.request.title`)}
          </h2>
          <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
            {t(`${KEY}.request.p1`)}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <PortalCapture shot="retest-request" altKey={`${KEY}.shots.request`}>
            <SelectStage />
          </PortalCapture>
          <SampleNote />
        </div>
      </SectionShell>

      {/* The conversation lives on the finding. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-thread"
        innerClassName="py-14 lg:py-20"
      >
        <div
          ref={threadRef}
          className={clsx(
            "grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:gap-16",
            threadReveal,
          )}
        >
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-lavender/70">
              {t(`${KEY}.thread.eyebrow`)}
            </p>
            <h2 className="font-display text-service text-mist font-normal text-balance">
              {t(`${KEY}.thread.title`)}
            </h2>
            <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
              {t(`${KEY}.thread.p1`)}
            </p>

            {/* Following verification progress, on the same spread: the
                thread and the states it produces belong in one picture. */}
            <h3 className="font-display text-mist mt-4 text-xl font-normal text-balance">
              {t(`${KEY}.progress.title`)}
            </h3>
            <p className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
              {t(`${KEY}.progress.p1`)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <PortalCapture shot="retest-thread" altKey={`${KEY}.shots.thread`}>
              <PortalPanel label={t(`${KEY}.ui.threadLabel`)}>
                <ChatThread
                  messages={(["fix", "ack", "question", "answer"] as const).map(
                    (message) => ({
                      side:
                        message === "fix" || message === "question"
                          ? "them"
                          : "pentester",
                      author: t(`${KEY}.ui.msgs.${message}.author`),
                      time: t(`${KEY}.ui.msgs.${message}.time`),
                      body: t(`${KEY}.ui.msgs.${message}.body`),
                    }),
                  )}
                />
              </PortalPanel>
            </PortalCapture>
            <SampleNote />
          </div>
        </div>
      </SectionShell>

      {/* Resolved versus still reproducible — the page's light passage. */}
      <LightBand data-testid="argus-retest-outcomes">
        <div
          ref={outcomeRef}
          className={clsx("flex flex-col gap-10", outcomeReveal)}
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="eyebrow text-indigo">
              {t(`${KEY}.outcomes.eyebrow`)}
            </p>
            <h2 className="font-display text-service text-ink-deep font-normal text-balance">
              {t(`${KEY}.outcomes.title`)}
            </h2>
            <p className="text-ink-deep/70 text-base leading-relaxed text-pretty sm:text-lg">
              {t(`${KEY}.outcomes.p1`)}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {(["resolved", "reproducible"] as const).map((outcome) => (
              <div
                key={outcome}
                data-testid={`argus-outcome-${outcome}`}
                className="border-ink-deep/10 flex flex-col gap-3 rounded-2xl border bg-white/60 p-6"
              >
                <span
                  className={clsx(
                    "flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
                    outcome === "resolved"
                      ? "border-success/40 bg-success/10 text-ink-deep"
                      : "border-warning/50 bg-warning/15 text-ink-deep",
                  )}
                >
                  {outcome === "resolved" ? (
                    <Check aria-hidden="true" className="size-3.5" />
                  ) : (
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                  )}
                  {t(`${KEY}.outcomes.${outcome}.title`)}
                </span>
                <p className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.outcomes.${outcome}.body`)}
                </p>
              </div>
            ))}
          </div>

          {/* The proof both verdicts rest on: one request, two answers. */}
          <div className="flex flex-col gap-3">
            <PortalPanel label={t(`${KEY}.ui.resultLabel`)}>
              <div className="p-4 sm:p-5">
                <RequestPair
                  request={t(`${KEY}.ui.pair.request`)}
                  before={{
                    label: t(`${KEY}.ui.pair.before.label`),
                    response: t(`${KEY}.ui.pair.before.response`),
                  }}
                  after={{
                    label: t(`${KEY}.ui.pair.after.label`),
                    response: t(`${KEY}.ui.pair.after.response`),
                  }}
                />
              </div>
            </PortalPanel>
            <p className="text-ink-deep/45 text-xs">{t("argusUi.sample")}</p>
          </div>
        </div>
      </LightBand>

      {/* The complete remediation history. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-history"
        innerClassName="py-14 lg:py-20"
      >
        <div
          ref={historyRef}
          className={clsx(
            "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16",
            historyReveal,
          )}
        >
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-lavender/70">
              {t(`${KEY}.history.eyebrow`)}
            </p>
            <h2 className="font-display text-service text-mist font-normal text-balance">
              {t(`${KEY}.history.title`)}
            </h2>
            <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
              {t(`${KEY}.history.p1`)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <PortalCapture
              shot="retest-history"
              altKey={`${KEY}.shots.history`}
            >
              <PortalPanel label={t(`${KEY}.ui.historyLabel`)}>
                <StateTrail
                  entries={trailEntries.map((entry) => ({
                    time: t(`${KEY}.ui.trail.${entry}.time`),
                    actor: t(`${KEY}.ui.trail.${entry}.actor`),
                    event: t(`${KEY}.ui.trail.${entry}.event`),
                    state: trailStates.has(entry)
                      ? t(`${KEY}.ui.trail.${entry}.state`)
                      : undefined,
                    closed: entry === "closed",
                  }))}
                />
              </PortalPanel>
            </PortalCapture>
            <SampleNote />
          </div>
        </div>
      </SectionShell>

      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-faq"
        innerClassName="py-14 lg:py-20"
      >
        <ServiceFaq base={`${KEY}.faq`} entries={FAQ_ENTRIES} />
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-retest-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((leaf, index) => (
              <PageLinkCard key={leaf.key} leaf={leaf} index={index} />
            ))}
          </ul>
        </SectionShell>
      )}

      <ClosingCta />
    </div>
  );
}
