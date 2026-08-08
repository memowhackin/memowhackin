import { useTranslation } from "react-i18next";
import { BrandButton } from "@/components/common/BrandButton";
import { site } from "@/config/site";

/** Final conversion block, with the two robotic hands reaching in from the sides. */
export function ClosingCta() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="closing-cta"
      className="bg-ink relative isolate w-full overflow-hidden"
    >
      <img
        src="/assets/robot-hand-right.webp"
        alt=""
        width={1306}
        height={1209}
        loading="lazy"
        aria-hidden="true"
        className="pointer-events-none absolute top-[4%] left-[64%] -z-10 hidden w-[43%] md:block"
      />
      <img
        src="/assets/robot-hand-left.webp"
        alt={t("cta.imageAlt")}
        width={1160}
        height={1086}
        loading="lazy"
        className="pointer-events-none absolute top-[24%] -left-[3%] -z-10 hidden w-[32%] md:block"
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 py-20 text-center sm:px-10 sm:py-28 lg:px-16 lg:py-40 xl:py-48 2xl:px-0">
        <h2 className="font-display text-mist max-w-3xl text-2xl leading-tight font-normal text-balance sm:text-3xl lg:text-[2.5rem]">
          {t("cta.title")}
        </h2>

        <p className="text-mist/80 max-w-xl text-base leading-6 text-pretty">
          {t("cta.body")}
        </p>

        <BrandButton
          href={site.bookDemoUrl}
          data-testid="closing-book-demo"
          className="mt-2"
        >
          {t("cta.action")}
        </BrandButton>
      </div>
    </section>
  );
}
