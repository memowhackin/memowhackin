import { useTranslation } from "react-i18next";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";
import type { EdgeProduct } from "@/config/scanner";

/*
 * Whether a web application firewall sits in front of the site.
 *
 * Stripped to the answer. The previous version explained passive detection,
 * the difference between a firewall and a CDN, and the method, in four
 * paragraphs; that is a footnote's worth of prose for a one-word result, and
 * it read as a wall. The answer is a badge: the firewall's name if one
 * announced itself, or "Not detected" if none did.
 *
 * "Not detected" rather than "None", on purpose. Detection is passive, read
 * from headers the site volunteered, so a firewall configured to stay quiet is
 * invisible here. "Not detected" says we looked and did not see one; "None"
 * would claim there is not one, which we cannot know.
 *
 * A content network is shown separately and labelled as one, because it is the
 * thing most often mistaken for a firewall and it inspects nothing.
 */

export function EdgeProtection({
  detections,
}: {
  detections: readonly EdgeProduct[];
}) {
  const { t } = useTranslation();

  const firewalls = detections.filter((entry) => entry.kind === "waf");
  const delivery = detections.filter((entry) => entry.kind !== "waf");

  return (
    <section data-testid="scan-waf" className={SECTION_SHELL}>
      <SectionHeading id="edge" title={t("scanner.report.edgeTitle")} />

      <div className="flex flex-wrap items-center gap-2">
        {firewalls.length > 0 ? (
          firewalls.map((entry) => (
            <span
              key={entry.id}
              className="bg-lavender/15 text-lavender ring-lavender/25 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ring-1"
            >
              <span
                aria-hidden="true"
                className="bg-lavender size-1.5 rounded-full"
              />
              {entry.name}
            </span>
          ))
        ) : (
          <span className="glass text-mist/55 rounded-lg px-3 py-1.5 text-sm">
            {t("scanner.report.edgeNone")}
          </span>
        )}
      </div>

      {delivery.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-mist/45 text-sm">
            {t("scanner.report.edgeDeliveryLabel")}
          </span>
          {delivery.map((entry) => (
            <span
              key={entry.id}
              className="glass text-mist/70 rounded-lg px-3 py-1.5 text-sm"
            >
              {entry.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
