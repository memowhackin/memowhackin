import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import {
  ChatThread,
  PortalPanel,
  SampleNote,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Live chat.
 *
 * The scanning page is built on a wide table, the insights page on two clocks.
 * This one is built on a conversation, because that is the thing being sold and
 * because a page about talking to someone should show someone talking.
 *
 * The middle of the page is one thread with the explanation running alongside
 * it in the margin, rather than a grid of capabilities under a picture. It is
 * the only page here shaped that way, which is the point.
 */

const PATH = "/argus/expert-chat";
const KEY = "argusPages.expertChat";

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/** The sample thread, in the order it happened. */
const MESSAGES = [
  { key: "confirm", side: "pentester", attachment: true },
  { key: "askScope", side: "them" },
  { key: "answer", side: "pentester" },
  { key: "deployed", side: "them" },
  { key: "verified", side: "pentester", state: true },
] as const;

export function LiveChatPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/insights",
    "/argus/retesting",
    "/services/api-pentesting",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: threadRef, className: threadReveal } =
    useReveal<HTMLDivElement>();

  useSeo({
    title: t("pages.argusExpertChat.title"),
    description: t("pages.argusExpertChat.description"),
    path: PATH,
    service: {
      name: t("pages.argusExpertChat.heading"),
      serviceType: "Direct access to penetration testers",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  const notes = ["who", "context", "close"];
  const asked = ["waf", "first", "staging", "tenant"];

  return (
    <div data-testid="argus-expertChat" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(45% 100% at 30% 0%, rgba(96,70,202,0.2) 0%, transparent 72%)",
        }}
      />

      {/*
        No picture in the hero. The conversation is the whole argument of this
        page, so it gets its own section below rather than being shrunk into a
        corner of the opening.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-expertChat-hero"
        innerClassName="flex flex-col gap-6 pt-12 pb-14 lg:pt-20 lg:pb-16"
      >
        <div
          ref={heroRef}
          className={clsx("flex max-w-3xl flex-col gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-4">
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
              data-testid="argus-expertChat-contact"
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

      {/*
        The thread, with the explanation running beside it. Each note is about
        the message it sits next to, which is why they are in a margin rather
        than in a list somewhere further down the page.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-expertChat-thread"
        innerClassName="grid grid-cols-[minmax(0,1fr)] items-stretch gap-10 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16 lg:pb-20"
      >
        <div
          ref={threadRef}
          className={clsx("flex flex-col gap-5", threadReveal)}
        >
          <PortalPanel label={t(`${KEY}.ui.threadLabel`)}>
            <ChatThread
              messages={MESSAGES.map((message) => ({
                side: message.side,
                author: t(`${KEY}.ui.messages.${message.key}.author`),
                time: t(`${KEY}.ui.messages.${message.key}.time`),
                body: t(`${KEY}.ui.messages.${message.key}.body`),
                attachment:
                  "attachment" in message
                    ? t(`${KEY}.ui.attachment`)
                    : undefined,
                state: "state" in message ? t(`${KEY}.ui.state`) : undefined,
              }))}
            />
          </PortalPanel>

          <SampleNote />
        </div>

        {/*
          Spread down the column rather than stacked at the top, so each note
          sits beside the exchange it is describing: the name against the first
          message, the context against the attached evidence, the state change
          against the message that closes the finding.
        */}
        <ul className="flex flex-col justify-between gap-10 lg:py-6">
          {notes.map((note) => (
            <li
              key={note}
              data-testid={`argus-note-${note}`}
              className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
            >
              <span className="font-display text-mist text-lg font-normal text-balance">
                {t(`${KEY}.notes.items.${note}.title`)}
              </span>
              <span className="text-mist/70 text-base leading-relaxed text-pretty">
                {t(`${KEY}.notes.items.${note}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/*
        Real questions, set as quotes. Not an accordion: these are four lines
        that make the argument, and hiding them behind a click would hide the
        argument.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-expertChat-asked"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.asked.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-10 sm:grid-cols-2">
          {asked.map((item) => (
            <li
              key={item}
              data-testid={`argus-asked-${item}`}
              className="flex flex-col gap-3"
            >
              <p className="font-display text-mist border-lavender/40 border-l-2 pl-4 text-lg leading-snug font-normal text-pretty">
                {t(`${KEY}.asked.items.${item}.q`)}
              </p>
              <p className="text-mist/70 pl-4 text-base leading-relaxed text-pretty">
                {t(`${KEY}.asked.items.${item}.a`)}
              </p>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* What it is not, said plainly. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-expertChat-limits"
        innerClassName="flex flex-col gap-4 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.limits.title`)}
        </h2>
        <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.limits.body`)}
        </p>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-expertChat-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
          </h2>

          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
