import { useTranslation } from "react-i18next";
import { LogoMark, LogoWordmarkOutline } from "@/components/common/Logo";
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
  /*
   * Re-exported. The original was 224×352 with the hexagon squashed to a 0.679
   * aspect where its two siblings are 0.878, so at a shared height it rendered
   * 50px wide against their 68 and read as the odd one out.
   */
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
      className="bg-ink relative overflow-hidden pt-16 lg:pt-20"
      data-testid="site-footer"
    >
      {/* Soft lavender glow rising from the bottom edge, as in the design. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, #413994 0%, transparent 70%)",
        }}
        aria-hidden="true"
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

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-8 sm:col-span-2 lg:col-span-1">
            <p className="max-w-[25rem] text-lg leading-[1.45] text-pretty text-white sm:text-xl">
              {t("footer.about")}
            </p>

            <ul className="flex flex-wrap items-center gap-6 sm:gap-10">
              {badges.map((badge) => (
                <li key={badge.key}>
                  <img
                    src={badge.src}
                    alt={t("footer.badgeAlt", { name: badge.name })}
                    width={badge.width}
                    height={badge.height}
                    loading="lazy"
                    className="h-16 w-auto sm:h-[4.875rem]"
                  />
                </li>
              ))}
            </ul>
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
                    className="hover:text-lavender active:text-lavender-soft flex min-h-10 items-center text-base leading-6 text-white transition"
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
                    className="hover:text-lavender active:text-lavender-soft flex min-h-10 items-center text-base leading-6 text-white transition"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* The oversized ghost mark that sits in the right-hand column. */}
          {/*
            The frame sets this as a large soft watermark filling the column,
            not a small mark tucked in the corner.
          */}
          <LogoMark className="text-lavender/12 hidden h-44 w-auto self-center justify-self-end lg:block xl:h-56" />
        </div>

        <div className="mt-12 flex flex-col gap-4 pb-10 text-sm leading-6 text-white sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <p data-testid="footer-copyright">
            {t("footer.copyright", { year })}
          </p>
          <p className="flex items-center gap-3">
            <a
              href={`${site.scannerBaseUrl}/terms`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-lavender inline-flex min-h-10 items-center transition"
              data-testid="footer-terms"
            >
              {t("footer.terms")}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={`${site.scannerBaseUrl}/privacy`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-lavender inline-flex min-h-10 items-center transition"
              data-testid="footer-privacy"
            >
              {t("footer.privacy")}
            </a>
          </p>
        </div>
      </div>

      {/* Oversized outlined wordmark bleeding off the bottom edge. */}
      <LogoWordmarkOutline className="text-lavender/30 relative -mb-4 h-24 w-full sm:h-36 lg:h-52" />
    </footer>
  );
}
