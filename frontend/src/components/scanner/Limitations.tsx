import { useTranslation } from "react-i18next";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";

/*
 * What this run did not, or could not, look at.
 *
 * The provider reports these as codes — `no_ct_records` when Certificate
 * Transparency held nothing for the domain, `dnssec_undetermined` when no
 * validating resolver answered, and so on — and the copy for each lives with
 * the other scanner strings. A code the copy does not know is dropped rather
 * than rendered as a raw key: the backend may learn a new limitation before
 * the site learns how to phrase it, and "scanner.limits.foo" on a report
 * reads as a bug, not a caveat.
 *
 * The section exists because "we found nothing" and "we did not look" are
 * different answers. A clean DNSSEC row means one thing when a resolver was
 * consulted and nothing at all when it was not, and the reader should be able
 * to tell which they are looking at.
 */

const KEY_PREFIX = "scanner.limits.";

export function Limitations({ codes }: { codes: readonly string[] }) {
  const { t } = useTranslation();

  if (codes.length === 0) return null;

  return (
    <section data-testid="scan-limits" className={SECTION_SHELL}>
      <SectionHeading id="limits" title={t("scanner.report.limitsTitle")} />

      <ul className="flex flex-col gap-3">
        {codes.map((code) => (
          <li
            key={code}
            className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty"
          >
            {t(`${KEY_PREFIX}${code}`)}
          </li>
        ))}
      </ul>
    </section>
  );
}
