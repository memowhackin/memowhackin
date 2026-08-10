const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/routes-A7qIJFrY.js",
      "assets/rolldown-runtime-CbXtAM7H.js",
      "assets/i18n-CUYc3bXQ.js",
      "assets/react-BoQDZqka.js",
      "assets/site-XpzRHtgl.js",
    ]),
) => i.map((i) => d[i]);
import { n as e } from "./rolldown-runtime-CbXtAM7H.js";
import { i as t, n, o as r, r as i, t as a } from "./i18n-CUYc3bXQ.js";
import { n as o, t as s } from "./react-BoQDZqka.js";
import {
  a as c,
  i as l,
  n as u,
  o as d,
  r as f,
  s as p,
  t as m,
} from "./tanstack-DVMd6bCO.js";
import {
  a as h,
  c as g,
  i as _,
  l as v,
  n as y,
  r as b,
  s as x,
  t as S,
} from "./site-XpzRHtgl.js";
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var C = e(r(), 1),
  w = e(o(), 1),
  T = g(`menu`, [
    [`path`, { d: `M4 5h16`, key: `1tepv9` }],
    [`path`, { d: `M4 12h16`, key: `1lakjw` }],
    [`path`, { d: `M4 19h16`, key: `1djgab` }],
  ]),
  E = g(`x`, [
    [`path`, { d: `M18 6 6 18`, key: `1bl5f8` }],
    [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }],
  ]),
  D = { noTranslations: !1 },
  ee = {
    app: {
      title: `AssistSec`,
      description: `AI-assisted penetration testing. Europe's most experienced pentesters, backed by autonomous agents.`,
    },
    nav: {
      services: `Services`,
      aboutUs: `About us`,
      demonstrate: `Demonstrate`,
      blog: `Blog`,
      login: `Login`,
      bookDemo: `Book demo`,
      language: `Language`,
      openMenu: `Open menu`,
      closeMenu: `Close menu`,
      primary: `Primary`,
      skipToContent: `Skip to content`,
      languageNames: { en: `English`, nl: `Dutch` },
    },
    announcement: {
      badge: `Explore`,
      text: `Use our free scanner to check your security!`,
    },
    hero: {
      title: `Cybersecurity with AI‑assisted pentesting.`,
      body: `We use Europe's top pentesters to make organizations digitally resilient. Through advanced testing and red teaming, we expose vulnerabilities before attackers exploit them.`,
      cta: `Book a live demo`,
      dashboardAlt: `AssistSec portal showing API security findings`,
    },
    platform: {
      eyebrow: `About AssistSec`,
      poweredBy: `Powered by innovation and next-generation artificial intelligence`,
      tags: {
        apiTesting: `API testing`,
        credentials: `Credential secured`,
        pentesting: `Pentesting`,
      },
      leadStrong: `We combine the expertise of Europe's most experienced pentesters to make organizations digitally resilient. Through advanced penetration testing and offensive red teaming,`,
      leadMuted: `we proactively expose vulnerabilities before malicious actors can exploit them.`,
      partnerAlt: `{{name}} logo`,
    },
    agents: {
      title: `Autonomous agents
for the test work.`,
      subtitle: `Senior security experts oversee every finding.`,
      cta: `Book a demo`,
      skylineAlt: `City skyline at dusk`,
      alerts: {
        apiTesting: `API testing`,
        files: `Secure files alerts`,
        credentials: `Credential hacking alert`,
        attack: `Cyberattack detected`,
      },
    },
    services: {
      badge: `Offering services`,
      exploreMore: `Explore more`,
      pentesting: {
        title: `Pentesting`,
        body: `Applications, APIs, and infrastructure. Autonomous AI agents undergo thorough validation by experts to ensure reliability and performance.`,
      },
      cloud: {
        title: `Cloud security testing`,
        body: `AWS, Azure, and GCP are key cloud platforms. Keep exploring their configurations and common misconfigurations to deepen your understanding and improve your skills.`,
      },
      redTeaming: {
        title: `Red teaming`,
        body: `Realistic simulations that cover end-to-end scenarios, designed in collaboration with offensive specialists to ensure comprehensive training.`,
      },
      alt: {
        pentesting: `Threat coverage view in the AssistSec portal`,
        cloud: `Overall security score view in the AssistSec portal`,
        redTeaming: `Cloud and identity provider coverage in the AssistSec portal`,
      },
    },
    why: {
      title: `Get hacked by AssistSec.`,
      cta: `Book a demo`,
      scope: {
        title: `Custom scope`,
        body: `Web, API, cloud, or red team. Tailored to your risks.`,
      },
      experts: {
        title: `AI + experts`,
        body: `Officers do the heavy lifting. Every finding is validated.`,
      },
      insight: {
        title: `Immediate insight`,
        body: `Findings live in your portal. No waiting for the report.`,
      },
    },
    benefits: {
      title: `What are the benefits of an AI-assisted pentest?`,
      reportIntro: `The findings are included in a final report, including a clear management summary.`,
      reportBody: `Vulnerabilities are evaluated and provided with recommendations, prioritized based on risk.`,
      cta: `Request sample report`,
      labels: {
        summary: `Management summary`,
        vectors: `Possible attack vectors`,
        risk: `Ranked risk assessment`,
        scope: `Test scope and methodology`,
        steps: `Steps for troubleshooting`,
      },
    },
    blog: {
      title: `Our latest blogs`,
      viewAll: `View all blogs`,
      viewDetails: `View details`,
      outroIntro: `Do you want to know what developments are taking place and what our specialists are working on? Discover the latest news on pentesting, hacking, security research, and compliance here.`,
      outroFollow: `Do you want to stay up to date with all updates? Then follow us on`,
      posts: {
        rules: {
          date: `4 Jun 2026`,
          title: `How AI pentesting changes the rules of the game`,
          excerpt: `Automated scans and human expertise reinforce each other. This is what that looks like in practice.`,
        },
        owasp: {
          date: `28 Mar 2026`,
          title: `OWASP Top 10 in 2026: what you need to know`,
          excerpt: `A practical guide for development and security teams that want to address vulnerabilities structurally.`,
        },
        compliance: {
          date: `4 Jun 2026`,
          title: `Compliance without compromising on speed`,
          excerpt: `ISO 27001 and NIS2 require demonstrable control. This way, you remain audit-ready without losing momentum.`,
        },
      },
      linkedIn: `LinkedIn`,
    },
    cta: {
      title: `Interested in a pentest?`,
      body: `Discover how AI-backed pentesting gives your organization faster and more thorough insight into vulnerabilities.`,
      action: `Book a demo`,
      imageAlt: `Robotic hand reaching out`,
    },
    trusted: {
      title: `We partnered with industry experts to deliver the next generation of penetration testing.`,
    },
    footer: {
      about: `We are an AI-assisted penetration testing company. We provide Ethical Hacking services, and also provide subscriptions in some sort of SaaS model.`,
      quickLinks: `Quick links`,
      connect: `Connect with`,
      certifications: `Certifications`,
      home: `Home`,
      copyright: `© Copyright {{year}} AssistSec. All Rights Reserved.`,
      terms: `Terms of Service`,
      privacy: `Privacy Policy`,
      badgeAlt: `{{name}} certification badge`,
      partnerAlt: `{{name}} logo`,
    },
    error: {
      title: `Something went wrong`,
      body: `This page could not be loaded. Trying again usually fixes it.`,
      retry: `Try again`,
      notFound: `This page does not exist.`,
      backHome: `Back to home`,
    },
  },
  te = {
    app: {
      title: `AssistSec`,
      description: `AI-ondersteunde penetratietesten. De meest ervaren pentesters van Europa, versterkt door autonome agents.`,
    },
    nav: {
      services: `Diensten`,
      aboutUs: `Over ons`,
      demonstrate: `Demonstratie`,
      blog: `Blog`,
      login: `Inloggen`,
      bookDemo: `Demo boeken`,
      language: `Taal`,
      openMenu: `Menu openen`,
      closeMenu: `Menu sluiten`,
      primary: `Hoofdmenu`,
      skipToContent: `Naar de inhoud`,
      languageNames: { en: `Engels`, nl: `Nederlands` },
    },
    announcement: {
      badge: `Ontdek`,
      text: `Gebruik onze gratis scanner om uw beveiliging te controleren!`,
    },
    hero: {
      title: `Cyberveiligheid met AI‑assisted pentesting.`,
      body: `Wij zetten de beste pentesters van Europa in om organisaties digitaal weerbaar te maken. Met geavanceerde tests en red teaming leggen we kwetsbaarheden bloot voordat aanvallers ze misbruiken.`,
      cta: `Boek een live demo`,
      dashboardAlt: `AssistSec-portaal met API-beveiligingsbevindingen`,
    },
    platform: {
      eyebrow: `Over AssistSec`,
      poweredBy: `Aangedreven door innovatie en next-generation kunstmatige intelligentie`,
      tags: {
        apiTesting: `API-testen`,
        credentials: `Inloggegevens beveiligd`,
        pentesting: `Pentesting`,
      },
      leadStrong: `Wij combineren de expertise van de meest ervaren pentesters van Europa om organisaties digitaal weerbaar te maken. Met geavanceerde penetratietesten en offensieve red teaming,`,
      leadMuted: `leggen we kwetsbaarheden proactief bloot voordat kwaadwillenden ze kunnen misbruiken.`,
      partnerAlt: `{{name}}-logo`,
    },
    agents: {
      title: `Autonome agents
voor het testwerk.`,
      subtitle: `Senior securityexperts beoordelen elke bevinding.`,
      cta: `Demo boeken`,
      skylineAlt: `Skyline van de stad in de schemering`,
      alerts: {
        apiTesting: `API-testen`,
        files: `Melding beveiligde bestanden`,
        credentials: `Melding gestolen inloggegevens`,
        attack: `Cyberaanval gedetecteerd`,
      },
    },
    services: {
      badge: `Onze diensten`,
      exploreMore: `Lees meer`,
      pentesting: {
        title: `Pentesting`,
        body: `Applicaties, API's en infrastructuur. Autonome AI-agents worden grondig gevalideerd door experts om betrouwbaarheid en prestaties te garanderen.`,
      },
      cloud: {
        title: `Cloud security testing`,
        body: `AWS, Azure en GCP zijn cruciale cloudplatformen. Wij onderzoeken de configuraties en veelvoorkomende misconfiguraties om uw risico's scherp in beeld te brengen.`,
      },
      redTeaming: {
        title: `Red teaming`,
        body: `Realistische simulaties van end-to-end scenario's, ontworpen samen met offensieve specialisten voor een volledige beproeving van uw weerbaarheid.`,
      },
      alt: {
        pentesting: `Overzicht van dreigingsdekking in het AssistSec-portaal`,
        cloud: `Overzicht van de totale beveiligingsscore in het AssistSec-portaal`,
        redTeaming: `Dekking van cloud- en identityproviders in het AssistSec-portaal`,
      },
    },
    why: {
      title: `Laat u hacken door AssistSec.`,
      cta: `Demo boeken`,
      scope: {
        title: `Eigen scope`,
        body: `Web, API, cloud of red team. Afgestemd op uw risico's.`,
      },
      experts: {
        title: `AI + experts`,
        body: `Agents doen het zware werk. Elke bevinding wordt gevalideerd.`,
      },
      insight: {
        title: `Direct inzicht`,
        body: `Bevindingen staan live in uw portaal. Geen wachten op het rapport.`,
      },
    },
    benefits: {
      title: `Wat zijn de voordelen van een AI-assisted pentest?`,
      reportIntro: `De bevindingen worden opgenomen in een eindrapport, inclusief een heldere managementsamenvatting.`,
      reportBody: `Kwetsbaarheden worden beoordeeld en voorzien van aanbevelingen, geprioriteerd op basis van risico.`,
      cta: `Voorbeeldrapport aanvragen`,
      labels: {
        summary: `Managementsamenvatting`,
        vectors: `Mogelijke aanvalsvectoren`,
        risk: `Gerangschikte risicobeoordeling`,
        scope: `Testscope en methodologie`,
        steps: `Stappen voor het oplossen`,
      },
    },
    blog: {
      title: `Onze laatste blogs`,
      viewAll: `Alle blogs bekijken`,
      viewDetails: `Lees verder`,
      outroIntro: `Wilt u weten welke ontwikkelingen er spelen en waar onze specialisten aan werken? Ontdek hier het laatste nieuws over pentesting, hacking, security research en compliance.`,
      outroFollow: `Wil je op de hoogte blijven van alle updates? Volg ons dan op`,
      posts: {
        rules: {
          date: `4 jun 2026`,
          title: `Hoe AI-pentesting de spelregels verandert`,
          excerpt: `Geautomatiseerde scans en menselijke expertise versterken elkaar. Zo ziet dat er in de praktijk uit.`,
        },
        owasp: {
          date: `28 mrt 2026`,
          title: `OWASP Top 10 in 2026: wat u moet weten`,
          excerpt: `Een praktische gids voor ontwikkel- en securityteams die kwetsbaarheden structureel willen aanpakken.`,
        },
        compliance: {
          date: `4 jun 2026`,
          title: `Compliance zonder in te leveren op snelheid`,
          excerpt: `ISO 27001 en NIS2 vragen om aantoonbare beheersing. Zo blijft u audit-ready zonder vaart te verliezen.`,
        },
      },
      linkedIn: `LinkedIn`,
    },
    cta: {
      title: `Interesse in een pentest?`,
      body: `Ontdek hoe AI-ondersteunde pentesting uw organisatie sneller en grondiger inzicht geeft in kwetsbaarheden.`,
      action: `Demo boeken`,
      imageAlt: `Uitgestoken robothand`,
    },
    trusted: {
      title: `Wij werken samen met experts uit de industrie om de volgende generatie penetratietesten te leveren.`,
    },
    footer: {
      about: `Wij zijn een AI-ondersteund penetratietestbedrijf. We leveren ethical hacking-diensten en bieden daarnaast abonnementen aan in een SaaS-model.`,
      quickLinks: `Snelle links`,
      connect: `Volg ons op`,
      certifications: `Certificeringen`,
      home: `Home`,
      copyright: `© Copyright {{year}} AssistSec. Alle rechten voorbehouden.`,
      terms: `Algemene voorwaarden`,
      privacy: `Privacybeleid`,
      badgeAlt: `{{name}}-certificeringsbadge`,
      partnerAlt: `{{name}}-logo`,
    },
    error: {
      title: `Er is iets misgegaan`,
      body: `Deze pagina kon niet worden geladen. Opnieuw proberen lost het meestal op.`,
      retry: `Opnieuw proberen`,
      notFound: `Deze pagina bestaat niet.`,
      backHome: `Terug naar home`,
    },
  },
  O = [`en`, `nl`],
  k = `assistsec-locale`;
function A() {
  try {
    return globalThis.localStorage?.getItem(k) ?? null;
  } catch {
    return null;
  }
}
function j(e) {
  try {
    globalThis.localStorage?.setItem(k, e);
  } catch {}
}
var M = t(),
  N = M.use(i).init({
    debug: !1,
    lng: D.noTranslations ? `en` : (A() ?? `en`),
    fallbackLng: `en`,
    defaultNS: `translation`,
    ns: [`translation`],
    resources: { en: { translation: ee }, nl: { translation: te } },
    interpolation: { escapeValue: !1 },
  });
function P(e) {
  (j(e), M.changeLanguage(e));
}
var F = s();
function I({ className: e, "data-testid": t }) {
  let { t: r, i18n: i } = n();
  return (0, F.jsx)(`div`, {
    role: `group`,
    "aria-label": r(`nav.language`),
    "data-testid": t,
    className: v(
      `border-indigo-deep bg-ink-deep/60 rounded-selector inline-flex items-center border p-0.5`,
      e,
    ),
    children: O.map((e) => {
      let n = i.resolvedLanguage === e;
      return (0, F.jsx)(
        `button`,
        {
          type: `button`,
          onClick: () => {
            P(e);
          },
          "aria-pressed": n,
          title: r(`nav.languageNames.${e}`),
          "data-testid": `${t}-${e}`,
          className: v(
            `rounded-selector pointer-coarse:min-h-11 inline-flex min-h-9 min-w-11 items-center justify-center px-3 text-xs font-medium uppercase transition-colors`,
            n
              ? `bg-lavender text-ink-deep`
              : `text-mist/70 hover:text-mist hover:bg-indigo-deep/60`,
          ),
          children: e,
        },
        e,
      );
    }),
  });
}
var L = [
  { key: `services`, target: S.services, label: `nav.services` },
  { key: `aboutUs`, target: S.about, label: `nav.aboutUs` },
  { key: `demonstrate`, target: S.demonstrate, label: `nav.demonstrate` },
  { key: `blog`, target: S.blog, label: `nav.blog` },
];
function R() {
  let [e, t] = (0, C.useState)();
  return (
    (0, C.useEffect)(() => {
      let e = L.map((e) => document.getElementById(e.target)).filter(
        (e) => e !== null,
      );
      if (e.length === 0) return;
      let n = new Set(),
        r = new IntersectionObserver(
          (e) => {
            for (let t of e)
              t.isIntersecting ? n.add(t.target.id) : n.delete(t.target.id);
            let r = L.find((e) => n.has(e.target));
            t(r?.target);
          },
          { rootMargin: `-20% 0px -55% 0px` },
        );
      for (let t of e) r.observe(t);
      return () => {
        r.disconnect();
      };
    }, []),
    e
  );
}
function z() {
  let { t: e } = n(),
    [t, r] = (0, C.useState)(!1),
    [i, a] = (0, C.useState)(() => typeof window < `u` && window.scrollY > 8),
    o = (0, C.useRef)(null),
    s = (0, C.useRef)(null),
    c = (0, C.useRef)(null),
    l = R();
  return (
    (0, C.useEffect)(() => {
      let e = o.current;
      if (!e) return;
      let t = new ResizeObserver((e) => {
        let t = e[0]?.contentRect.height;
        t !== void 0 &&
          document.documentElement.style.setProperty(
            `--header-height`,
            `${(t / 16).toString()}rem`,
          );
      });
      return (
        t.observe(e),
        () => {
          t.disconnect();
        }
      );
    }, []),
    (0, C.useEffect)(() => {
      if (!t) return;
      function e(e) {
        e.key === `Escape` && (r(!1), c.current?.focus());
      }
      function n(e) {
        let t = e.target;
        (t instanceof Node && s.current?.contains(t)) || r(!1);
      }
      return (
        window.addEventListener(`keydown`, e),
        document.addEventListener(`pointerdown`, n),
        () => {
          (window.removeEventListener(`keydown`, e),
            document.removeEventListener(`pointerdown`, n));
        }
      );
    }, [t]),
    (0, C.useEffect)(() => {
      let e = window.matchMedia(`(min-width: 64rem)`);
      function t(e) {
        e.matches && r(!1);
      }
      return (
        e.addEventListener(`change`, t),
        () => {
          e.removeEventListener(`change`, t);
        }
      );
    }, []),
    (0, C.useEffect)(() => {
      function e() {
        a(window.scrollY > 8);
      }
      return (
        window.addEventListener(`scroll`, e, { passive: !0 }),
        () => {
          window.removeEventListener(`scroll`, e);
        }
      );
    }, []),
    (0, F.jsxs)(`header`, {
      ref: s,
      className: v(
        `sticky top-0 z-50 w-full transition-colors duration-300`,
        i || t ? `bg-ink-deep/80 backdrop-blur-md` : `bg-transparent`,
      ),
      children: [
        (0, F.jsxs)(`div`, {
          ref: o,
          children: [
            (0, F.jsxs)(`a`, {
              href: y.scannerBaseUrl,
              target: `_blank`,
              rel: `noreferrer noopener`,
              "data-testid": `announcement-bar`,
              className: `brand-sweep flex w-full items-center justify-center gap-2 px-4 py-2 text-center transition-[filter] hover:brightness-110 pointer-coarse:min-h-11`,
              children: [
                (0, F.jsx)(`span`, {
                  className: `bg-lavender text-ink-deep rounded-selector hidden shrink-0 px-3 py-0.5 text-xs font-semibold sm:inline`,
                  children: e(`announcement.badge`),
                }),
                (0, F.jsx)(`span`, {
                  className: `min-w-0 text-xs tracking-[0.02em] text-balance text-white sm:truncate sm:text-sm`,
                  children: e(`announcement.text`),
                }),
                (0, F.jsx)(x, {
                  className: `size-4 shrink-0 text-white`,
                  "aria-hidden": `true`,
                }),
              ],
            }),
            (0, F.jsxs)(`div`, {
              className: `mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-10 sm:py-4 lg:px-16 2xl:px-0`,
              children: [
                (0, F.jsx)(`a`, {
                  href: `#top`,
                  "data-testid": `header-logo`,
                  "aria-label": e(`app.title`),
                  className: `inline-flex shrink-0 items-center py-2 pointer-coarse:min-h-11`,
                  children: (0, F.jsx)(h, {
                    className: `text-mist h-5 w-auto sm:h-6`,
                  }),
                }),
                (0, F.jsx)(`nav`, {
                  "aria-label": e(`nav.primary`),
                  className: `hidden min-w-0 items-center gap-6 lg:flex xl:gap-10`,
                  children: L.map((t) => {
                    let n = l === t.target;
                    return (0, F.jsx)(
                      `a`,
                      {
                        href: `#${t.target}`,
                        "aria-current": n ? `true` : void 0,
                        "data-testid": `nav-${t.key}`,
                        className: v(
                          `decoration-lavender pointer-coarse:min-h-11 relative inline-flex items-center py-2 text-base underline-offset-8 transition-colors hover:underline`,
                          n
                            ? `text-lavender`
                            : `hover:text-lavender text-white`,
                        ),
                        children: e(t.label),
                      },
                      t.key,
                    );
                  }),
                }),
                (0, F.jsxs)(`div`, {
                  className: `flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-6`,
                  children: [
                    !D.noTranslations &&
                      (0, F.jsx)(`div`, {
                        className: `hidden lg:block`,
                        children: (0, F.jsx)(I, {
                          "data-testid": `language-switcher`,
                        }),
                      }),
                    (0, F.jsx)(`a`, {
                      href: y.loginUrl,
                      target: `_blank`,
                      rel: `noreferrer noopener`,
                      "data-testid": `header-login`,
                      className: `hover:text-lavender hidden items-center text-base whitespace-nowrap text-white transition-colors lg:inline-flex pointer-coarse:min-h-11`,
                      children: e(`nav.login`),
                    }),
                    (0, F.jsx)(`div`, {
                      className: `hidden sm:block`,
                      children: (0, F.jsx)(b, {
                        href: y.bookDemoUrl,
                        variant: `sweep`,
                        size: `sm`,
                        "data-testid": `header-book-demo`,
                        children: e(`nav.bookDemo`),
                      }),
                    }),
                    (0, F.jsx)(`button`, {
                      ref: c,
                      type: `button`,
                      onClick: () => {
                        r((e) => !e);
                      },
                      "aria-expanded": t,
                      "aria-controls": `mobile-menu`,
                      "aria-label": e(t ? `nav.closeMenu` : `nav.openMenu`),
                      "data-testid": `mobile-menu-toggle`,
                      className: `border-indigo-deep rounded-selector text-mist hover:border-lavender/60 hover:text-lavender active:bg-indigo-deep/60 inline-flex size-11 shrink-0 items-center justify-center border transition-colors lg:hidden`,
                      children: t
                        ? (0, F.jsx)(E, {
                            className: `size-5`,
                            "aria-hidden": `true`,
                          })
                        : (0, F.jsx)(T, {
                            className: `size-5`,
                            "aria-hidden": `true`,
                          }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, F.jsx)(`div`, {
          id: `mobile-menu`,
          "data-testid": `mobile-menu`,
          inert: !t,
          className: v(
            `bg-ink-deep grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out lg:hidden`,
            t
              ? `border-indigo-deep/60 grid-rows-[minmax(0,1fr)] border-t`
              : `grid-rows-[minmax(0,0fr)]`,
          ),
          children: (0, F.jsxs)(`nav`, {
            "aria-label": e(`nav.primary`),
            className: `flex max-h-[calc(100dvh-var(--header-height))] min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-10`,
            children: [
              L.map((t) => {
                let n = l === t.target;
                return (0, F.jsx)(
                  `a`,
                  {
                    href: `#${t.target}`,
                    "aria-current": n ? `true` : void 0,
                    onClick: () => {
                      r(!1);
                    },
                    "data-testid": `mobile-nav-${t.key}`,
                    className: v(
                      `hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition-colors`,
                      n ? `bg-indigo-deep/30 text-lavender` : `text-mist`,
                    ),
                    children: e(t.label),
                  },
                  t.key,
                );
              }),
              (0, F.jsx)(`a`, {
                href: y.loginUrl,
                target: `_blank`,
                rel: `noreferrer noopener`,
                "data-testid": `mobile-login`,
                className: `text-mist hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition-colors`,
                children: e(`nav.login`),
              }),
              (0, F.jsxs)(`div`, {
                className: `border-indigo-deep/60 mt-3 flex flex-wrap items-center justify-between gap-4 border-t px-3 pt-4 pb-2`,
                children: [
                  (0, F.jsx)(`div`, {
                    className: `sm:hidden`,
                    children: (0, F.jsx)(b, {
                      href: y.bookDemoUrl,
                      variant: `sweep`,
                      size: `sm`,
                      "data-testid": `mobile-book-demo`,
                      children: e(`nav.bookDemo`),
                    }),
                  }),
                  !D.noTranslations &&
                    (0, F.jsx)(I, {
                      "data-testid": `mobile-language-switcher`,
                    }),
                ],
              }),
            ],
          }),
        }),
      ],
    })
  );
}
var B = [
    { key: `home`, href: `#top`, label: `footer.home` },
    { key: `services`, href: `#${S.services}`, label: `nav.services` },
    { key: `bookDemo`, href: `#${S.demonstrate}`, label: `nav.bookDemo` },
    { key: `aboutUs`, href: `#${S.about}`, label: `nav.aboutUs` },
    { key: `demonstrate`, href: `#${S.demonstrate}`, label: `nav.demonstrate` },
    { key: `blog`, href: `#${S.blog}`, label: `nav.blog` },
  ],
  V = [
    {
      key: `instagram`,
      label: `Instagram`,
      href: `https://instagram.com/assistsec`,
    },
    { key: `twitter`, label: `Twitter X`, href: `https://x.com/assistsec` },
    { key: `discord`, label: `Discord`, href: `https://discord.gg/assistsec` },
    {
      key: `facebook`,
      label: `Facebook`,
      href: `https://facebook.com/assistsec`,
    },
  ],
  H = [
    {
      key: `oscp`,
      name: `OSCP`,
      src: `/assets/badge-oscp.webp`,
      width: 520,
      height: 600,
    },
    {
      key: `osai`,
      name: `OSAI`,
      src: `/assets/badge-osai.webp`,
      width: 289,
      height: 330,
    },
    {
      key: `oswe`,
      name: `OSWE`,
      src: `/assets/badge-oswe.svg`,
      width: 68,
      height: 78,
    },
  ],
  U = [
    {
      key: `vercel`,
      name: `Vercel`,
      src: `/assets/logo-vercel.svg`,
      width: 95,
      height: 20,
    },
    {
      key: `google`,
      name: `Google`,
      src: `/assets/logo-google.svg`,
      width: 73,
      height: 24,
    },
    {
      key: `meta`,
      name: `Meta`,
      src: `/assets/logo-meta.svg`,
      width: 99,
      height: 20,
    },
    {
      key: `perplexity`,
      name: `Perplexity`,
      src: `/assets/logo-perplexity.svg`,
      width: 108,
      height: 24,
    },
    {
      key: `strava`,
      name: `Strava`,
      src: `/assets/logo-strava.svg`,
      width: 92,
      height: 20,
    },
    {
      key: `duolingo`,
      name: `Duolingo`,
      src: `/assets/logo-duolingo.svg`,
      width: 78,
      height: 20,
    },
    {
      key: `harvard`,
      name: `Harvard University`,
      src: `/assets/logo-harvard.svg`,
      width: 92,
      height: 24,
    },
  ],
  W = new Date().getFullYear();
function G() {
  let { t: e } = n();
  return (0, F.jsxs)(`footer`, {
    className: `relative isolate overflow-hidden pt-16 lg:pt-20`,
    "data-testid": `site-footer`,
    children: [
      (0, F.jsx)(`div`, {
        className: `pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-72 opacity-30 blur-3xl`,
        style: {
          background: `radial-gradient(60% 100% at 50% 100%, #413994 0%, transparent 70%)`,
        },
        "aria-hidden": `true`,
      }),
      (0, F.jsxs)(`div`, {
        className: `relative mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-16 2xl:px-0`,
        children: [
          (0, F.jsxs)(`div`, {
            className: `flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12`,
            children: [
              (0, F.jsx)(`p`, {
                className: `max-w-[21.25rem] text-base leading-6 text-white`,
                children: e(`trusted.title`),
              }),
              (0, F.jsx)(`ul`, {
                className: `flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10`,
                children: U.map((t) =>
                  (0, F.jsx)(
                    `li`,
                    {
                      children: (0, F.jsx)(`img`, {
                        src: t.src,
                        alt: e(`footer.partnerAlt`, { name: t.name }),
                        width: t.width,
                        height: t.height,
                        loading: `lazy`,
                        className: `w-auto`,
                        style: { height: `${(t.height / 16).toString()}rem` },
                      }),
                    },
                    t.key,
                  ),
                ),
              }),
            ],
          }),
          (0, F.jsx)(`hr`, {
            className: `border-lavender/25 my-12 border-t border-dashed lg:my-14`,
          }),
          (0, F.jsxs)(`div`, {
            className: `relative`,
            children: [
              (0, F.jsx)(`img`, {
                src: `/assets/wordmark-assistsec.svg`,
                alt: ``,
                width: 1608,
                height: 248,
                loading: `lazy`,
                "aria-hidden": `true`,
                className: `pointer-events-none absolute top-[15%] left-1/2 -z-10 hidden max-h-[60%] w-[calc(100%+3rem)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-25 brightness-125 transition-[opacity,filter,width,top,left,translate] duration-500 ease-out min-[30rem]:block min-[34rem]:opacity-45 sm:w-[calc(100%+5rem)] sm:opacity-70 md:opacity-100 lg:top-1/2 lg:left-0 lg:w-[74%] lg:translate-x-0 lg:object-left lg:brightness-100`,
              }),
              (0, F.jsxs)(`div`, {
                className: `grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20`,
                children: [
                  (0, F.jsxs)(`div`, {
                    className: `flex flex-col gap-6 sm:col-span-2 lg:col-span-1`,
                    children: [
                      (0, F.jsx)(h, {
                        className: `text-mist h-6 w-auto self-start`,
                      }),
                      (0, F.jsx)(`p`, {
                        className: `text-mist/70 max-w-[34rem] text-base leading-relaxed text-pretty`,
                        children: e(`footer.about`),
                      }),
                      (0, F.jsxs)(`div`, {
                        className: `mt-2 flex flex-col gap-4`,
                        children: [
                          (0, F.jsx)(`h2`, {
                            className: `eyebrow text-lavender`,
                            children: e(`footer.certifications`),
                          }),
                          (0, F.jsx)(`ul`, {
                            className: `flex flex-wrap items-center gap-5 sm:gap-6`,
                            children: H.map((t) =>
                              (0, F.jsx)(
                                `li`,
                                {
                                  "data-testid": `footer-badge-${t.key}`,
                                  children: (0, F.jsx)(`img`, {
                                    src: t.src,
                                    alt: e(`footer.badgeAlt`, { name: t.name }),
                                    width: t.width,
                                    height: t.height,
                                    loading: `lazy`,
                                    className: `h-14 w-auto sm:h-16`,
                                  }),
                                },
                                t.key,
                              ),
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, F.jsxs)(`nav`, {
                    "aria-label": e(`footer.quickLinks`),
                    children: [
                      (0, F.jsx)(`h2`, {
                        className: `eyebrow text-lavender mb-4`,
                        children: e(`footer.quickLinks`),
                      }),
                      (0, F.jsx)(`ul`, {
                        className: `flex flex-col`,
                        children: B.map((t) =>
                          (0, F.jsx)(
                            `li`,
                            {
                              children: (0, F.jsx)(`a`, {
                                href: t.href,
                                "data-testid": `footer-link-${t.key}`,
                                className: `text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition-colors lg:pointer-fine:min-h-9`,
                                children: e(t.label),
                              }),
                            },
                            t.key,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, F.jsxs)(`nav`, {
                    "aria-label": e(`footer.connect`),
                    children: [
                      (0, F.jsx)(`h2`, {
                        className: `eyebrow text-lavender mb-4`,
                        children: e(`footer.connect`),
                      }),
                      (0, F.jsx)(`ul`, {
                        className: `flex flex-col`,
                        children: V.map(({ key: e, label: t, href: n }) =>
                          (0, F.jsx)(
                            `li`,
                            {
                              children: (0, F.jsx)(`a`, {
                                href: n,
                                target: `_blank`,
                                rel: `noreferrer noopener`,
                                "data-testid": `footer-social-${e}`,
                                className: `text-mist/80 hover:text-lavender active:text-lavender-soft flex min-h-11 items-center text-base leading-6 transition-colors lg:pointer-fine:min-h-9`,
                                children: t,
                              }),
                            },
                            e,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, F.jsx)(`img`, {
                    src: `/assets/footer-mark-outline.svg`,
                    alt: ``,
                    width: 277,
                    height: 239,
                    loading: `lazy`,
                    "aria-hidden": `true`,
                    className: `pointer-events-none hidden w-full max-w-[17.25rem] self-start justify-self-end lg:block`,
                  }),
                ],
              }),
            ],
          }),
          (0, F.jsxs)(`div`, {
            className: `border-lavender/15 text-mist/55 mt-12 flex flex-col gap-2 border-t border-dashed pt-6 pb-12 text-sm leading-6 sm:flex-row sm:items-center sm:justify-between lg:mt-16 lg:pb-16`,
            children: [
              (0, F.jsx)(`p`, {
                "data-testid": `footer-copyright`,
                children: e(`footer.copyright`, { year: W }),
              }),
              (0, F.jsxs)(`p`, {
                className: `flex items-center gap-3`,
                children: [
                  (0, F.jsx)(`a`, {
                    href: `${y.scannerBaseUrl}/terms`,
                    target: `_blank`,
                    rel: `noreferrer noopener`,
                    className: `hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11`,
                    "data-testid": `footer-terms`,
                    children: e(`footer.terms`),
                  }),
                  (0, F.jsx)(`span`, { "aria-hidden": `true`, children: `·` }),
                  (0, F.jsx)(`a`, {
                    href: `${y.scannerBaseUrl}/privacy`,
                    target: `_blank`,
                    rel: `noreferrer noopener`,
                    className: `hover:text-lavender inline-flex min-h-9 items-center transition-colors pointer-coarse:min-h-11`,
                    "data-testid": `footer-privacy`,
                    children: e(`footer.privacy`),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
var K = d({ component: q });
function q() {
  let { t: e, i18n: t } = n();
  return (
    (0, C.useEffect)(() => {
      ((document.documentElement.lang = t.language),
        (document.title = `${e(`app.title`)} — ${e(`hero.title`)}`),
        document
          .querySelector(`meta[name="description"]`)
          ?.setAttribute(`content`, e(`app.description`)));
    }, [t.language, e]),
    (0, F.jsxs)(`div`, {
      className: `bg-ink text-mist flex min-h-screen flex-col`,
      children: [
        (0, F.jsx)(`a`, {
          href: `#main`,
          "data-testid": `skip-to-content`,
          className: `bg-lavender text-ink-deep rounded-field sr-only font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2`,
          children: e(`nav.skipToContent`),
        }),
        (0, F.jsx)(z, {}),
        (0, F.jsx)(`main`, {
          id: `main`,
          className: `flex-1`,
          children: (0, F.jsx)(f, {}),
        }),
        (0, F.jsx)(G, {}),
      ],
    })
  );
}
var J = `modulepreload`,
  Y = function (e) {
    return `/` + e;
  },
  X = {},
  Z = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e = document.getElementsByTagName(`link`),
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(
          e.map((e) =>
            Promise.resolve(e).then(
              (e) => ({ status: `fulfilled`, value: e }),
              (e) => ({ status: `rejected`, reason: e }),
            ),
          ),
        );
      }
      function s(e) {
        return import.meta.resolve
          ? import.meta.resolve(e)
          : new URL(e, import.meta.url).href;
      }
      r = o(
        t.map((t) => {
          if (((t = Y(t, n)), (t = s(t)), t in X)) return;
          X[t] = !0;
          let r = t.endsWith(`.css`);
          for (let n = e.length - 1; n >= 0; n--) {
            let i = e[n];
            if (i.href === t && (!r || i.rel === `stylesheet`)) return;
          }
          let i = document.createElement(`link`);
          if (
            ((i.rel = r ? `stylesheet` : J),
            r || (i.as = `script`),
            (i.crossOrigin = ``),
            (i.href = t),
            a && i.setAttribute(`nonce`, a),
            document.head.appendChild(i),
            r)
          )
            return new Promise((e, n) => {
              (i.addEventListener(`load`, e),
                i.addEventListener(`error`, () =>
                  n(Error(`Unable to preload CSS for ${t}`)),
                ));
            });
        }),
      );
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented))
        throw e;
    }
    return r.then((t) => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  },
  ne = {
    IndexRoute: c(`/`)({
      component: l(
        () =>
          Z(
            () => import(`./routes-A7qIJFrY.js`),
            __vite__mapDeps([0, 1, 2, 3, 4]),
          ),
        `component`,
      ),
    }).update({ id: `/`, path: `/`, getParentRoute: () => K }),
  },
  re = K._addFileChildren(ne)._addFileTypes();
function ie({ error: e, reset: t }) {
  let { t: r } = n();
  return (0, F.jsxs)(`div`, {
    className: `mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 sm:py-32 lg:px-16`,
    "data-testid": `route-error`,
    children: [
      (0, F.jsx)(`h1`, {
        className: `font-display text-section text-mist max-w-2xl font-normal text-balance`,
        children: r(`error.title`),
      }),
      (0, F.jsx)(`p`, {
        className: `text-mist/70 max-w-xl text-base leading-relaxed text-pretty`,
        children: r(`error.body`),
      }),
      e.message &&
        (0, F.jsx)(`p`, {
          "data-testid": `route-error-detail`,
          className: `border-indigo-deep bg-ink-deep text-mist/60 max-w-xl overflow-x-auto rounded-lg border px-4 py-3 font-mono text-xs`,
          children: e.message,
        }),
      (0, F.jsxs)(`div`, {
        className: `mt-2 flex flex-wrap items-center justify-center gap-3`,
        children: [
          (0, F.jsx)(`button`, {
            type: `button`,
            onClick: t,
            "data-testid": `route-error-retry`,
            className: _(),
            children: r(`error.retry`),
          }),
          (0, F.jsx)(p, {
            to: `/`,
            "data-testid": `route-error-home`,
            className: _({ variant: `ghost` }),
            children: r(`error.backHome`),
          }),
        ],
      }),
    ],
  });
}
function ae() {
  let { t: e } = n();
  return (0, F.jsxs)(`div`, {
    className: `mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 sm:py-32 lg:px-16`,
    "data-testid": `not-found`,
    children: [
      (0, F.jsx)(`p`, {
        className: `font-display eyebrow text-lavender`,
        children: `404`,
      }),
      (0, F.jsx)(`h1`, {
        className: `font-display text-section text-mist max-w-2xl font-normal text-balance`,
        children: e(`error.notFound`),
      }),
      (0, F.jsx)(p, {
        to: `/`,
        "data-testid": `not-found-home`,
        className: _({ className: `mt-2` }),
        children: e(`error.backHome`),
      }),
    ],
  });
}
var Q = u({
    routeTree: re,
    defaultPreload: `intent`,
    defaultErrorComponent: ie,
    defaultNotFoundComponent: ae,
  }),
  $ = document.getElementById(`root`);
(await N,
  M.on(`languageChanged`, () => {
    Q.invalidate();
  }),
  $.innerHTML ||
    w
      .createRoot($)
      .render(
        (0, F.jsx)(C.StrictMode, {
          children: (0, F.jsx)(a, {
            i18n: M,
            children: (0, F.jsx)(m, { router: Q }),
          }),
        }),
      ));
