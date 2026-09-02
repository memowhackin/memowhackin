import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { LinkedInIcon, YouTubeIcon } from "@/components/common/BrandIcons";
import { LogoLockup } from "@/components/common/Logo";
import { site } from "@/config/site";
import { legalPaths } from "@/content/legal";

/** The footer's quick links, now real routes rather than in-page anchors. */
const quickLinks = [
  { key: "home", to: "/", label: "nav.home" },
  {
    key: "argus",
    to: "/argus/live-pentest-workspace",
    label: "nav.argus.label",
  },
  { key: "knowledgeBase", to: "/knowledge-base", label: "nav.knowledgeBase" },
  { key: "about", to: "/about", label: "nav.about" },
  { key: "contact", to: "/contact", label: "nav.contact" },
  { key: "blog", to: "/blog", label: "nav.blog" },
] as const;

/**
 * Where to find us. These are the company's own profiles, so they leave the
 * site — hence plain anchors rather than router `Link`s, with `noreferrer
 * noopener` on each.
 *
 * The icon is a component rather than a name to look up, so a typo cannot
 * compile; adding a network means adding its mark to `BrandIcons`.
 */
const socialLinks = [
  {
    key: "linkedin",
    href: site.linkedInUrl,
    label: "footer.linkedIn",
    Icon: LinkedInIcon,
  },
  {
    key: "youtube",
    href: site.youTubeUrl,
    label: "footer.youTube",
    Icon: YouTubeIcon,
  },
] as const;

/**
 * Certifications, in the order the frame lists them. One height each, and every
 * badge takes the width its own artwork asks for — which is the same width, to
 * within a pixel, now that all three files are the frame's own.
 *
 * The OSAI file was not. It was a crop of the badge, blown up about 7% with the
 * hexagon's left and right edges cut away and its outline lost, so the lettering
 * ran to the very edge of the picture with nothing around it. Beside two badges
 * that were whole, it read as a different, fatter shape.
 *
 * Everything this went through before was an attempt to fix that in CSS: a
 * shared hexagon clip to disguise the missing outline, then a scale to push the
 * short points back out to that clip, then a narrower box to compensate for the
 * width. All of them reshaped artwork to work around a broken source. With the
 * frame's export in place there is nothing to work around, so the clip, the
 * scale and the per-badge box are all gone.
 */
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
    width: 289,
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
 * Read once at module load rather than on every render: reading the clock
 * during render is impure, and a copyright year that changes mid-session is not
 * a behaviour anyone needs.
 */
const year = new Date().getFullYear();

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    /*
     * No background of its own. The page already stands on `ink`, and the
     * closing block's robot hands run down into the top of this footer the way
     * the frame draws them — a background here would paint over the forearm.
     * Without one the hands stay visible and the footer's own content, drawn
     * after them, still lands on top.
     */
    <footer
      className="relative isolate overflow-hidden pt-12 lg:pt-16"
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

      <div className="relative mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-16 2xl:px-0">
        {/*
          The watermark: the frame's wordmark, exported whole — outlined
          letterforms each carrying their own lavender ramp inside the file, one
          asset that scales. It is pinned across the very bottom of the footer as
          the page's sign-off, spanning the content column and sitting behind
          everything (`-z-10`) so the copyright row reads over its top edge — a
          clean base the footer ends on rather than a strip bolted under it. Its
          own look is unchanged: the same gradient asset, opacity ramp and
          brightness as before.

          It still fades out by resolution rather than switching off. The frame's
          strokes are hairlines, so on a narrow screen they fall under a pixel
          and the word comes out as haze; the stepped opacity and half-second
          crossfade let it recede into the ground instead, and by 480px it is
          gone. `overflow-hidden` on the footer keeps the full-width word from
          opening a horizontal scrollbar.
        */}
        <img
          src="/assets/wordmark-assistsec.svg"
          alt=""
          width={1608}
          height={248}
          loading="lazy"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden w-full max-w-none opacity-25 brightness-125 transition-[opacity,filter] duration-500 ease-out min-[30rem]:block min-[34rem]:opacity-45 sm:opacity-70 md:opacity-100 lg:brightness-100"
        />

        {/*
          Three tracks of content, with the frame's outlined mark filling the
          fourth. That corner is empty otherwise — the links run out two thirds
          of the way across and leave a hole on the right, which is exactly the
          space the frame gives this.

          The mark takes a track of its own, which is how the frame lays this
          row out: the two link columns and the mark sit on one pitch — 756,
          1077 and 1388 of the frame's 1920 — so the run reads as four even
          columns after the wide first one. Laid over the row instead it landed
          on top of the social links, because the third column stretches to the
          container's edge.
        */}
        <div className="relative">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20">
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
                    <li
                      key={badge.key}
                      data-testid={`footer-badge-${badge.key}`}
                    >
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
                        className="h-14 w-auto sm:h-16"
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
                    <Link
                      to={link.to}
                      data-testid={`footer-link-${link.key}`}
                      /*
                       * The tighter desktop row is for mice only. Keyed to `lg`
                       * alone it also applied to a 1024px tablet, where these
                       * links are thumbed and 36px is too small to hit.
                       */
                      className="text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition-colors lg:pointer-fine:min-h-9"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/*
              Where to find us, in the track the frame left for it beside the
              quick links.

              Deliberately built to the column on its left: same eyebrow, same
              stacked rows, same row height and hover. The only thing added is
              the mark, in a tile that lights with the label — one `group` per
              row, so the glyph, its tile and the text all answer a hover
              together instead of the icon sitting inert beside a colour
              change. Anything louder here — filled brand colours, a row of
              bare circular buttons — would outweigh the navigation it sits
              next to, which is the more useful of the two.
            */}
            <nav aria-label={t("footer.connect")} data-testid="footer-socials">
              <h2 className="eyebrow text-lavender mb-4">
                {t("footer.connect")}
              </h2>
              <ul className="flex flex-col">
                {socialLinks.map(({ key, href, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-testid={`footer-social-${key}`}
                      // Row rhythm copied from the quick links, including the
                      // tighter desktop row for mice only.
                      className="group text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center gap-3 text-base leading-6 transition-colors lg:pointer-fine:min-h-9"
                    >
                      <span className="border-lavender/20 bg-lavender/5 group-hover:border-lavender/45 group-hover:bg-lavender/15 grid size-8 shrink-0 place-items-center rounded-lg border transition-colors">
                        <Icon className="size-4" />
                      </span>
                      {t(label)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/*
              The outlined mark keeps the fourth track it has always sat in,
              pinned to column 4 explicitly so it stays put whatever the
              columns to its left do.
            */}
            <img
              src="/assets/footer-mark-outline.svg"
              alt=""
              width={277}
              height={239}
              loading="lazy"
              aria-hidden="true"
              className="pointer-events-none hidden w-full max-w-[17.25rem] self-start justify-self-end lg:col-start-4 lg:block"
            />
          </div>
        </div>

        <div className="border-lavender/15 text-mist/55 mt-12 flex flex-col gap-2 border-t border-dashed pt-6 pb-12 text-sm leading-6 sm:flex-row sm:items-center sm:justify-between lg:mt-16 lg:pb-16">
          <p data-testid="footer-copyright">
            {t("footer.copyright", { year })}
          </p>
          {/*
            The site's own legal pages, so router links: they used to point at
            the scanner app's `/terms` and `/privacy`, which left a visitor on
            another host reading a policy that never mentioned this site.
          */}
          <p className="flex items-center gap-3">
            <Link
              to={legalPaths.termsOfService}
              className="hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11"
              data-testid="footer-terms"
            >
              {t("footer.terms")}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to={legalPaths.privacyPolicy}
              className="hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11"
              data-testid="footer-privacy"
            >
              {t("footer.privacy")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
