import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

/** One question, open on click and present in the markup either way. */
function FaqEntry({
  serviceKey,
  entry,
}: {
  serviceKey: string;
  entry: string;
}) {
  const { t } = useTranslation();

  return (
    /*
     * A native `<details>`, not a state-driven panel. The answer is in the
     * document whether or not it is open, which is what a crawler and an answer
     * engine read — an accordion that mounts its answer on click ships a page of
     * questions with no answers on it. It also keeps the keyboard and the
     * screen-reader behaviour the browser already implements correctly.
     */
    <details
      data-testid={`service-faq-${entry}`}
      className="group border-indigo-deep bg-ink-deep overflow-hidden rounded-2xl border"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <h3 className="text-mist group-hover:text-lavender text-base font-medium text-pretty transition-colors sm:text-lg">
          {t(`servicePages.${serviceKey}.faq.items.${entry}.q`)}
        </h3>

        <ChevronDown
          aria-hidden="true"
          className="text-lavender/70 size-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
        />
      </summary>

      <p className="text-mist/70 max-w-prose px-5 pb-5 text-base leading-relaxed text-pretty">
        {t(`servicePages.${serviceKey}.faq.items.${entry}.a`)}
      </p>
    </details>
  );
}

/**
 * A page's questions, answered on the page.
 *
 * Shared by the pentest template and the awareness page, which are otherwise
 * built quite differently: the questions a buyer asks are the same *kind* of
 * thing whatever the service, and two copies of an accordion is how two pages
 * end up opening at different speeds.
 */
export function ServiceFaq({
  serviceKey,
  entries,
}: {
  serviceKey: string;
  entries: readonly string[];
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-3">
      {entries.map((entry) => (
        <FaqEntry key={entry} serviceKey={serviceKey} entry={entry} />
      ))}
    </div>
  );
}
