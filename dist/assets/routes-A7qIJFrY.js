import { n as e } from "./rolldown-runtime-CbXtAM7H.js";
import { n as t, o as n } from "./i18n-CUYc3bXQ.js";
import { t as r } from "./react-BoQDZqka.js";
import {
  c as i,
  l as a,
  n as o,
  o as s,
  r as c,
  s as l,
  t as u,
} from "./site-XpzRHtgl.js";
var d = i(`arrow-up-right`, [
    [`path`, { d: `M7 7h10v10`, key: `1tivn9` }],
    [`path`, { d: `M7 17 17 7`, key: `1vkiza` }],
  ]),
  f = r(),
  p = {
    dark: {
      src: `/assets/section-stripes.webp`,
      width: 3840,
      height: 376,
      surround: `bg-ink-deep`,
      heightClass: `h-[clamp(2.5rem,9.79vw,11.75rem)]`,
    },
    bright: {
      src: `/assets/section-stripes-bright.webp`,
      width: 1920,
      height: 129,
      surround: `bg-ink`,
      heightClass: `h-[clamp(1.7rem,6.72vw,8.06rem)]`,
    },
  };
function m({ tone: e = `dark`, className: t }) {
  let n = p[e];
  return (0, f.jsx)(`div`, {
    className: a(n.surround, `leading-none`, t),
    "data-testid": `section-stripes-${e}`,
    "aria-hidden": `true`,
    children: (0, f.jsx)(`img`, {
      src: n.src,
      alt: ``,
      width: n.width,
      height: n.height,
      loading: `lazy`,
      className: a(`w-full object-cover`, n.heightClass),
    }),
  });
}
var h = e(n(), 1);
function g(e) {
  return typeof window > `u` || typeof window.matchMedia != `function`
    ? !1
    : window.matchMedia(e).matches;
}
function _(e) {
  let [t, n] = (0, h.useState)(() => g(e));
  return (
    (0, h.useEffect)(() => {
      if (typeof window.matchMedia != `function`) return;
      let t = window.matchMedia(e);
      function r(e) {
        n(e.matches);
      }
      return (
        t.addEventListener(`change`, r),
        () => {
          t.removeEventListener(`change`, r);
        }
      );
    }, [e]),
    t
  );
}
var v = `(prefers-reduced-motion: no-preference)`,
  y = `linear-gradient(to bottom, #000 0, #000 63.89%, transparent 100%)`,
  b = `radial-gradient(97.99% 67.22% at 50% 32.78%, transparent 0%, rgb(0 0 0 / 0.8) 100%)`,
  x = {
    maskImage: `${y}, ${b}`,
    maskComposite: `intersect`,
    WebkitMaskImage: `${y}, ${b}`,
    WebkitMaskComposite: `source-in`,
  },
  S = { background: `var(--brand-sweep-vertical)` },
  C = `absolute top-0 left-[-4.219%] h-[108.52%] w-[108.49%] max-w-none`,
  w = `blur-[7.29vw]`,
  T = [
    { key: `a`, src: `/assets/hero-shaft-a.webp`, className: `opacity-70` },
    {
      key: `b`,
      src: `/assets/hero-shaft-b.webp`,
      className: `mix-blend-soft-light`,
    },
    {
      key: `b-flipped`,
      src: `/assets/hero-shaft-b.webp`,
      className: `mix-blend-plus-lighter -scale-y-100 opacity-20`,
    },
  ],
  E = `linear-gradient(90deg, rgb(255 255 255 / 0) 0, rgb(255 255 255 / 0) 14%, rgb(255 255 255 / 0.05) 66%, rgb(255 255 255 / 0) 66%)`;
function D() {
  let { t: e } = t(),
    n = _(v);
  return (0, f.jsxs)(`section`, {
    id: `top`,
    "data-testid": `hero`,
    className: `bg-ink-deep relative isolate w-full`,
    children: [
      (0, f.jsxs)(`div`, {
        className: `pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] isolate -z-20 aspect-[1920/1080] min-h-[28rem] w-full overflow-hidden`,
        "aria-hidden": `true`,
        children: [
          (0, f.jsxs)(`div`, {
            className: `absolute inset-0 isolate`,
            style: { maskImage: y, WebkitMaskImage: y },
            children: [
              (0, f.jsx)(`div`, {
                className: a(C, `bg-cover bg-center`),
                style: {
                  backgroundImage: `url('/assets/hero-motion-poster.webp')`,
                },
              }),
              n &&
                (0, f.jsxs)(`video`, {
                  className: a(C, `object-cover`),
                  autoPlay: !0,
                  muted: !0,
                  loop: !0,
                  playsInline: !0,
                  preload: `metadata`,
                  poster: `/assets/hero-motion-poster.webp`,
                  "data-testid": `hero-backdrop-video`,
                  children: [
                    (0, f.jsx)(`source`, {
                      src: `/assets/hero-motion.webm`,
                      type: `video/webm`,
                    }),
                    (0, f.jsx)(`source`, {
                      src: `/assets/hero-motion.mp4`,
                      type: `video/mp4`,
                    }),
                  ],
                }),
              (0, f.jsx)(`div`, {
                className: `absolute inset-0 mix-blend-hue`,
                style: S,
              }),
            ],
          }),
          T.map((e) =>
            (0, f.jsxs)(
              `div`,
              {
                className: a(`absolute inset-0 isolate`, w, e.className),
                style: x,
                children: [
                  (0, f.jsx)(`img`, {
                    src: e.src,
                    alt: ``,
                    width: 1920,
                    height: 1080,
                    loading: `lazy`,
                    className: `absolute inset-0 size-full object-cover`,
                  }),
                  (0, f.jsx)(`div`, {
                    className: `absolute inset-0 mix-blend-hue`,
                    style: S,
                  }),
                ],
              },
              e.key,
            ),
          ),
          (0, f.jsx)(`div`, {
            className: `absolute inset-0`,
            style: {
              ...x,
              backgroundImage: `${E}, ${E}`,
              backgroundSize: `7.8125vw 100%`,
              backgroundPosition: `0 0, 3.90625vw 0`,
              backgroundRepeat: `repeat-x`,
            },
          }),
        ],
      }),
      (0, f.jsx)(`div`, {
        className: `pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] -z-10 aspect-[1920/1080] min-h-[28rem] w-full`,
        "aria-hidden": `true`,
        style: {
          background: `linear-gradient(to bottom, #0d0b2100 0%, #0d0b2100 46%, #0d0b2173 72%, #0d0b21 100%)`,
        },
      }),
      (0, f.jsxs)(`div`, {
        className: `mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 lg:pt-20 2xl:px-0`,
        children: [
          (0, f.jsxs)(`div`, {
            className: `flex w-full max-w-[52.5rem] flex-col items-center gap-6 text-center`,
            children: [
              (0, f.jsx)(`h1`, {
                className: `text-hero text-balance text-white`,
                children: e(`hero.title`),
              }),
              (0, f.jsx)(`p`, {
                className: `max-w-[45rem] text-base leading-[1.6] text-pretty text-white/80 sm:text-lg`,
                children: e(`hero.body`),
              }),
            ],
          }),
          (0, f.jsx)(c, {
            href: o.bookDemoUrl,
            variant: `sweep`,
            "data-testid": `hero-book-demo`,
            className: `relative z-10 mt-8 sm:mt-10`,
            children: e(`hero.cta`),
          }),
        ],
      }),
      (0, f.jsxs)(`div`, {
        className: `relative mt-10 sm:mt-12 lg:-mt-4`,
        children: [
          (0, f.jsx)(`div`, {
            className: `pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-repeat-x opacity-90 sm:h-56 lg:h-72`,
            "aria-hidden": `true`,
            style: {
              backgroundImage: `url('/assets/lattice-band.webp')`,
              backgroundSize: `auto 100%`,
              maskImage: `linear-gradient(to bottom, transparent 0%, #000 24%, #000 58%, transparent 100%)`,
            },
          }),
          (0, f.jsx)(`div`, {
            className: `pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 sm:h-40 lg:h-48`,
            "aria-hidden": `true`,
            style: {
              background: `linear-gradient(to bottom, transparent 0%, #0d0b21b3 55%, #0d0b21 100%)`,
            },
          }),
          (0, f.jsx)(`div`, {
            className: `relative mx-auto w-full max-w-[91rem] px-6 sm:px-10 lg:px-16 2xl:px-0`,
            children: (0, f.jsx)(`img`, {
              src: `/assets/hero-dashboard.webp`,
              alt: e(`hero.dashboardAlt`),
              width: 3076,
              height: 1230,
              fetchPriority: `high`,
              decoding: `async`,
              className: `border-indigo-deep/70 mx-auto block w-full rounded-t-2xl border border-b-0 shadow-2xl`,
            }),
          }),
        ],
      }),
    ],
  });
}
function O(e) {
  return a(
    `bg-lavender text-indigo-deep items-center gap-1 rounded-md border border-[#6b728033] py-1.5 pr-2 pl-1.5 text-xs leading-4 font-medium shadow-[0_0.0625rem_0.0625rem_rgba(74,86,99,0.1),0_0.375rem_0.4375rem_rgba(74,86,99,0.08)]`,
    `sm:gap-[0.3125rem] sm:py-2 sm:pr-2.5 sm:pl-2 sm:text-sm sm:leading-5`,
    `lg:py-2.5 lg:pr-3 lg:pl-2 lg:text-base`,
    e,
  );
}
var k = `bg-indigo-deep size-1.5 shrink-0 sm:size-2`;
function A({ children: e, className: t, "data-testid": n }) {
  return (0, f.jsxs)(`h2`, {
    "data-testid": n,
    className: a(
      `border-indigo-deep rounded-selector inline-flex w-fit items-center gap-2 border px-[1.125rem] py-2.5 backdrop-blur-[0.78125rem]`,
      t,
    ),
    children: [
      (0, f.jsx)(s, { className: `text-lavender h-[1.07rem] w-auto shrink-0` }),
      (0, f.jsx)(`span`, {
        className: `text-base font-medium tracking-[0.02em] text-white`,
        children: e,
      }),
      (0, f.jsx)(l, {
        className: `size-3 shrink-0 text-white`,
        "aria-hidden": `true`,
      }),
    ],
  });
}
function j({ delay: e } = {}) {
  let t = (0, h.useRef)(null),
    [n, r] = (0, h.useState)(() => typeof IntersectionObserver > `u`);
  return (
    (0, h.useEffect)(() => {
      let e = t.current;
      if (!e || n) return;
      let i = new IntersectionObserver(
        (e) => {
          e.some((e) => e.isIntersecting) && (r(!0), i.disconnect());
        },
        { rootMargin: `999999px 0px -10% 0px` },
      );
      return (
        i.observe(e),
        () => {
          i.disconnect();
        }
      );
    }, [n]),
    {
      ref: t,
      className: n ? `motion-safe:animate-reveal` : `motion-safe:opacity-0`,
      style: e === void 0 ? void 0 : { animationDelay: `${e.toString()}ms` },
    }
  );
}
var M = [
    {
      key: `trendMicro`,
      name: `Trend Micro`,
      src: `/assets/logo-trendmicro.svg`,
      width: 81,
      height: 17,
    },
    {
      key: `checkPoint`,
      name: `Check Point`,
      src: `/assets/logo-checkpoint.svg`,
      width: 143,
      height: 21,
    },
    {
      key: `algotech`,
      name: `Algotech`,
      src: `/assets/logo-algotech.svg`,
      width: 109,
      height: 25,
    },
    {
      key: `fortinet`,
      name: `Fortinet`,
      src: `/assets/logo-fortinet.svg`,
      width: 112,
      height: 13,
    },
  ],
  ee = [
    {
      key: `apiTesting`,
      label: `platform.tags.apiTesting`,
      position: `left-[66%] top-[33%]`,
    },
    {
      key: `credentials`,
      label: `platform.tags.credentials`,
      position: `left-[71%] top-[57%]`,
    },
    {
      key: `pentesting`,
      label: `platform.tags.pentesting`,
      position: `left-[44%] top-[72%]`,
    },
  ];
function N() {
  let { t: e } = t(),
    { ref: n, className: r } = j();
  return (0, f.jsxs)(`section`, {
    id: u.about,
    "data-testid": `platform-showcase`,
    className: `bg-ink-deep relative w-full overflow-hidden`,
    children: [
      (0, f.jsx)(`div`, {
        className: `mx-auto w-full max-w-sm px-6 pt-24 sm:max-w-md sm:px-10 sm:pt-32 lg:absolute lg:top-1/2 lg:left-0 lg:mx-0 lg:w-[52%] lg:max-w-[56rem] lg:-translate-x-[27%] lg:-translate-y-1/2 lg:px-0 lg:pt-0`,
        children: (0, f.jsxs)(`div`, {
          className: `relative aspect-square`,
          children: [
            (0, f.jsx)(`img`, {
              src: `/assets/constellation.webp`,
              alt: ``,
              width: 1552,
              height: 2172,
              loading: `lazy`,
              "aria-hidden": `true`,
              className: `size-full object-cover mix-blend-screen`,
              style: {
                maskImage: `radial-gradient(50% 50% at 50% 50%, #000 30%, transparent 100%)`,
              },
            }),
            (0, f.jsx)(`span`, {
              className: `bg-ink-deep absolute top-[47.9%] left-[52.7%] flex aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[0.1875rem] border-[#6046cabd] shadow-[0_0_1.5625rem_1.125rem_#6046cab3] sm:border-[0.25rem] lg:border-[0.375rem]`,
              "aria-hidden": `true`,
              children: (0, f.jsx)(s, { className: `text-lavender w-[40.2%]` }),
            }),
            ee.map((t) =>
              (0, f.jsxs)(
                `span`,
                {
                  "data-testid": `platform-tag-${t.key}`,
                  className: O(
                    a(
                      `absolute inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap`,
                      t.position,
                    ),
                  ),
                  children: [
                    (0, f.jsx)(`span`, { className: k, "aria-hidden": `true` }),
                    e(t.label),
                  ],
                },
                t.key,
              ),
            ),
          ],
        }),
      }),
      (0, f.jsxs)(`div`, {
        ref: n,
        className: a(
          `flex flex-col gap-10 px-6 pt-20 pb-16 sm:gap-12 sm:px-10 sm:pt-28 sm:pb-24 lg:ml-[40.4%] lg:w-[52.5%] lg:gap-14 lg:px-0 lg:pt-[11.125rem] lg:pb-[12rem] xl:pt-[15.125rem] xl:pb-[13rem]`,
          r,
        ),
        children: [
          (0, f.jsxs)(`div`, {
            className: `flex flex-col gap-6 sm:gap-8`,
            children: [
              (0, f.jsx)(A, {
                "data-testid": `platform-badge`,
                children: e(`platform.eyebrow`),
              }),
              (0, f.jsxs)(`p`, {
                className: `text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]`,
                children: [
                  (0, f.jsx)(`span`, {
                    className: `text-mist`,
                    children: e(`platform.leadStrong`),
                  }),
                  ` `,
                  (0, f.jsx)(`span`, {
                    className: `text-mist/60`,
                    children: e(`platform.leadMuted`),
                  }),
                ],
              }),
            ],
          }),
          (0, f.jsxs)(`div`, {
            className: `flex flex-col gap-6`,
            children: [
              (0, f.jsx)(`p`, {
                className: `text-lavender max-w-sm text-base leading-[1.4] sm:text-lg`,
                children: e(`platform.poweredBy`),
              }),
              (0, f.jsx)(`ul`, {
                className: `flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10`,
                children: M.map((t) =>
                  (0, f.jsx)(
                    `li`,
                    {
                      children: (0, f.jsx)(`img`, {
                        src: t.src,
                        alt: e(`platform.partnerAlt`, { name: t.name }),
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
        ],
      }),
    ],
  });
}
var P = [
    {
      key: `attack`,
      label: `agents.alerts.attack`,
      stagger: `mt-[8.13vw]`,
      drop: `h-[9.84vw]`,
    },
    {
      key: `apiTesting`,
      label: `agents.alerts.apiTesting`,
      stagger: `mt-0`,
      drop: `h-[9.84vw]`,
    },
    {
      key: `files`,
      label: `agents.alerts.files`,
      stagger: `mt-[3.28vw]`,
      drop: `h-[5.94vw]`,
    },
    {
      key: `credentials`,
      label: `agents.alerts.credentials`,
      stagger: `mt-[4.17vw]`,
      drop: `h-[9.84vw]`,
    },
  ],
  F = O();
function I() {
  let { t: e } = t();
  return (0, f.jsxs)(`section`, {
    id: u.demonstrate,
    "data-testid": `autonomous-agents`,
    className: `bg-ink-deep relative isolate w-full overflow-hidden lg:aspect-[1920/1406]`,
    children: [
      (0, f.jsx)(`img`, {
        src: `/assets/skyline.webp`,
        alt: e(`agents.skylineAlt`),
        width: 1920,
        height: 1406,
        loading: `lazy`,
        className: `absolute inset-0 -z-20 size-full object-cover object-bottom`,
      }),
      (0, f.jsx)(`div`, {
        className: `absolute inset-0 -z-10`,
        "aria-hidden": `true`,
        style: {
          background: `linear-gradient(to bottom, rgba(13,11,33,0.55) 0%, rgba(13,11,33,0.42) 28%, rgba(13,11,33,0) 52%)`,
        },
      }),
      (0, f.jsxs)(`div`, {
        className: `mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-14 pb-12 text-center sm:px-10 sm:pt-20 lg:max-w-none lg:gap-[3.33vw] lg:px-16 lg:pt-[8.75vw] lg:pb-0`,
        children: [
          (0, f.jsx)(`h2`, {
            className: `font-display text-display text-lavender-soft mx-auto max-w-[19ch] font-normal text-balance whitespace-normal lg:max-w-none lg:leading-[1.1] lg:whitespace-pre-line lg:[word-spacing:-0.2733em]`,
            children: e(`agents.title`),
          }),
          (0, f.jsx)(`p`, {
            className: `text-mist/90 max-w-xl text-base text-pretty sm:text-lg`,
            children: e(`agents.subtitle`),
          }),
          (0, f.jsx)(c, {
            href: o.bookDemoUrl,
            variant: `dark`,
            "data-testid": `agents-book-demo`,
            children: e(`agents.cta`),
          }),
          (0, f.jsx)(`ul`, {
            className: `mt-2 flex flex-wrap justify-center gap-2 lg:hidden`,
            children: P.map((t) =>
              (0, f.jsxs)(
                `li`,
                {
                  "data-testid": `agents-alert-compact-${t.key}`,
                  className: a(F, `inline-flex`),
                  children: [
                    (0, f.jsx)(`span`, { className: k, "aria-hidden": `true` }),
                    e(t.label),
                  ],
                },
                t.key,
              ),
            ),
          }),
        ],
      }),
      (0, f.jsx)(`div`, {
        className: `mx-auto hidden w-full max-w-[100rem] items-start justify-between px-10 pt-2 lg:flex xl:px-16`,
        "aria-hidden": `true`,
        children: P.map((t) =>
          (0, f.jsxs)(
            `span`,
            {
              "data-testid": `agents-alert-${t.key}`,
              className: a(`flex flex-col items-start`, t.stagger),
              children: [
                (0, f.jsxs)(`span`, {
                  className: a(F, `inline-flex`),
                  children: [
                    (0, f.jsx)(`span`, { className: k, "aria-hidden": `true` }),
                    e(t.label),
                  ],
                }),
                (0, f.jsx)(`span`, { className: a(`alert-drop ml-2`, t.drop) }),
              ],
            },
            t.key,
          ),
        ),
      }),
    ],
  });
}
function L({
  id: e,
  children: t,
  className: n,
  innerClassName: r,
  backdrop: i,
  "data-testid": o,
}) {
  return (0, f.jsxs)(`section`, {
    id: e,
    "data-testid": o,
    className: a(`relative isolate w-full`, n),
    children: [
      i,
      (0, f.jsx)(`div`, {
        className: a(
          `mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-16 2xl:px-0`,
          r,
        ),
        children: t,
      }),
    ],
  });
}
var R = [
  {
    key: `pentesting`,
    image: `/assets/service-pentesting.webp`,
    alt: `services.alt.pentesting`,
    imageFirst: !1,
  },
  {
    key: `cloud`,
    image: `/assets/service-cloud.webp`,
    alt: `services.alt.cloud`,
    imageFirst: !0,
  },
  {
    key: `redTeaming`,
    image: `/assets/service-red-teaming.webp`,
    alt: `services.alt.redTeaming`,
    imageFirst: !1,
  },
];
function z({ className: e }) {
  return (0, f.jsx)(`span`, {
    "aria-hidden": `true`,
    className: a(`bg-lavender absolute size-2 rotate-45 rounded-xs`, e),
  });
}
function B({ service: e }) {
  let { t: n } = t(),
    { ref: r, className: i } = j();
  return (0, f.jsxs)(`li`, {
    ref: r,
    "data-testid": `service-${e.key}`,
    className: a(
      `relative grid items-center gap-8 py-10 sm:gap-10 lg:grid-cols-2 lg:gap-0 lg:py-14`,
      i,
    ),
    children: [
      (0, f.jsx)(`span`, {
        className: `bg-indigo-deep/60 pointer-events-none absolute inset-x-0 top-0 z-10 h-px`,
        "aria-hidden": `true`,
      }),
      (0, f.jsx)(`span`, {
        className: `bg-indigo-deep/60 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px`,
        "aria-hidden": `true`,
      }),
      (0, f.jsx)(`span`, {
        className: `bg-indigo-deep/60 pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px lg:block`,
        "aria-hidden": `true`,
      }),
      (0, f.jsx)(z, {
        className: `top-0 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block`,
      }),
      (0, f.jsx)(z, {
        className: `bottom-0 left-1/2 z-20 hidden -translate-x-1/2 translate-y-1/2 lg:block`,
      }),
      (0, f.jsxs)(`div`, {
        className: a(
          `flex flex-col gap-5 sm:gap-6`,
          e.imageFirst ? `lg:order-2 lg:pl-10 xl:pl-14` : `lg:pr-10 xl:pr-14`,
        ),
        children: [
          (0, f.jsx)(`h3`, {
            className: `font-display text-service text-mist font-normal text-balance`,
            children: n(`services.${e.key}.title`),
          }),
          (0, f.jsx)(`p`, {
            className: `text-mist/80 max-w-prose text-base leading-relaxed text-pretty`,
            children: n(`services.${e.key}.body`),
          }),
          (0, f.jsxs)(`a`, {
            href: `#${u.demonstrate}`,
            "data-testid": `service-${e.key}-explore`,
            className: `text-mist hover:text-lavender group inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition-colors pointer-coarse:min-h-11`,
            children: [
              n(`services.exploreMore`),
              (0, f.jsx)(d, {
                className: `size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`,
                "aria-hidden": `true`,
              }),
            ],
          }),
        ],
      }),
      (0, f.jsx)(`div`, {
        className: a(
          `border-indigo-deep/70 bg-ink-deep relative overflow-hidden rounded-xl border`,
          e.imageFirst ? `lg:order-1 lg:mr-10 xl:mr-14` : `lg:ml-10 xl:ml-14`,
        ),
        children: (0, f.jsx)(`img`, {
          src: e.image,
          alt: n(e.alt),
          width: 720,
          height: 586,
          loading: `lazy`,
          className: `block h-auto w-full`,
        }),
      }),
    ],
  });
}
function V() {
  let { t: e } = t();
  return (0, f.jsxs)(L, {
    id: u.services,
    "data-testid": `services`,
    className: `bg-ink`,
    innerClassName: `flex flex-col items-center gap-10 py-16 sm:py-24 lg:gap-14 lg:py-28`,
    children: [
      (0, f.jsx)(A, {
        "data-testid": `services-badge`,
        children: e(`services.badge`),
      }),
      (0, f.jsx)(`ul`, {
        className: `relative flex w-full flex-col`,
        children: R.map((e) => (0, f.jsx)(B, { service: e }, e.key)),
      }),
    ],
  });
}
var H = [
    { key: `scope`, icon: `/assets/icon-scope.svg` },
    { key: `experts`, icon: `/assets/icon-experts.svg` },
    { key: `insight`, icon: `/assets/icon-insight.svg` },
  ],
  U = `clamp(6rem,13vw,9.5rem)`,
  W = `calc(${U} / 2)`,
  G = `bg-[linear-gradient(180deg,rgb(173_157_238/0.2)_0%,rgb(173_157_238/0)_100%),linear-gradient(0deg,rgb(34_18_15/0.2)_0%,rgb(34_18_15/0.2)_100%)]`;
function K({ className: e, style: t }) {
  return (0, f.jsx)(`span`, {
    "aria-hidden": `true`,
    style: t,
    className: a(
      `bg-lavender/70 absolute hidden size-1.5 -translate-x-1/2 rotate-45 rounded-xs lg:block`,
      e,
    ),
  });
}
function q({ pillar: e, index: n }) {
  let { t: r } = t(),
    { ref: i, className: o, style: s } = j({ delay: n * 120 });
  return (0, f.jsxs)(`li`, {
    ref: i,
    style: s,
    "data-testid": `why-${e.key}`,
    className: a(`flex flex-col items-center gap-6 text-center`, o),
    children: [
      (0, f.jsxs)(`div`, {
        className: `relative flex w-full items-center justify-center`,
        children: [
          (0, f.jsx)(`span`, {
            className: `bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block`,
            "aria-hidden": `true`,
          }),
          (0, f.jsx)(`img`, {
            src: e.icon,
            alt: ``,
            width: 156,
            height: 156,
            loading: `lazy`,
            "aria-hidden": `true`,
            className: a(
              `ring-lavender-soft/25 relative rounded-full ring-1 backdrop-blur-[0.625rem]`,
              G,
            ),
            style: { width: U, height: U },
          }),
        ],
      }),
      (0, f.jsx)(`h3`, {
        className: `font-display text-mist text-xl font-normal sm:text-2xl`,
        children: r(`why.${e.key}.title`),
      }),
      (0, f.jsx)(`p`, {
        className: `text-mist/80 max-w-[12.2rem] text-sm leading-6 text-pretty`,
        children: r(`why.${e.key}.body`),
      }),
    ],
  });
}
function J() {
  let { t: e } = t();
  return (0, f.jsxs)(L, {
    "data-testid": `why-assistsec`,
    className: `brand-sky`,
    innerClassName: `flex flex-col items-center gap-12 py-16 sm:py-24 lg:gap-16 lg:py-28`,
    backdrop: (0, f.jsx)(`div`, {
      className: `pointer-events-none absolute inset-x-0 top-0 -z-10 h-64`,
      "aria-hidden": `true`,
      style: {
        background: `linear-gradient(to bottom, rgba(13,11,33,0) 0%, rgba(13,11,33,0.34) 30%, rgba(13,11,33,0.3) 55%, rgba(13,11,33,0) 100%)`,
      },
    }),
    children: [
      (0, f.jsx)(`h2`, {
        className: `font-display text-lavender-soft text-center text-2xl tracking-[0.25em] uppercase sm:text-[1.75rem] sm:tracking-[0.4em] lg:text-[1.875rem] lg:tracking-[0.5em]`,
        children: e(`why.title`),
      }),
      (0, f.jsxs)(`div`, {
        className: `relative flex w-full flex-col gap-12 lg:gap-16`,
        children: [
          [`left-1/3`, `left-2/3`].map((e) =>
            (0, f.jsxs)(
              h.Fragment,
              {
                children: [
                  (0, f.jsx)(`span`, {
                    "aria-hidden": `true`,
                    className: a(
                      `bg-lavender/40 absolute bottom-6 hidden w-px lg:block`,
                      e,
                    ),
                    style: { top: W },
                  }),
                  (0, f.jsx)(K, {
                    className: a(`-translate-y-1/2`, e),
                    style: { top: W },
                  }),
                  (0, f.jsx)(K, {
                    className: a(`bottom-6 translate-y-1/2`, e),
                  }),
                ],
              },
              e,
            ),
          ),
          (0, f.jsx)(`ul`, {
            className: `grid w-full gap-12 lg:grid-cols-3 lg:gap-0`,
            children: H.map((e, t) =>
              (0, f.jsx)(q, { pillar: e, index: t }, e.key),
            ),
          }),
          (0, f.jsxs)(`div`, {
            className: `relative flex w-full justify-center`,
            children: [
              (0, f.jsx)(`div`, {
                className: `bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block`,
                "aria-hidden": `true`,
              }),
              (0, f.jsx)(c, {
                href: o.bookDemoUrl,
                "data-testid": `why-book-demo`,
                className: `relative`,
                children: e(`why.cta`),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
var Y = [`summary`, `vectors`, `risk`, `scope`, `steps`],
  X = [
    { key: `critical`, color: `bg-ember`, share: `22%` },
    { key: `high`, color: `bg-warning`, share: `28%` },
    { key: `medium`, color: `bg-lavender`, share: `32%` },
    { key: `low`, color: `bg-indigo`, share: `18%` },
  ],
  Z = [
    { key: `one`, color: `bg-ember`, width: `86%` },
    { key: `two`, color: `bg-warning`, width: `72%` },
    { key: `three`, color: `bg-warning`, width: `78%` },
    { key: `four`, color: `bg-lavender`, width: `64%` },
    { key: `five`, color: `bg-indigo`, width: `70%` },
  ],
  Q = [
    { key: `a`, height: `35%` },
    { key: `b`, height: `55%` },
    { key: `c`, height: `42%` },
    { key: `d`, height: `78%` },
    { key: `e`, height: `62%` },
    { key: `f`, height: `94%` },
    { key: `g`, height: `70%` },
    { key: `h`, height: `48%` },
  ];
function te() {
  return (0, f.jsxs)(`div`, {
    className: `border-lavender/25 bg-ink-deep/90 flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-sm sm:gap-5 sm:p-7`,
    "aria-hidden": `true`,
    children: [
      (0, f.jsxs)(`div`, {
        className: `flex items-center gap-3`,
        children: [
          (0, f.jsx)(s, {
            className: `text-lavender h-[1.25em] w-auto shrink-0 text-base`,
          }),
          (0, f.jsxs)(`div`, {
            className: `flex min-w-0 flex-1 flex-col gap-1.5`,
            children: [
              (0, f.jsx)(`span`, {
                className: `bg-mist/70 block h-2 w-2/5 rounded-full`,
              }),
              (0, f.jsx)(`span`, {
                className: `bg-mist/25 block h-1.5 w-1/4 rounded-full`,
              }),
            ],
          }),
          (0, f.jsxs)(`span`, {
            className: `border-lavender/40 rounded-selector flex shrink-0 items-center gap-1 border px-2 py-1.5`,
            children: [
              (0, f.jsx)(`span`, {
                className: `bg-lavender/70 block h-1 w-1 rounded-full`,
              }),
              (0, f.jsx)(`span`, {
                className: `bg-lavender/70 block h-1 w-4 rounded-full`,
              }),
            ],
          }),
        ],
      }),
      (0, f.jsx)(`span`, { className: `bg-lavender/20 block h-px w-full` }),
      (0, f.jsxs)(`div`, {
        className: `flex flex-col gap-2`,
        children: [
          (0, f.jsx)(`span`, {
            className: `bg-mist/30 block h-1.5 w-1/3 rounded-full`,
          }),
          (0, f.jsx)(`div`, {
            className: `flex h-2.5 w-full overflow-hidden rounded-full`,
            children: X.map((e) =>
              (0, f.jsx)(
                `span`,
                { className: e.color, style: { width: e.share } },
                e.key,
              ),
            ),
          }),
          (0, f.jsx)(`div`, {
            className: `flex flex-wrap gap-x-4 gap-y-1`,
            children: X.map((e) =>
              (0, f.jsxs)(
                `span`,
                {
                  className: `flex items-center gap-1.5`,
                  children: [
                    (0, f.jsx)(`span`, {
                      className: a(`size-1.5 rounded-full`, e.color),
                    }),
                    (0, f.jsx)(`span`, {
                      className: `bg-mist/25 block h-1.5 w-8 rounded-full`,
                    }),
                  ],
                },
                e.key,
              ),
            ),
          }),
        ],
      }),
      (0, f.jsx)(`div`, {
        className: `border-lavender/10 bg-indigo-deep/25 flex h-24 shrink-0 items-end gap-1 rounded-lg border p-3 sm:h-28`,
        children: Q.map((e) =>
          (0, f.jsx)(
            `span`,
            {
              className: `from-indigo to-lavender flex-1 rounded-t-xs bg-gradient-to-t`,
              style: { height: e.height },
            },
            e.key,
          ),
        ),
      }),
      (0, f.jsx)(`ul`, {
        className: `flex flex-col gap-2.5`,
        children: Z.map((e) =>
          (0, f.jsxs)(
            `li`,
            {
              className: `border-lavender/10 bg-indigo-deep/25 flex items-center gap-3 rounded-lg border p-3`,
              children: [
                (0, f.jsx)(`span`, {
                  className: a(`size-2 shrink-0 rounded-full`, e.color),
                }),
                (0, f.jsxs)(`span`, {
                  className: `flex min-w-0 flex-1 flex-col gap-1.5`,
                  children: [
                    (0, f.jsx)(`span`, {
                      className: `bg-mist/45 block h-1.5 rounded-full`,
                      style: { width: e.width },
                    }),
                    (0, f.jsx)(`span`, {
                      className: `bg-mist/20 block h-1.5 w-1/3 rounded-full`,
                    }),
                  ],
                }),
              ],
            },
            e.key,
          ),
        ),
      }),
      (0, f.jsx)(`div`, {
        className: `grid grid-cols-3 gap-2`,
        children: X.slice(0, 3).map((e) =>
          (0, f.jsxs)(
            `div`,
            {
              className: `border-lavender/10 bg-indigo-deep/25 flex flex-col gap-1.5 rounded-lg border p-3`,
              children: [
                (0, f.jsx)(`span`, {
                  className: a(`block h-1.5 w-6 rounded-full`, e.color),
                }),
                (0, f.jsx)(`span`, {
                  className: `bg-mist/35 block h-2.5 w-3/5 rounded-full`,
                }),
              ],
            },
            e.key,
          ),
        ),
      }),
    ],
  });
}
function ne() {
  let { t: e } = t(),
    { ref: n, className: r } = j(),
    { ref: i, className: s, style: l } = j({ delay: 120 });
  return (0, f.jsxs)(L, {
    "data-testid": `benefits`,
    className: `bg-ink`,
    innerClassName: `grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12 lg:py-28 xl:gap-20`,
    children: [
      (0, f.jsxs)(`div`, {
        ref: n,
        className: a(`flex flex-col gap-6`, r),
        children: [
          (0, f.jsxs)(`div`, {
            className: `relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:max-w-none`,
            children: [
              (0, f.jsx)(`div`, {
                className: `border-lavender/15 absolute inset-y-[3%] -left-[3%] w-[92%] rotate-[-7deg] rounded-2xl border bg-gradient-to-br from-[#1d1948] to-[#131029] shadow-2xl`,
                "aria-hidden": `true`,
              }),
              (0, f.jsx)(`div`, {
                className: `border-lavender/20 absolute inset-y-[1.5%] left-[2%] w-[95%] rotate-[-3.5deg] rounded-2xl border bg-gradient-to-br from-[#161238] to-[#0f0d24] shadow-2xl`,
                "aria-hidden": `true`,
              }),
              (0, f.jsx)(`div`, {
                className: `relative`,
                children: (0, f.jsx)(te, {}),
              }),
            ],
          }),
          (0, f.jsx)(`ul`, {
            className: `flex flex-wrap justify-center gap-2 lg:justify-start`,
            children: Y.map((t) =>
              (0, f.jsx)(
                `li`,
                {
                  "data-testid": `benefit-label-${t}`,
                  className: `border-lavender/40 bg-indigo-deep/60 text-mist rounded-md border px-3 py-2 text-xs shadow-[0_0_1.5rem_rgba(173,157,238,0.25)] sm:text-sm`,
                  children: e(`benefits.labels.${t}`),
                },
                t,
              ),
            ),
          }),
        ],
      }),
      (0, f.jsxs)(`div`, {
        ref: i,
        style: l,
        className: a(`flex flex-col gap-8`, s),
        children: [
          (0, f.jsx)(`h2`, {
            className: `font-display text-section text-mist font-normal text-balance`,
            children: e(`benefits.title`),
          }),
          (0, f.jsxs)(`div`, {
            className: `text-mist/80 flex flex-col gap-5 text-base leading-relaxed text-pretty`,
            children: [
              (0, f.jsx)(`p`, { children: e(`benefits.reportIntro`) }),
              (0, f.jsx)(`p`, { children: e(`benefits.reportBody`) }),
            ],
          }),
          (0, f.jsx)(c, {
            href: `${o.scannerBaseUrl}/sample-report`,
            "data-testid": `benefits-sample-report`,
            className: `w-fit`,
            children: e(`benefits.cta`),
          }),
        ],
      }),
    ],
  });
}
var re = [`rules`, `owasp`, `compliance`];
function ie({ post: e, index: n }) {
  let { t: r } = t(),
    { ref: i, className: s, style: c } = j({ delay: n * 90 });
  return (0, f.jsxs)(`li`, {
    ref: i,
    style: c,
    "data-testid": `blog-post-${e}`,
    className: a(
      `border-indigo-deep bg-ink-deep hover:border-lavender/60 focus-within:border-lavender/60 relative flex flex-col overflow-hidden rounded-2xl border transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1.5rem_3rem_-1rem_rgba(13,11,33,0.9)]`,
      s,
    ),
    children: [
      (0, f.jsx)(`img`, {
        src: `/assets/blog-pattern.webp`,
        alt: ``,
        width: 488,
        height: 84,
        loading: `lazy`,
        "aria-hidden": `true`,
        className: `h-20 w-full object-cover sm:h-24 lg:h-28`,
      }),
      (0, f.jsxs)(`div`, {
        className: `flex flex-1 flex-col gap-5 p-6 sm:p-7 lg:pt-8`,
        children: [
          (0, f.jsx)(`p`, {
            className: `font-display eyebrow text-lavender`,
            children: r(`blog.posts.${e}.date`),
          }),
          (0, f.jsx)(`h3`, {
            className: `font-display text-mist text-lg leading-snug font-normal text-pretty sm:text-xl`,
            children: r(`blog.posts.${e}.title`),
          }),
          (0, f.jsx)(`p`, {
            className: `text-mist/75 flex-1 text-base leading-relaxed text-pretty`,
            children: r(`blog.posts.${e}.excerpt`),
          }),
          (0, f.jsxs)(`a`, {
            href: `${o.scannerBaseUrl}/blog`,
            target: `_blank`,
            rel: `noreferrer noopener`,
            "data-testid": `blog-post-${e}-link`,
            className: `text-mist hover:text-lavender group inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition-colors before:absolute before:inset-0 before:content-['']`,
            children: [
              r(`blog.viewDetails`),
              (0, f.jsx)(d, {
                className: `size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`,
                "aria-hidden": `true`,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function ae() {
  let { t: e } = t();
  return (0, f.jsxs)(L, {
    id: u.blog,
    "data-testid": `blog-highlights`,
    className: `bg-ink`,
    innerClassName: `flex flex-col gap-10 py-16 sm:py-24 lg:py-28`,
    children: [
      (0, f.jsxs)(`div`, {
        className: `flex flex-wrap items-center justify-between gap-4`,
        children: [
          (0, f.jsx)(`h2`, {
            className: `font-display text-mist text-base tracking-[0.235em] uppercase sm:text-xl`,
            children: e(`blog.title`),
          }),
          (0, f.jsxs)(`a`, {
            href: `${o.scannerBaseUrl}/blog`,
            target: `_blank`,
            rel: `noreferrer noopener`,
            "data-testid": `blog-view-all`,
            className: `text-mist hover:text-lavender group inline-flex items-center gap-2 py-1 text-base font-medium transition-colors pointer-coarse:min-h-11`,
            children: [
              e(`blog.viewAll`),
              (0, f.jsx)(d, {
                className: `size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`,
                "aria-hidden": `true`,
              }),
            ],
          }),
        ],
      }),
      (0, f.jsx)(`ul`, {
        className: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`,
        children: re.map((e, t) => (0, f.jsx)(ie, { post: e, index: t }, e)),
      }),
      (0, f.jsxs)(`div`, {
        className: `text-mist/80 flex max-w-3xl flex-col gap-6 text-lg leading-[1.45] text-pretty sm:text-xl`,
        children: [
          (0, f.jsx)(`p`, { children: e(`blog.outroIntro`) }),
          (0, f.jsxs)(`p`, {
            children: [
              e(`blog.outroFollow`),
              ` `,
              (0, f.jsx)(`a`, {
                href: o.linkedInUrl,
                target: `_blank`,
                rel: `noreferrer noopener`,
                "data-testid": `blog-linkedin`,
                className: `font-display text-lavender hover:text-lavender-soft transition-colors`,
                children: e(`blog.linkedIn`),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
var $ = {
    left: `lg:top-[calc(8rem+0.21vw)] xl:top-[calc(10rem+0.21vw)]`,
    right: `lg:top-[calc(8rem-4.98vw)] xl:top-[calc(10rem-4.98vw)]`,
  },
  oe = `lg:max-w-[min(33vw,38rem)]`;
function se() {
  let { t: e } = t(),
    { ref: n, className: r } = j();
  return (0, f.jsxs)(`section`, {
    "data-testid": `closing-cta`,
    className: `bg-ink relative isolate w-full`,
    children: [
      (0, f.jsx)(`img`, {
        src: `/assets/robot-hand-left.webp`,
        alt: ``,
        width: 1160,
        height: 1086,
        loading: `lazy`,
        "aria-hidden": `true`,
        className: a(
          `pointer-events-none absolute left-0 -z-10 hidden w-[30.21%] lg:block`,
          $.left,
        ),
      }),
      (0, f.jsx)(`img`, {
        src: `/assets/robot-hand-right.webp`,
        alt: ``,
        width: 1306,
        height: 457,
        loading: `lazy`,
        "aria-hidden": `true`,
        className: a(
          `pointer-events-none absolute right-0 -z-10 hidden w-[34.01%] lg:block`,
          $.right,
        ),
      }),
      (0, f.jsx)(`div`, {
        className: `mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32 xl:py-40 2xl:px-0`,
        children: (0, f.jsxs)(`div`, {
          ref: n,
          className: a(
            `flex w-full flex-col items-center gap-6 text-center`,
            oe,
            r,
          ),
          children: [
            (0, f.jsx)(`h2`, {
              className: `font-display text-mist max-w-3xl text-2xl leading-tight font-normal text-balance sm:text-3xl lg:text-[2.5rem]`,
              children: e(`cta.title`),
            }),
            (0, f.jsx)(`p`, {
              className: `text-mist/80 max-w-xl text-base leading-6 text-pretty`,
              children: e(`cta.body`),
            }),
            (0, f.jsx)(c, {
              href: o.bookDemoUrl,
              "data-testid": `closing-book-demo`,
              className: `mt-2`,
              children: e(`cta.action`),
            }),
          ],
        }),
      }),
    ],
  });
}
function ce() {
  return (0, f.jsxs)(`div`, {
    "data-testid": `landing-page`,
    children: [
      (0, f.jsx)(D, {}),
      (0, f.jsx)(N, {}),
      (0, f.jsx)(m, {}),
      (0, f.jsx)(I, {}),
      (0, f.jsx)(V, {}),
      (0, f.jsx)(m, { tone: `bright` }),
      (0, f.jsx)(J, {}),
      (0, f.jsx)(ne, {}),
      (0, f.jsx)(ae, {}),
      (0, f.jsx)(se, {}),
    ],
  });
}
export { ce as component };
