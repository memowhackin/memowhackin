import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { PortalShot } from "@/components/common/PortalShot";

/*
 * Six ways of showing the portal, one per feature page.
 *
 * The frame itself is always `PortalShot`, so a screenshot lands the same way
 * everywhere and the placeholder behaves the same everywhere. What differs is
 * how many frames there are and how they are arranged, and that is chosen by
 * what the screen actually is rather than for variety's sake:
 *
 * - a month's pass summary is one wide table, so it gets the full column;
 * - insights is a queue you open an item from, so it is two frames, one behind
 *   the other;
 * - a conversation is a narrow column, so it sits in a narrow one;
 * - a control matrix is wider than any page, so it runs off the edge;
 * - a retest is a state change inside a sequence, so it appears inside the
 *   sequence rather than beside it;
 * - integrations end in three different places, so there are three frames.
 *
 * Six pages, six arrangements, one frame. That is the difference between a set
 * and a template.
 */

interface ShotProps {
  page: string;
  shot: string;
}

function keys(page: string, shot: string) {
  const base = `argusPages.${page}.shots.${shot}`;
  return {
    src: `/assets/argus/${page}-${shot}.webp`,
    altKey: `${base}.alt`,
    captionKey: `${base}.caption`,
  };
}

/**
 * One wide screen, centred, the way the home page shows the portal under its
 * opening statement. For the screen that is simply too wide to put in a column.
 */
export function ShowcaseShot({ page, shot }: ShotProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PortalShot {...keys(page, shot)} aspect="wide" />
    </div>
  );
}

/**
 * Two frames, one behind the other.
 *
 * The same still life the home page builds the report from: the back frame
 * offset, tilted a degree and dimmed, the front one square and bright. Here it
 * says something specific, which is why it is not just decoration: the queue is
 * behind, the finding you opened from it is in front.
 */
export function StackShot({
  page,
  front,
  back,
}: {
  page: string;
  front: string;
  back: string;
}) {
  const { t } = useTranslation();
  const backKeys = keys(page, back);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 translate-x-[6%] -translate-y-[7%] rotate-[1.5deg] brightness-[0.72]"
      >
        <PortalShot
          src={backKeys.src}
          altKey={backKeys.altKey}
          captionKey={backKeys.captionKey}
          aspect="panel"
          hideCaption
        />
      </div>

      <div className="relative">
        <PortalShot {...keys(page, front)} aspect="panel" />
      </div>

      {/* The back frame's own caption is suppressed above, so it is named here
          instead: two captions stacked under one picture reads as a mistake. */}
      <p className="text-mist/40 mt-2 text-sm leading-relaxed text-pretty">
        {t(backKeys.captionKey)}
      </p>
    </div>
  );
}

/**
 * A narrow frame beside wide copy.
 *
 * Not the fifty-fifty row: a conversation is a column of messages, and giving
 * it half a page would frame a lot of empty chrome around a thin thing.
 */
export function AsideShot({
  page,
  shot,
  children,
}: ShotProps & { children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)] lg:gap-16">
      <div>{children}</div>
      <PortalShot {...keys(page, shot)} aspect="tall" />
    </div>
  );
}

/**
 * A screen that runs off the right edge of the page.
 *
 * A control matrix is wider than any column it could be given, and cropping it
 * to fit would be pretending otherwise. Letting it leave the page says there is
 * more of it than fits, which is true and is the point of the section.
 */
export function BleedShot({
  page,
  shot,
  children,
}: ShotProps & { children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
      <div>{children}</div>

      {/* Wider than its cell, clipped by the section: the frame keeps its own
          proportions and the page keeps its scroll width. */}
      <div className="lg:w-[132%]">
        <PortalShot {...keys(page, shot)} aspect="wide" />
      </div>
    </div>
  );
}

/**
 * Three frames, because the section is about three destinations.
 *
 * The middle one is dropped half a step so the row reads as an arrangement
 * rather than as a filmstrip, which is what three identical boxes on one line
 * always look like.
 */
export function TriptychShot({
  page,
  shots,
}: {
  page: string;
  shots: readonly string[];
}) {
  return (
    <ul className="grid w-full gap-6 sm:grid-cols-3 sm:gap-5">
      {shots.map((shot, index) => (
        <li
          key={shot}
          data-testid={`argus-shot-${shot}`}
          className={clsx(index === 1 && "sm:mt-10")}
        >
          <PortalShot {...keys(page, shot)} aspect="panel" />
        </li>
      ))}
    </ul>
  );
}

/** A frame sized to sit inside a step of a numbered walk. */
export function StepShot({ page, shot }: ShotProps) {
  return (
    <div className="mt-4 max-w-md">
      <PortalShot {...keys(page, shot)} aspect="panel" />
    </div>
  );
}
