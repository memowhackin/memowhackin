import { useTranslation } from "react-i18next";
import { LogoLockup } from "@/components/common/Logo";
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
    /*
     * No background of its own. The page already stands on `ink`, and the
     * closing block's robot hands run down into the top of this footer the way
     * the frame draws them — a background here would paint over the forearm.
     * Without one the hands stay visible and the footer's own content, drawn
     * after them, still lands on top.
     */
    <footer
      className="relative isolate overflow-hidden pt-16 lg:pt-20"
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
          Three tracks of content, with the frame's outlined mark filling the
          fourth. That corner is empty otherwise — the links run out two thirds
          of the way across and leave a hole under the partner logos, which is
          exactly the space the frame gives this.

          The mark takes a track of its own, which is how the frame lays this
          row out: the two link columns and the mark sit on one pitch — 756,
          1077 and 1388 of the frame's 1920 — so the run reads as four even
          columns after the wide first one. Laid over the row instead it landed
          on top of the social links, because the third column stretches to the
          container's edge.
        */}
        <div className="relative">
          {/*
            The watermark: the frame's wordmark, exported whole out of "Group
            2147229684" — twelve outlined letterforms, both bowls of every `s`,
            the dot of the `i` and the crossbar of the `t`, each carrying its
            own ramp. A lavender stroke over a fill running `rgba(173,157,238,0)`
            at 23.54% of a letter's height to `rgba(173,157,238,0.1)` at 148.15%,
            all of it inside the file: one asset, and it scales.

            It runs behind this row — the description and both link columns —
            rather than in a band of its own under the page, which is what makes
            it ground rather than a strip bolted to the foot.

            It stops short of the outlined mark instead of running under it: two
            marks of the same brand crossing each other read as a mistake, so
            the word takes the three content tracks and the mark keeps the
            fourth. Below `lg` the mark is gone and the columns stack, so the
            word centres on the row instead.

            Everything paints over it (`-z-10`), and at this stroke weight
            nothing it crosses loses contrast.

            What it cannot keep as it shrinks is its weight. The frame's strokes
            are hairlines at 1920, so on a phone — where the row is around 270px
            across, a sixth of the artwork — they land under a pixel and the
            word comes out as grey haze rather than as letterforms. Brightness
            was being wound up to 1.6 to fight that, which only made the haze
            brighter.

            So it fades out as it loses resolution instead of switching off. The
            steps are close together (480, 544, 640, 768) and carry a transition,
            which is what makes a drag-resize read as the word receding into the
            ground rather than as a layer being toggled. By 480 it is gone.

            Opacity has to be stepped rather than driven straight off the width:
            `calc()` will not divide a length by a length, so there is no way to
            turn "how wide is the viewport" into a bare number for `opacity`
            without script. Four steps and a half-second crossfade get there.

            Two more things it has to survive, both measured rather than guessed.

            The move at `lg`. The word is centred on the row while the columns
            stack and left-anchored once the outlined mark takes the fourth
            track, and crossing that breakpoint slid it 82px sideways in a single
            frame. The anchor still changes — that is the layout — but `width`,
            `left` and `translate` now ride the same half-second as the fade, so
            it travels instead of jumping.

            The row's height. This is sized off the row's width, and the row's
            height is set by its content: 850px with the columns stacked on a
            phone, 252px across four tracks on a desktop. Held to width alone the
            word came out at 6% of the row's height in the first case and 65% in
            the second — a sliver lost in a tall stack at one end, a slab filling
            the row at the other. The height cap holds the top end: within
            `object-contain` the artwork keeps its own proportions inside a box
            that can no longer grow past three fifths of the row.

            The bottom end is not a sizing problem, it is a placement one. The
            artwork is 6.5:1, so on a narrow column no width will give it height
            — stretching it further only pushes it off the sides. Measured
            against the stack, a word centred on an 850px row lands at y=425,
            which is the gap between the certification badges and the link
            columns: dead space, grounding nothing. So below `lg` it is hung at
            15% instead, which puts it across the logo and the description — the
            identity block, the one thing in a footer a brand word belongs
            behind. A percentage rather than a fixed offset because that block
            grows with the translation.

            It also bleeds back through the container's gutters there. Contained,
            it was a strip floating inside margins on the one layout with no room
            to spare; full width it reads as ground the column sits on. The
            offsets undo the gutters exactly (`px-6`, then `px-10`) rather than
            using `100vw`, which would count the scrollbar and put the page into
            horizontal scroll.

            `object-left` from `lg` is what keeps the two rules from fighting.
            Once the height cap bites, the artwork is narrower than the box it
            sits in, and `object-contain` centres it there by default — which
            floated the word 43px clear of the left edge it is anchored to, so
            it no longer started where the description column starts.
          */}
          <img
            src="/assets/wordmark-assistsec.svg"
            alt=""
            width={1608}
            height={248}
            loading="lazy"
            aria-hidden="true"
            className="pointer-events-none absolute top-[15%] left-1/2 -z-10 hidden max-h-[60%] w-[calc(100%+3rem)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-25 brightness-125 transition-[opacity,filter,width,top,left,translate] duration-500 ease-out min-[30rem]:block min-[34rem]:opacity-45 sm:w-[calc(100%+5rem)] sm:opacity-70 md:opacity-100 lg:top-1/2 lg:left-0 lg:w-[74%] lg:translate-x-0 lg:object-left lg:brightness-100"
          />

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
                    <a
                      href={link.href}
                      data-testid={`footer-link-${link.key}`}
                      /*
                       * The tighter desktop row is for mice only. Keyed to `lg`
                       * alone it also applied to a 1024px tablet, where these
                       * links are thumbed and 36px is too small to hit.
                       */
                      className="text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition-colors lg:pointer-fine:min-h-9"
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
                      /*
                       * The tighter desktop row is for mice only. Keyed to `lg`
                       * alone it also applied to a 1024px tablet, where these
                       * links are thumbed and 36px is too small to hit.
                       */
                      className="text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition-colors lg:pointer-fine:min-h-9"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <img
              src="/assets/footer-mark-outline.svg"
              alt=""
              width={277}
              height={239}
              loading="lazy"
              aria-hidden="true"
              className="pointer-events-none hidden w-full max-w-[17.25rem] self-start justify-self-end lg:block"
            />
          </div>
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
              className="hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11"
              data-testid="footer-terms"
            >
              {t("footer.terms")}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={`${site.scannerBaseUrl}/privacy`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11"
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
