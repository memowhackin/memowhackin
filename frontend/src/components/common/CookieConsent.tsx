import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { env } from "@/config/env";
import { readConsent, writeConsent } from "@/config/consent";
import { startAnalytics } from "@/config/analytics";

/*
 * The consent gate in front of Google Analytics.
 *
 * GA4 stores an identifier in the browser, so under the ePrivacy rules it may
 * not run until the visitor agrees. That makes this component the only thing
 * standing between a fresh visit and a tracking script, and it is written to
 * fail closed: measurement starts in `accept` and nowhere else, so a bug that
 * stops this from rendering leaves a site that measures nothing, rather than
 * one that measures without asking.
 *
 * Refusing is one press, in the same shape and size as accepting. A banner
 * whose only button is "accept" is not a choice, and the guidance the Dutch
 * regulator publishes is explicit that refusing must be as easy as agreeing.
 */
/**
 * Whether there is anything to ask. No measurement id configured means nothing
 * to consent to, so the banner never appears in a build without one.
 */
function shouldAsk(): boolean {
  return env.gaMeasurementId.length > 0 && readConsent() === undefined;
}

export function CookieConsent() {
  const { t } = useTranslation();

  /*
   * Worked out on the first render rather than set from an effect.
   *
   * The site is mounted with `createRoot`, not `hydrateRoot`, so the prerendered
   * markup is replaced wholesale and this initial value is what a visitor
   * actually sees — no flash of a banner at someone who already answered, and
   * no second render to remove it.
   *
   * Reading storage in an initialiser runs once per mount, which is what makes
   * it safe here: it is a question with an answer, not a subscription.
   */
  const [asking, setAsking] = useState(() => shouldAsk());

  useEffect(() => {
    // Agreed on an earlier visit: start measuring without asking again.
    if (!shouldAsk() && readConsent() === "granted") startAnalytics();
  }, []);

  if (!asking) return null;

  function decide(choice: "granted" | "denied") {
    writeConsent(choice);
    setAsking(false);
    // Only ever started here. Denying loads nothing and leaves nothing behind.
    if (choice === "granted") startAnalytics();
  }

  return (
    /*
     * A card in the corner, not a bar across the foot.
     *
     * A full-width bar reads as an obstruction and takes a band of the page
     * for a question that fits in a paragraph. This is the same floating
     * surface the language switcher uses — `rounded-box`, an indigo hairline,
     * the deep ink ground and one shadow — so it arrives as a part of the site
     * rather than as something bolted onto it. On a phone it spans the width,
     * because a 24rem card floating in a 390px viewport is just a bar with
     * wasted margins.
     *
     * `role="dialog"` without `aria-modal`: it is a question, but the page
     * stays readable and operable behind it. Trapping someone until they
     * answer is the pattern this is meant not to be.
     */
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      data-testid="cookie-consent"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:p-0"
    >
      <div className="border-indigo-deep bg-ink-deep rounded-box motion-safe:animate-alert-in mx-auto flex max-w-sm flex-col gap-3 border p-4 shadow-lg">
        <h2 id="cookie-consent-title" className="text-mist text-sm font-medium">
          {t("consent.title")}
        </h2>

        <p className="text-mist/70 text-xs leading-relaxed text-pretty">
          {t("consent.body")}{" "}
          {/*
            A choice is only informed if what is being asked can be read
            first, so the policy is one link away from the question itself.
          */}
          <Link
            to="/privacy-policy"
            data-testid="cookie-consent-policy"
            className="text-lavender decoration-lavender/40 underline underline-offset-4"
          >
            {t("legal.related.privacyPolicy.title")}
          </Link>
        </p>

        {/*
          Two buttons of exactly equal width, refusing first in the source so
          it is the first one reached by keyboard and by a screen reader.
          Refusing has to be as easy as agreeing — the same one press, the same
          size, no dimmed "reject" beside a bright "agree" — which is both the
          regulator's requirement and the only honest way to ask.
        */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              decide("denied");
            }}
            data-testid="cookie-consent-decline"
            className={brandButtonClass({
              variant: "ghost",
              size: "sm",
              /*
                `ghost` is a pill and `solid` is a small radius, which is fine
                apart but reads as an accident when the two sit side by side.
                The pair takes the accepting button's shape so they are plainly
                the same control offering two answers.
              */
              className: "flex-1 rounded-field!",
            })}
          >
            {t("consent.decline")}
          </button>
          <button
            type="button"
            onClick={() => {
              decide("granted");
            }}
            data-testid="cookie-consent-accept"
            className={brandButtonClass({
              variant: "solid",
              size: "sm",
              className: "flex-1",
            })}
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
