import { useTranslation } from "react-i18next";
import { LogoLockup, LogoWordmark } from "@/components/common/Logo";
import { sectionIds, site } from "@/config/site";

const quickLinks = [
  { key: "home", href: "#top", label: "footer.home" },
  { key: "services", href: `#${sectionIds.services}`, label: "nav.services" },
  {
    key: "bookDemo",
    href: `#${sectionIds.demonstrate}`,
    label: "nav.bookDemo",
  },
  { key: "aboutUs", href: `#${sectionIds.about}`, label: "nav.aboutUs" },
  {
    key: "demonstrate",
    href: `#${sectionIds.demonstrate}`,
    label: "nav.demonstrate",
  },
  { key: "blog", href: `#${sectionIds.blog}`, label: "nav.blog" },
] as const;

const socials = [
  {
    key: "instagram",
    label: "Instagram",
    href: "https://instagram.com/assistsec",
  },
  { key: "twitter", label: "Twitter X", href: "https://x.com/assistsec" },
  { key: "discord", label: "Discord", href: "https://discord.gg/assistsec" },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://facebook.com/assistsec",
  },
] as const;

/** Certifications, in the order the frame lists them. */
const badges = [
  {
    key: "oscp",
    name: "OSCP",
    src: "/assets/badge-oscp.webp",
    width: 520,
    height: 600,
  },
  {
    key: "osai",
    name: "OSAI",
    src: "/assets/badge-osai.webp",
    width: 290,
    height: 330,
  },
  {
    key: "oswe",
    name: "OSWE",
    src: "/assets/badge-oswe.svg",
    width: 68,
    height: 78,
  },
] as const;

/*
 * The three exports do not agree on their own geometry. OSCP and OSWE are
 * regular hexagons — √3/2, crisp points top and bottom — but the OSAI artwork
 * comes out of the source a little wide, with both vertices blunted flat, so at
 * a shared height the row read as three different shapes rather than as one set
 * of certifications.
 *
 * Every badge is clipped to the same hexagon instead of being trusted to carry
 * its own. It costs OSCP and OSWE nothing (their artwork already sits inside
 * this outline) and gives OSAI back the points its export is missing.
 */
const BADGE_HEXAGON =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/** The industry partners shown above the divider. */
const partners = [
  {
    key: "vercel",
    name: "Vercel",
    src: "/assets/logo-vercel.svg",
    width: 95,
    height: 20,
  },
  {
    key: "google",
    name: "Google",
    src: "/assets/logo-google.svg",
    width: 73,
    height: 24,
  },
  {
    key: "meta",
    name: "Meta",
    src: "/assets/logo-meta.svg",
    width: 99,
    height: 20,
  },
  {
    key: "perplexity",
    name: "Perplexity",
    src: "/assets/logo-perplexity.svg",
    width: 108,
    height: 24,
  },
  {
    key: "strava",
    name: "Strava",
    src: "/assets/logo-strava.svg",
    width: 92,
    height: 20,
  },
  {
    key: "duolingo",
    name: "Duolingo",
    src: "/assets/logo-duolingo.svg",
    width: 78,
    height: 20,
  },
  {
    key: "harvard",
    name: "Harvard University",
    src: "/assets/logo-harvard.svg",
    width: 92,
    height: 24,
  },
] as const;

/*
 * Read once at module load rather than on every render: reading the clock
 * during render is impure, and a copyright year that changes mid-session is not
 * a behaviour anyone needs.
 */
const year = new Date().getFullYear();

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer
      className="bg-ink relative isolate overflow-hidden pt-16 lg:pt-20"
      data-testid="site-footer"
    >
      {/* Soft lavender glow rising from the bottom edge, as in the design. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-72 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, #413994 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/*
        Oversized wordmark, running under the footer and bleeding off the bottom
        edge.

        It used to be the last element in normal flow, which gave it a strip of
        its own below the content — so it read as a separate band bolted to the
        foot of the page rather than as a watermark the footer sits on. Taking it
        out of flow costs the layout nothing (the legal row's own bottom padding
        is the footer's floor) and lets it run up behind the last rows.

        The mask is what keeps it from reading as a picture of a logo: the type
        surfaces out of the bottom edge and is gone before it reaches the link
        columns, rather than sitting there as a complete word with a crop across
        it.
      */}
      <LogoWordmark
        className="text-lavender/12 pointer-events-none absolute inset-x-0 -bottom-8 -z-10 h-32 w-full sm:-bottom-12 sm:h-48 lg:-bottom-16 lg:h-64"
        style={{
          maskImage:
            "linear-gradient(to top, #000 0%, #000 42%, transparent 92%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-16 2xl:px-0">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <p className="max-w-[21.25rem] text-base leading-6 text-white">
            {t("trusted.title")}
          </p>

          <ul className="flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
            {partners.map((partner) => (
              <li key={partner.key}>
                <img
                  src={partner.src}
                  alt={t("footer.partnerAlt", { name: partner.name })}
                  width={partner.width}
                  height={partner.height}
                  loading="lazy"
                  className="w-auto"
                  style={{ height: `${(partner.height / 16).toString()}rem` }}
                />
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-lavender/25 my-12 border-t border-dashed lg:my-14" />

        {/*
          Three tracks, not four. The fourth used to hold nothing but a ghost
          mark, so the row of real content stopped two thirds of the way across
          and left a hole under the partner logos; the mark is now the watermark
          across the whole footer instead.
        */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20">
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <LogoLockup className="text-mist h-6 w-auto self-start" />

            <p className="text-mist/70 max-w-[34rem] text-base leading-relaxed text-pretty">
              {t("footer.about")}
            </p>

            <div className="mt-2 flex flex-col gap-4">
              <h2 className="eyebrow text-lavender">
                {t("footer.certifications")}
              </h2>

              <ul className="flex flex-wrap items-center gap-5 sm:gap-6">
                {badges.map((badge) => (
                  <li key={badge.key} data-testid={`footer-badge-${badge.key}`}>
                    <img
                      src={badge.src}
                      alt={t("footer.badgeAlt", { name: badge.name })}
                      width={badge.width}
                      height={badge.height}
                      loading="lazy"
                      /*
                       * `w-auto` is load-bearing: without it the width falls
                       * back to the `width` attribute above and the badge
                       * renders as a flat bar, because an explicit width
                       * outranks the ratio.
                       */
                      className="h-14 w-auto object-cover sm:h-16"
                      style={{
                        aspectRatio: "0.866",
                        clipPath: BADGE_HEXAGON,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <nav aria-label={t("footer.quickLinks")}>
            <h2 className="eyebrow text-lavender mb-4">
              {t("footer.quickLinks")}
            </h2>
            <ul className="flex flex-col">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    data-testid={`footer-link-${link.key}`}
                    className="text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition lg:min-h-9"
                  >
                    {t(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("footer.connect")}>
            <h2 className="eyebrow text-lavender mb-4">
              {t("footer.connect")}
            </h2>
            <ul className="flex flex-col">
              {socials.map(({ key, label, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-testid={`footer-social-${key}`}
                    className="text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition lg:min-h-9"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-lavender/15 text-mist/55 mt-12 flex flex-col gap-2 border-t border-dashed pt-6 pb-12 text-sm leading-6 sm:flex-row sm:items-center sm:justify-between lg:mt-16 lg:pb-16">
          <p data-testid="footer-copyright">
            {t("footer.copyright", { year })}
          </p>
          <p className="flex items-center gap-3">
            <a
              href={`${site.scannerBaseUrl}/terms`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-lavender inline-flex min-h-9 items-center transition"
              data-testid="footer-terms"
            >
              {t("footer.terms")}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={`${site.scannerBaseUrl}/privacy`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-lavender inline-flex min-h-9 items-center transition"
              data-testid="footer-privacy"
            >
              {t("footer.privacy")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
