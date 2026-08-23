import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import {
  EmailAuthArt,
  ImpersonationArt,
  SurfaceArt,
  TransportArt,
} from "@/components/scanner/checkArt";

/*
 * What the free scan actually looks at.
 *
 * Four full-width rows that alternate side, not a grid of cards. The
 * distinction matters more than it sounds: a grid asks the reader to compare
 * four things, and these are not four options to choose between, they are four
 * parts of one pass that happen in sequence. Alternating rows give each one a
 * whole screen, let the figure be large enough to read, and reflow to a single
 * column on a phone without a card ever becoming a letterbox.
 *
 * There is no container anywhere in here. Every row is text and a drawing on
 * the page's own ground, which is what keeps the console above it reading as
 * the one raised object on the page.
 *
 * The bullet lines under each paragraph are the specific checks, named. A
 * visitor deciding whether to hand over their domain wants to know what will
 * be done to it, and "we check your email setup" is not that. They are set as
 * plain lines with a leading arrow rather than chips, because a chip is a
 * control and none of these is clickable.
 */

const CHECKS = [
  { key: "transport", Art: TransportArt, points: 3 },
  { key: "email", Art: EmailAuthArt, points: 3 },
  { key: "surface", Art: SurfaceArt, points: 3 },
  { key: "impersonation", Art: ImpersonationArt, points: 3 },
] as const;

function Row({
  index,
  check,
}: {
  index: number;
  check: (typeof CHECKS)[number];
}) {
  const { t } = useTranslation();
  const { Art } = check;
  const flipped = index % 2 === 1;

  return (
    <div
      data-testid={`scanner-check-${check.key}`}
      className={clsx(
        "flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20",
        flipped && "lg:flex-row-reverse",
      )}
    >
      {/*
        The figure. Capped on small screens so it never grows taller than the
        text it belongs to, and given half the row from `lg` where there is
        room for both.
      */}
      <div className="mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:w-1/2 lg:max-w-none">
        <Art />
      </div>

      <div className="flex flex-col gap-5 lg:w-1/2">
        <h3 className="font-display text-mist text-2xl leading-tight font-normal text-balance sm:text-3xl">
          {t(`scanner.checks.${check.key}.title`)}
        </h3>

        <p className="text-mist/70 text-base leading-relaxed text-pretty sm:text-lg">
          {t(`scanner.checks.${check.key}.body`)}
        </p>

        <ul className="flex flex-col gap-3">
          {Array.from({ length: check.points }, (_unused, point) => (
            <li key={point} className="flex items-baseline gap-3">
              <ArrowRight
                aria-hidden="true"
                className="text-lavender mt-1 size-4 shrink-0"
              />
              <span className="text-mist/60 text-sm leading-relaxed text-pretty sm:text-base">
                {t(`scanner.checks.${check.key}.points.${String(point)}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ScannerChecks() {
  const { t } = useTranslation();

  return (
    <SectionShell
      data-testid="scanner-checks"
      className="bg-transparent"
      innerClassName="flex flex-col gap-16 pb-16 sm:gap-20 lg:gap-28 lg:pb-24"
    >
      <h2 className="font-display text-mist max-w-2xl text-3xl leading-tight font-normal text-balance sm:text-4xl">
        {t("scanner.checks.title")}
      </h2>

      {CHECKS.map((check, index) => (
        <Row key={check.key} index={index} check={check} />
      ))}
    </SectionShell>
  );
}
