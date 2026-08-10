import { n as e } from "./rolldown-runtime-CbXtAM7H.js";
import { o as t } from "./i18n-CUYc3bXQ.js";
import { t as n } from "./react-BoQDZqka.js";
var r = e(t(), 1),
  i = n();
function a(e) {
  var t,
    n,
    r = ``;
  if (typeof e == `string` || typeof e == `number`) r += e;
  else if (typeof e == `object`) {
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++)
        e[t] && (n = a(e[t])) && (r && (r += ` `), (r += n));
    } else for (n in e) e[n] && (r && (r += ` `), (r += n));
  }
  return r;
}
function o() {
  for (var e, t, n = 0, r = ``, i = arguments.length; n < i; n++)
    (e = arguments[n]) && (t = a(e)) && (r && (r += ` `), (r += t));
  return r;
}
var s = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  c = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  l = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) =>
      n ? n.toUpperCase() : t.toLowerCase(),
    ),
  u = (e) => {
    let t = l(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  d = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  f = (e) => {
    for (let t in e)
      if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  p = (0, r.createContext)({}),
  m = () => (0, r.useContext)(p),
  h = (0, r.forwardRef)(
    (
      {
        color: e,
        size: t,
        strokeWidth: n,
        absoluteStrokeWidth: i,
        className: a = ``,
        children: o,
        iconNode: c,
        ...l
      },
      u,
    ) => {
      let {
          size: p = 24,
          strokeWidth: h = 2,
          absoluteStrokeWidth: g = !1,
          color: _ = `currentColor`,
          className: v = ``,
        } = m() ?? {},
        y = (i ?? g) ? (Number(n ?? h) * 24) / Number(t ?? p) : (n ?? h);
      return (0, r.createElement)(
        `svg`,
        {
          ref: u,
          ...d,
          width: t ?? p ?? d.width,
          height: t ?? p ?? d.height,
          stroke: e ?? _,
          strokeWidth: y,
          className: s(`lucide`, v, a),
          ...(!o && !f(l) && { "aria-hidden": `true` }),
          ...l,
        },
        [
          ...c.map(([e, t]) => (0, r.createElement)(e, t)),
          ...(Array.isArray(o) ? o : [o]),
        ],
      );
    },
  ),
  g = (e, t) => {
    let n = (0, r.forwardRef)(({ className: n, ...i }, a) =>
      (0, r.createElement)(h, {
        ref: a,
        iconNode: t,
        className: s(`lucide-${c(u(e))}`, `lucide-${e}`, n),
        ...i,
      }),
    );
    return ((n.displayName = u(e)), n);
  },
  _ = g(`arrow-right`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `m12 5 7 7-7 7`, key: `xquz4c` }],
  ]);
function v({ className: e }) {
  return (0, i.jsxs)(`svg`, {
    viewBox: `0 0 164.15 20`,
    fill: `none`,
    className: e,
    role: `img`,
    "aria-label": `AssistSec`,
    children: [
      (0, i.jsxs)(`g`, {
        fill: `currentColor`,
        children: [
          (0, i.jsx)(`path`, {
            transform: `translate(127.91 5.08) scale(0.101562 0.101563)`,
            d: `M66.7 0.67C86.93 -2.33 112.24 4.81 126.47 19.96C143.22 37.78 145.65 56.79 145.37 80.21L31.76 80.26C42.51 123.05 85.12 131.26 116.95 104.29L118.11 104.09C122.74 107.79 131.87 117.78 136.36 122.45C107.9 150.82 60.17 155.53 28.01 131.11C13.03 119.69 3.24 102.76 0.83 84.08C-5.26 39.18 22.65 6.43 66.7 0.67ZM31.73 60.5L75.21 60.52L114.55 60.42C112.03 36.66 96.37 24.54 72.69 25.7C50.03 27.89 37.71 38.36 31.73 60.5Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(28.82 5.08) scale(0.101562 0.101563)`,
            d: `M66.51 0.74C87.21 -2.79 108.52 6.6 122.63 21.4L122.78 3.29C133.39 3.11 144.28 3.17 154.92 3.12L154.93 114.9C144.24 108.99 133.39 102.58 122.77 96.49L122.87 85.83C122.98 68.07 122.21 54.01 108.42 40.34C99.64 31.6 87.66 26.85 75.27 27.2C63.16 27.34 51.62 32.35 43.25 41.1C33.5 51.37 30.79 62.96 31.13 76.65C32.47 87.34 34.74 95.2 42.1 103.73C49.67 112.59 60.51 118 72.14 118.75C88.23 119.67 99.31 112.67 110.59 102.51L110.6 134.82C86.42 152.1 49.98 149.1 27.1 130.99C12.12 118.96 2.57 101.45 0.57 82.34C-4.38 39.05 23.49 5.41 66.51 0.74Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(86.02 5.12) scale(0.101562 0.101563)`,
            d: `M55.96 0.4C76.66 -1.71 97.01 4.76 114.95 14.58L102.58 37.68C89.17 27.91 39.71 13.66 36.89 41.82C34.77 63.06 99.06 60.58 109.94 77.71C114.6 85.05 120.67 89.91 119.62 101.48C120.54 137.59 87.78 145.6 58.78 146.05C33.81 145.46 20.78 141.99 0 128.7L13.51 104.01C30.97 118.33 68.68 128.86 85.48 111.08C103.63 91.89 48.56 83.49 39.57 81.07C8.34 72.66 -6.04 46.25 13.75 18.23C22.47 5.89 41.85 1.7 55.96 0.4Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(62.82 5.11) scale(0.101562 0.101563)`,
            d: `M57.58 0.5C75.89 -2.12 99.84 6.02 115.75 15.11L103.74 38.35C88.57 27.47 59.2 18.6 41.6 32.46C39.69 33.97 35.59 41.21 36.61 43.36C48.02 67.29 92.07 57.71 110.25 77.97C117.04 84.71 119.94 91.1 120.23 100.8C121.39 139.12 85.93 145.93 55.77 146.12C33.07 145.78 18.98 140.5 0 129.02C3.99 121.21 9.59 111.71 13.92 103.9C30.51 116.49 45.62 121.09 66.45 119.76C76.47 119.11 90.44 114.11 88.74 102.08C86.4 85.58 53.92 86.46 41.37 81.4C32.51 77.82 25.36 76.45 17.86 69.91C1.38 58.22 3.46 32.71 15 18.1C24.59 5.96 42.19 1.83 57.58 0.5Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(48.13 5.12) scale(0.101562 0.101563)`,
            d: `M57.18 0.41C75.94 -1.94 98.27 6.16 114.7 14.5C110.64 22.24 106.5 29.95 102.28 37.6C88.68 28.01 77.49 25.91 61.55 25.46C51.96 25.19 34.02 31.36 36.36 42.27C41.58 66.54 94.18 57.84 109.5 77.36C116.08 85.74 118.73 89.26 118.89 100.13C119.84 136.96 86.39 145.76 56.58 146.01C33.08 145 19.68 141.28 0 128.58L13.49 104.1C28.42 116.28 44.67 120.95 63.74 119.82C74.3 119.19 89.09 115.15 87.27 102C85.02 85.76 51.94 85.96 39.63 80.71C30.92 76.99 23.83 76.01 16.38 69.09C0.18 57.09 2.71 31.81 14.52 17.41C24.36 5.41 41.79 1.66 57.18 0.41Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(145.15 5.1) scale(0.101562 0.101563)`,
            d: `M67.07 0.55C68.64 0.36 70.22 0.23 71.8 0.16C96.27 -1.07 116.34 4.64 134.58 21.18L112.97 42.35C83.05 10.56 34.53 26.18 31.19 68.81C30.16 81.44 34.19 93.97 42.38 103.64C62.03 126.51 89.84 122.93 110.76 104.17L111.83 103.02C116.18 102.9 130.92 115.98 135.26 119.5C107.52 149.54 61.18 156.2 28.1 131.13C13.14 119.83 3.33 103.02 0.84 84.44C-5.31 39.42 22.9 6.24 67.07 0.55Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(100.54 1.88) scale(0.101562 0.101563)`,
            d: `M23.52 0.04L55.62 0L55.54 35.05L91.64 35.04L91.73 60.39C80.59 59.94 66.97 60.26 55.64 60.21C55.68 75.96 52.56 129.98 57.83 141.16C59.58 144.87 62.5 147.91 66.42 149.29C74.65 152.19 83.01 148.46 90.33 144.83C92.6 150.92 95.57 157.6 98.12 163.66C99.23 166.48 99.24 165.27 98 168.17C76.58 185.92 28.11 179.58 24.81 146.68C22.02 118.83 23.46 88.35 23.62 60.14C15.82 60.04 8.02 60.12 0.22 60.39L0 34.99L23.47 35.03L23.52 0.04Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(79.16 5.71) scale(0.101562 0.101563)`,
            d: `M0.24 0.08L31.4 0L31.2 138.11L0.23 138.15C-0.29 92.5 0.22 45.8 0.24 0.08Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(113.79 5.08) scale(0.101562 0.101563)`,
            d: `M50.69 0.74C67.73 -2.69 92.98 6.42 107.84 15.46L95.91 38.11C56.56 8.98 5.41 38.13 43.72 55.66C52.28 58.2 58.3 59.75 67.04 61.48C51.78 65.61 33.23 69.1 18.94 73.94C8.69 66.67 1.4 59.25 0.14 46.02C-0.72 35.96 2.52 25.99 9.13 18.36C20 5.74 34.98 2.07 50.69 0.74Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(78.88 0) scale(0.101562 0.101563)`,
            d: `M13.41 0.73C19.94 -1.16 26.98 0.67 31.76 5.5C36.54 10.33 38.3 17.38 36.35 23.89C34.4 30.4 29.05 35.32 22.41 36.73C12.63 38.79 2.98 32.76 0.56 23.06C-1.86 13.37 3.82 3.5 13.41 0.73Z`,
          }),
        ],
      }),
      (0, i.jsxs)(`g`, {
        className: `text-lavender`,
        fill: `currentColor`,
        children: [
          (0, i.jsx)(`path`, {
            transform: `translate(0 2.2) scale(0.101562 0.101563)`,
            d: `M41.12 0C50.49 0.03 59.35 1.36 67.49 6.38C77.22 12.39 84.03 22.63 86.47 33.74C88.74 44.07 88.91 118.83 87.29 130.46C86.45 136.92 84.19 143.11 80.68 148.59C73.18 160.11 62.96 165.11 50 167.8C-17.09 169.38 4.14 103.62 0.38 60.99C-0.18 54.62 0.24 41.82 1.31 35.68C2.49 28.66 5.35 22.04 9.65 16.37C17.77 5.8 28.4 1.63 41.12 0Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(11.14 2.18) scale(0.101562 0.101563)`,
            d: `M20.85 0.38C35.06 0.3 59.28 -1.49 72.54 3.45C81.12 7.85 85.77 20.36 85.36 29.03C84.47 48.14 91.27 69.48 67.96 76.09C54.68 76.24 21.48 78.6 11.05 72.57C6.49 69.9 1.03 60.56 1.07 55.41C1.24 35 -7.23 3.94 20.85 0.38Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(11.15 11.75) scale(0.101562 0.101563)`,
            d: `M45.86 0.9C63.22 0.22 74.79 -3.73 84.53 12.79C85.43 24.53 84.99 36.98 85.31 48.75C86.06 76.32 62.44 74.11 42.99 73.82C28.61 74.09 2.71 77.77 0.39 57.08C-3.02 26.68 16.35 5.8 45.86 0.9Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(113.34 11.94) scale(0.101562 0.101563)`,
            d: `M87.27 0C100.28 1.13 112.62 12.09 115.78 24.81C118.37 35.24 116.58 46.27 110.84 55.34C88.21 91.57 30.46 80.31 0 60.97L3.47 53.78L13.2 37.03C31.32 49.75 54.45 56.74 76.23 48.46C82.25 46.17 90.81 38.57 85.86 31.69C76.97 19.34 52.52 16.01 37.81 11.93C53.52 7.98 71.61 2.89 87.27 0Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(41.23 16.12) scale(0.101562 0.101563)`,
            d: `M0.62 0C9.96 4.36 23.51 12.48 33.08 17.6C33.18 21.62 34.02 34.09 32.4 36.85C21.84 36.61 10.61 36.97 0 37.14L0.62 0Z`,
          }),
          (0, i.jsx)(`path`, {
            transform: `translate(160.79 16.54) scale(0.101562 0.101563)`,
            d: `M11.53 0.77C20.14 -1.95 29.33 2.73 32.19 11.29C35.05 19.85 30.51 29.12 21.99 32.11C16.37 34.08 10.11 32.87 5.63 28.94C1.15 25.01 -0.87 18.97 0.35 13.13C1.58 7.3 5.85 2.57 11.53 0.77Z`,
          }),
        ],
      }),
    ],
  });
}
function y({ className: e }) {
  return (0, i.jsxs)(`svg`, {
    viewBox: `0 0 60.27 52`,
    fill: `currentColor`,
    className: e,
    "aria-hidden": `true`,
    children: [
      (0, i.jsx)(`path`, {
        transform: `translate(-0 0.08) scale(0.308541 0.308548)`,
        d: `M41.12 0C50.49 0.03 59.35 1.36 67.49 6.38C77.22 12.39 84.03 22.63 86.47 33.74C88.74 44.07 88.91 118.83 87.29 130.46C86.45 136.92 84.19 143.11 80.68 148.59C73.18 160.11 62.96 165.11 50 167.8C-17.09 169.38 4.14 103.62 0.38 60.99C-0.18 54.62 0.24 41.82 1.31 35.68C2.49 28.66 5.35 22.04 9.65 16.37C17.77 5.8 28.4 1.63 41.12 0Z`,
      }),
      (0, i.jsx)(`path`, {
        transform: `translate(33.85 0) scale(0.308541 0.308548)`,
        d: `M20.85 0.38C35.06 0.3 59.28 -1.49 72.54 3.45C81.12 7.85 85.77 20.36 85.36 29.03C84.47 48.14 91.27 69.48 67.96 76.09C54.68 76.24 21.48 78.6 11.05 72.57C6.49 69.9 1.03 60.56 1.07 55.41C1.24 35 -7.23 3.94 20.85 0.38Z`,
      }),
      (0, i.jsx)(`path`, {
        transform: `translate(33.88 29.09) scale(0.308541 0.308548)`,
        d: `M45.86 0.9C63.22 0.22 74.79 -3.73 84.53 12.79C85.43 24.53 84.99 36.98 85.31 48.75C86.06 76.32 62.44 74.11 42.99 73.82C28.61 74.09 2.71 77.77 0.39 57.08C-3.02 26.68 16.35 5.8 45.86 0.9Z`,
      }),
    ],
  });
}
var b = {
    solid: `bg-lavender text-ink-deep rounded-field hover:bg-lavender-soft active:bg-lavender/85`,
    sweep: `brand-sweep-y text-white rounded-selector hover:brightness-125 active:brightness-95`,
    dark: `bg-ink-deep rounded-lg text-white hover:bg-ink-deep/80 active:bg-ink-deep/90`,
    ghost: `border-lavender/40 text-mist rounded-selector border hover:border-lavender hover:bg-lavender/10 active:bg-lavender/20`,
  },
  x = {
    sm: `pointer-coarse:min-h-11 min-h-10 px-5 py-2.5 text-sm leading-normal`,
    md: `min-h-12 px-6 py-3 text-base leading-normal`,
  },
  S = {
    sm: `px-5 py-[0.34375rem] text-base leading-6 pointer-coarse:min-h-11`,
    md: `min-h-11 px-7 pt-2 pb-2.5 text-lg leading-[1.625rem]`,
  },
  C = {
    sm: `shadow-[0_0_0_0.25rem_#2923624d]`,
    md: `shadow-[0_0_0_0.375rem_#6046ca4d,0_0_0_0.875rem_#6046ca1a]`,
  };
function w({ variant: e = `solid`, size: t = `md`, className: n } = {}) {
  let r = e === `sweep`;
  return o(
    `focus-visible:outline-lavender inline-flex max-w-full items-center justify-center gap-2 text-center font-medium text-balance transition-[color,background-color,border-color,box-shadow,filter] focus-visible:outline-2 focus-visible:outline-offset-4`,
    b[e],
    r ? S[t] : x[t],
    r && C[t],
    n,
  );
}
function T({
  href: e,
  children: t,
  variant: n = `solid`,
  size: r = `md`,
  external: a = !0,
  className: o,
  "data-testid": s,
}) {
  return (0, i.jsx)(`a`, {
    href: e,
    target: a ? `_blank` : void 0,
    rel: a ? `noreferrer noopener` : void 0,
    "data-testid": s,
    className: w({ variant: n, size: r, className: o }),
    children: t,
  });
}
var E = {
    scannerBaseUrl: `https://scanner.assistsec.nl`,
    loginUrl: `https://scanner.assistsec.nl/login`,
    bookDemoUrl: `https://scanner.assistsec.nl/demo`,
    linkedInUrl: `https://www.linkedin.com/company/assistsec`,
  },
  D = {
    services: `services`,
    about: `about`,
    demonstrate: `demonstrate`,
    blog: `blog`,
  };
export {
  v as a,
  g as c,
  w as i,
  o as l,
  E as n,
  y as o,
  T as r,
  _ as s,
  D as t,
};
