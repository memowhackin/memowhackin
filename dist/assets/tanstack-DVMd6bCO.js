import { n as e, t } from "./rolldown-runtime-CbXtAM7H.js";
import { a as n, o as r } from "./i18n-CUYc3bXQ.js";
import { r as i, t as a } from "./react-BoQDZqka.js";
var o = e(r(), 1),
  s = o.use,
  c = o.useLayoutEffect;
function l(e, t, n = {}, r) {
  o.useEffect(() => {
    if (!e.current || r || typeof IntersectionObserver != `function`) return;
    let i = new IntersectionObserver(([e]) => {
      t(e);
    }, n);
    return (
      i.observe(e.current),
      () => {
        i.disconnect();
      }
    );
  }, [t, r, n, e]);
}
function u(e) {
  let t = o.useRef(null);
  return (o.useImperativeHandle(e, () => t.current, []), t);
}
function d(e) {
  return e[e.length - 1];
}
function f(e) {
  return typeof e == `function`;
}
function p(e, t) {
  return f(e) ? e(t) : e;
}
var m = Object.prototype.hasOwnProperty,
  h = Object.prototype.propertyIsEnumerable;
function g(e) {
  for (let t in e) if (m.call(e, t)) return !0;
  return !1;
}
var _ = () => Object.create(null),
  v = (e, t) => y(e, t, _);
function y(e, t, n = () => ({}), r = 0) {
  if (e === t) return e;
  if (r > 500) return t;
  let i = t,
    a = C(e) && C(i);
  if (!a && !(x(e) && x(i))) return i;
  let o = a ? e : b(e);
  if (!o) return i;
  let s = a ? i : b(i);
  if (!s) return i;
  let c = o.length,
    l = s.length,
    u = a ? Array(l) : n(),
    d = 0;
  for (let t = 0; t < l; t++) {
    let o = a ? t : s[t],
      l = e[o],
      f = i[o];
    if (l === f) {
      ((u[o] = l), (a ? t < c : m.call(e, o)) && d++);
      continue;
    }
    if (
      l === null ||
      f === null ||
      typeof l != `object` ||
      typeof f != `object`
    ) {
      u[o] = f;
      continue;
    }
    let p = y(l, f, n, r + 1);
    ((u[o] = p), p === l && d++);
  }
  return c === l && d === c ? e : u;
}
function b(e) {
  let t = Object.getOwnPropertyNames(e);
  for (let n of t) if (!h.call(e, n)) return !1;
  let n = Object.getOwnPropertySymbols(e);
  if (n.length === 0) return t;
  let r = t;
  for (let t of n) {
    if (!h.call(e, t)) return !1;
    r.push(t);
  }
  return r;
}
function x(e) {
  if (!S(e)) return !1;
  let t = e.constructor;
  if (t === void 0) return !0;
  let n = t.prototype;
  return !(!S(n) || !n.hasOwnProperty(`isPrototypeOf`));
}
function S(e) {
  return Object.prototype.toString.call(e) === `[object Object]`;
}
function C(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function w(e, t, n) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    for (let r = 0, i = e.length; r < i; r++) if (!w(e[r], t[r], n)) return !1;
    return !0;
  }
  if (x(e) && x(t)) {
    let r = n?.ignoreUndefined ?? !0;
    if (n?.partial) {
      for (let i in t)
        if ((!r || t[i] !== void 0) && !w(e[i], t[i], n)) return !1;
      return !0;
    }
    let i = 0;
    if (!r) i = Object.keys(e).length;
    else for (let t in e) e[t] !== void 0 && i++;
    let a = 0;
    for (let o in t)
      if ((!r || t[o] !== void 0) && (a++, a > i || !w(e[o], t[o], n)))
        return !1;
    return i === a;
  }
  return !1;
}
function T(e) {
  return typeof e?.message == `string`
    ? e.message.startsWith(`Failed to fetch dynamically imported module`) ||
        e.message.startsWith(`error loading dynamically imported module`) ||
        e.message.startsWith(`Importing a module script failed`)
    : !1;
}
var E = /[\x00-\x1f\x7f"<>`{}]/g;
function ee(e) {
  return e.replace(
    E,
    (e) => `%` + e.charCodeAt(0).toString(16).toUpperCase().padStart(2, `0`),
  );
}
function te(e) {
  let t;
  try {
    t = decodeURI(e);
  } catch {
    t = e.replaceAll(/%[0-9A-F]{2}/gi, (e) => {
      try {
        return decodeURI(e);
      } catch {
        return e;
      }
    });
  }
  return ee(t);
}
var ne = [`http:`, `https:`, `mailto:`, `tel:`];
function D(e, t) {
  if (!e) return !1;
  try {
    let n = new URL(e);
    return !t.has(n.protocol);
  } catch {
    return !1;
  }
}
function re(e) {
  if (!e || (!/[%\\\x00-\x1f\x7f]/.test(e) && !e.startsWith(`//`)))
    return { path: e, handledProtocolRelativeURL: !1 };
  let t = /%25|%5C/gi,
    n = 0,
    r = ``,
    i;
  for (; (i = t.exec(e)) !== null;)
    ((r += te(e.slice(n, i.index)) + i[0]), (n = t.lastIndex));
  r += te(n ? e.slice(n) : e);
  let a = !1;
  return (
    r.startsWith(`//`) && ((a = !0), (r = `/` + r.replace(/^\/+/, ``))),
    { path: r, handledProtocolRelativeURL: a }
  );
}
function ie(e) {
  return /\s|[^\u0000-\u007F]/.test(e)
    ? e.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent)
    : e;
}
function ae(e, t) {
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
  return !0;
}
function oe() {
  throw Error(`Invariant failed`);
}
function se(e) {
  let t = new Map(),
    n,
    r,
    i = (e) => {
      e.next &&
        (e.prev
          ? ((e.prev.next = e.next),
            (e.next.prev = e.prev),
            (e.next = void 0),
            r && ((r.next = e), (e.prev = r)))
          : ((e.next.prev = void 0),
            (n = e.next),
            (e.next = void 0),
            r && ((e.prev = r), (r.next = e))),
        (r = e));
    };
  return {
    get(e) {
      let n = t.get(e);
      if (n) return (i(n), n.value);
    },
    set(a, o) {
      if (t.size >= e && n) {
        let e = n;
        (t.delete(e.key),
          e.next && ((n = e.next), (e.next.prev = void 0)),
          e === r && (r = void 0));
      }
      let s = t.get(a);
      if (s) ((s.value = o), i(s));
      else {
        let e = { key: a, value: o, prev: r };
        (r && (r.next = e), (r = e), (n ||= e), t.set(a, e));
      }
    },
    clear() {
      (t.clear(), (n = void 0), (r = void 0));
    },
  };
}
var O = 4,
  ce = 5;
function le(e) {
  let t = e.indexOf(`{`);
  if (t === -1) return null;
  let n = e.indexOf(`}`, t);
  return n === -1 || t + 1 >= e.length ? null : [t, n];
}
function ue(e, t, n = new Uint16Array(6)) {
  let r = e.indexOf(`/`, t),
    i = r === -1 ? e.length : r,
    a = e.substring(t, i);
  if (!a || !a.includes(`$`))
    return (
      (n[0] = 0), (n[1] = t), (n[2] = t), (n[3] = i), (n[4] = i), (n[5] = i), n
    );
  if (a === `$`) {
    let r = e.length;
    return (
      (n[0] = 2), (n[1] = t), (n[2] = t), (n[3] = r), (n[4] = r), (n[5] = r), n
    );
  }
  if (a.charCodeAt(0) === 36)
    return (
      (n[0] = 1),
      (n[1] = t),
      (n[2] = t + 1),
      (n[3] = i),
      (n[4] = i),
      (n[5] = i),
      n
    );
  let o = le(a);
  if (o) {
    let [r, s] = o,
      c = a.charCodeAt(r + 1);
    if (c === 45) {
      if (r + 2 < a.length && a.charCodeAt(r + 2) === 36) {
        let e = r + 3,
          a = s;
        if (e < a)
          return (
            (n[0] = 3),
            (n[1] = t + r),
            (n[2] = t + e),
            (n[3] = t + a),
            (n[4] = t + s + 1),
            (n[5] = i),
            n
          );
      }
    } else if (c === 36) {
      let a = r + 1,
        o = r + 2;
      return o === s
        ? ((n[0] = 2),
          (n[1] = t + r),
          (n[2] = t + a),
          (n[3] = t + o),
          (n[4] = t + s + 1),
          (n[5] = e.length),
          n)
        : ((n[0] = 1),
          (n[1] = t + r),
          (n[2] = t + o),
          (n[3] = t + s),
          (n[4] = t + s + 1),
          (n[5] = i),
          n);
    }
  }
  return (
    (n[0] = 0), (n[1] = t), (n[2] = t), (n[3] = i), (n[4] = i), (n[5] = i), n
  );
}
function de(e, t, n, r, i, a, o, s) {
  s?.(n);
  let c = r;
  {
    let r = n.fullPath ?? n.from,
      s = n.options,
      l = r.length,
      u = s?.caseSensitive ?? e,
      d = s?.params?.parse ?? s?.parseParams;
    for (; c < l;) {
      let e = ue(r, c, t),
        n,
        s = c,
        l = e[5];
      ((c = l + 1), a++);
      let f = e[0];
      switch (f) {
        case 0: {
          let t = r.substring(e[2], e[3]),
            o = t,
            s;
          u
            ? (s = i.static ??= new Map())
            : ((o = t.toLowerCase()), (s = i.staticInsensitive ??= new Map()));
          let c = s.get(o);
          if (c) n = c;
          else {
            let e = k(r);
            ((e.parent = i), (e.depth = a), (n = e), s.set(o, e));
          }
          break;
        }
        case 1:
        case 3:
        case 2: {
          let t = r.substring(s, e[1]),
            c = r.substring(e[4], l),
            p = u && !!(t || c),
            m = t ? (p ? t : t.toLowerCase()) : void 0,
            h = c ? (p ? c : c.toLowerCase()) : void 0,
            g = f === 1 ? i.dynamic : f === 3 ? i.optional : i.wildcard,
            _ =
              f !== 2 &&
              !d &&
              g?.find(
                (e) =>
                  !e.parse &&
                  e.caseSensitive === p &&
                  e.prefix === m &&
                  e.suffix === h,
              );
          if (_) n = _;
          else {
            let e = pe(f, r, p, m, h);
            ((n = e), (e.parent = i), (e.depth = a));
            let t;
            ((t =
              f === 1
                ? (i.dynamic ??= [])
                : f === 3
                  ? (i.optional ??= [])
                  : (i.wildcard ??= [])),
              t.push(e),
              t.length === 2 && o?.push(t));
          }
          break;
        }
      }
      i = n;
    }
    if (
      d &&
      n.children &&
      !n.isRoot &&
      n.id &&
      n.id.charCodeAt(n.id.lastIndexOf(`/`) + 1) === 95
    ) {
      let e = k(r);
      ((e.kind = ce),
        (e.parent = i),
        a++,
        (e.depth = a),
        (i.pathless ??= []),
        i.pathless.push(e),
        (i = e));
    }
    let f = (n.path || !n.children) && !n.isRoot;
    if (f && r.endsWith(`/`)) {
      let e = k(r);
      ((e.kind = O),
        (e.parent = i),
        a++,
        (e.depth = a),
        (i.index = e),
        (i = e));
    }
    ((i.parse = d ?? null),
      (i.priority = s?.params?.priority ?? 0),
      f && !i.route && ((i.route = n), (i.fullPath = r)));
  }
  if (n.children) for (let r of n.children) de(e, t, r, c, i, a, o, s);
}
function fe(e, t) {
  if (e.parse && !t.parse) return -1;
  if (!e.parse && t.parse) return 1;
  if (e.parse && t.parse && (e.priority || t.priority))
    return t.priority - e.priority;
  if (e.prefix && t.prefix && e.prefix !== t.prefix) {
    if (e.prefix.startsWith(t.prefix)) return -1;
    if (t.prefix.startsWith(e.prefix)) return 1;
  }
  if (e.suffix && t.suffix && e.suffix !== t.suffix) {
    if (e.suffix.endsWith(t.suffix)) return -1;
    if (t.suffix.endsWith(e.suffix)) return 1;
  }
  return e.prefix && !t.prefix
    ? -1
    : !e.prefix && t.prefix
      ? 1
      : e.suffix && !t.suffix
        ? -1
        : !e.suffix && t.suffix
          ? 1
          : e.caseSensitive && !t.caseSensitive
            ? -1
            : !e.caseSensitive && t.caseSensitive
              ? 1
              : 0;
}
function k(e) {
  return {
    kind: 0,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath: e,
    parent: null,
    parse: null,
    priority: 0,
  };
}
function pe(e, t, n, r, i) {
  return {
    kind: e,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath: t,
    parent: null,
    parse: null,
    priority: 0,
    caseSensitive: n,
    prefix: r,
    suffix: i,
  };
}
function me(e, t) {
  let n = k(`/`),
    r = new Uint16Array(6),
    i = [];
  for (let t of e) de(!1, r, t, 1, n, 0, i);
  for (let e of i) e.sort(fe);
  ((t.masksTree = n), (t.flatCache = se(1e3)));
}
function he(e, t) {
  e ||= `/`;
  let n = t.flatCache.get(e);
  if (n) return n;
  let r = be(e, t.masksTree);
  return (t.flatCache.set(e, r), r);
}
function ge(e, t, n, r, i) {
  ((e ||= `/`), (r ||= `/`));
  let a = t ? `case\0${e}` : e,
    o = i.singleCache.get(a);
  return (
    o ||
      ((o = k(`/`)),
      de(t, new Uint16Array(6), { from: e }, 1, o, 0),
      i.singleCache.set(a, o)),
    be(r, o, n)
  );
}
function _e(e, t, n = !1) {
  let r = n ? e : `nofuzz\0${e}`,
    i = t.matchCache.get(r);
  if (i !== void 0) return i;
  e ||= `/`;
  let a;
  try {
    a = be(e, t.segmentTree, n);
  } catch (e) {
    if (e instanceof URIError) a = null;
    else throw e;
  }
  return (a && (a.branch = xe(a.route)), t.matchCache.set(r, a), a);
}
function ve(e) {
  return e === `/` ? e : e.replace(/\/{1,}$/, ``);
}
function ye(e, t = !1, n) {
  let r = k(e.fullPath),
    i = new Uint16Array(6),
    a = [],
    o = {},
    s = {},
    c = 0;
  de(t, i, e, 1, r, 0, a, (e) => {
    if ((n?.(e, c), e.id in o && oe(), (o[e.id] = e), c !== 0 && e.path)) {
      let t = ve(e.fullPath);
      (!s[t] || e.fullPath.endsWith(`/`)) && (s[t] = e);
    }
    c++;
  });
  for (let e of a) e.sort(fe);
  return {
    processedTree: {
      segmentTree: r,
      singleCache: se(1e3),
      matchCache: se(1e3),
      flatCache: null,
      masksTree: null,
    },
    routesById: o,
    routesByPath: s,
  };
}
function be(e, t, n = !1) {
  let r = e.split(`/`),
    i = Ce(e, r, t, n);
  if (!i) return null;
  let [a] = A(e, r, i);
  return { route: i.node.route, rawParams: a };
}
function A(e, t, n) {
  let r = Se(n.node),
    i = null,
    a = Object.create(null),
    o = n.extract?.part ?? 0,
    s = n.extract?.node ?? 0,
    c = n.extract?.path ?? 0,
    l = n.extract?.segment ?? 0;
  for (; s < r.length; o++, s++, c++, l++) {
    let u = r[s];
    if (u.kind === O) break;
    if (u.kind === ce) {
      (l--, o--, c--);
      continue;
    }
    let d = t[o],
      f = c;
    if ((d && (c += d.length), u.kind === 1)) {
      i ??= n.node.fullPath.split(`/`);
      let e = i[l],
        t = u.prefix?.length ?? 0;
      if (e.charCodeAt(t) === 123) {
        let n = u.suffix?.length ?? 0,
          r = e.substring(t + 2, e.length - n - 1),
          i = d.substring(t, d.length - n);
        a[r] = decodeURIComponent(i);
      } else {
        let t = e.substring(1);
        a[t] = decodeURIComponent(d);
      }
    } else if (u.kind === 3) {
      if (n.skipped & (1 << s)) {
        (o--, (c = f - 1));
        continue;
      }
      i ??= n.node.fullPath.split(`/`);
      let e = i[l],
        t = u.prefix?.length ?? 0,
        r = u.suffix?.length ?? 0,
        p = e.substring(t + 3, e.length - r - 1),
        m = u.suffix || u.prefix ? d.substring(t, d.length - r) : d;
      m && (a[p] = decodeURIComponent(m));
    } else if (u.kind === 2) {
      let t = u,
        n = e.substring(
          f + (t.prefix?.length ?? 0),
          e.length - (t.suffix?.length ?? 0),
        ),
        r = decodeURIComponent(n);
      ((a[`*`] = r), (a._splat = r));
      break;
    }
  }
  return (
    n.rawParams && Object.assign(a, n.rawParams),
    [a, { part: o, node: s, path: c, segment: l }]
  );
}
function xe(e) {
  let t = [e];
  for (; e.parentRoute;) ((e = e.parentRoute), t.push(e));
  return (t.reverse(), t);
}
function Se(e) {
  let t = Array(e.depth + 1);
  do ((t[e.depth] = e), (e = e.parent));
  while (e);
  return t;
}
function Ce(e, t, n, r) {
  if (e === `/` && n.index) return { node: n.index, skipped: 0 };
  let i = !d(t),
    a = i && e !== `/`,
    o = t.length - +!!i,
    s = [
      { node: n, index: 1, skipped: 0, statics: 0, dynamics: 0, optionals: 0 },
    ],
    c = null,
    l = null;
  for (; s.length;) {
    let n = s.pop(),
      {
        node: i,
        index: u,
        skipped: d,
        statics: f,
        dynamics: p,
        optionals: m,
      } = n,
      { extract: h, rawParams: g } = n;
    if (i.kind === 2 && i.route && !j(l, n)) continue;
    if (i.parse) {
      if (!Ee(e, t, n)) continue;
      ((g = n.rawParams), (h = n.extract));
    }
    r && i.route && i.kind !== O && j(c, n) && (c = n);
    let _ = u === o;
    if (
      _ &&
      (i.route && (!a || i.kind === O || i.kind === 2) && j(l, n) && (l = n),
      !i.optional && !i.wildcard && !i.index && !i.pathless)
    )
      continue;
    let v = _ ? void 0 : t[u],
      y;
    if (_ && i.index) {
      let n = {
          node: i.index,
          index: u,
          skipped: d,
          statics: f,
          dynamics: p,
          optionals: m,
          extract: h,
          rawParams: g,
        },
        r = !0;
      if ((i.index.parse && (Ee(e, t, n) || (r = !1)), r)) {
        if (!p && !m && !d && Te(f, o)) return n;
        j(l, n) && (l = n);
      }
    }
    if (i.wildcard)
      for (let e = i.wildcard.length - 1; e >= 0; e--) {
        let n = i.wildcard[e],
          { prefix: r, suffix: a } = n;
        if (
          !(
            r &&
            (_ ||
              !(n.caseSensitive ? v : (y ??= v.toLowerCase())).startsWith(r))
          )
        ) {
          if (a) {
            if (_) continue;
            let e = t.slice(u).join(`/`).slice(-a.length);
            if ((n.caseSensitive ? e : e.toLowerCase()) !== a) continue;
          }
          s.push({
            node: n,
            index: o,
            skipped: d,
            statics: f,
            dynamics: p,
            optionals: m,
            extract: h,
            rawParams: g,
          });
        }
      }
    if (i.optional) {
      let e = d | (1 << (i.depth + 1));
      for (let t = i.optional.length - 1; t >= 0; t--) {
        let n = i.optional[t];
        s.push({
          node: n,
          index: u,
          skipped: e,
          statics: f,
          dynamics: p,
          optionals: m,
          extract: h,
          rawParams: g,
        });
      }
      if (!_)
        for (let e = i.optional.length - 1; e >= 0; e--) {
          let t = i.optional[e],
            { prefix: n, suffix: r } = t;
          if (n || r) {
            let e = t.caseSensitive ? v : (y ??= v.toLowerCase());
            if ((n && !e.startsWith(n)) || (r && !e.endsWith(r))) continue;
          }
          s.push({
            node: t,
            index: u + 1,
            skipped: d,
            statics: f,
            dynamics: p,
            optionals: m + we(o, u),
            extract: h,
            rawParams: g,
          });
        }
    }
    if (!_ && i.dynamic && v)
      for (let e = i.dynamic.length - 1; e >= 0; e--) {
        let t = i.dynamic[e],
          { prefix: n, suffix: r } = t;
        if (n || r) {
          let e = t.caseSensitive ? v : (y ??= v.toLowerCase());
          if ((n && !e.startsWith(n)) || (r && !e.endsWith(r))) continue;
        }
        s.push({
          node: t,
          index: u + 1,
          skipped: d,
          statics: f,
          dynamics: p + we(o, u),
          optionals: m,
          extract: h,
          rawParams: g,
        });
      }
    if (!_ && i.staticInsensitive) {
      let e = i.staticInsensitive.get((y ??= v.toLowerCase()));
      e &&
        s.push({
          node: e,
          index: u + 1,
          skipped: d,
          statics: f + we(o, u),
          dynamics: p,
          optionals: m,
          extract: h,
          rawParams: g,
        });
    }
    if (!_ && i.static) {
      let e = i.static.get(v);
      e &&
        s.push({
          node: e,
          index: u + 1,
          skipped: d,
          statics: f + we(o, u),
          dynamics: p,
          optionals: m,
          extract: h,
          rawParams: g,
        });
    }
    if (i.pathless)
      for (let e = i.pathless.length - 1; e >= 0; e--) {
        let t = i.pathless[e];
        s.push({
          node: t,
          index: u,
          skipped: d,
          statics: f,
          dynamics: p,
          optionals: m,
          extract: h,
          rawParams: g,
        });
      }
  }
  if (l) return l;
  if (r && c) {
    let n = c.index;
    for (let e = 0; e < c.index; e++) n += t[e].length;
    let r = n === e.length ? `/` : e.slice(n);
    return (
      (c.rawParams ??= Object.create(null)),
      (c.rawParams[`**`] = decodeURIComponent(r)),
      c
    );
  }
  return null;
}
function we(e, t) {
  return 2 ** (e - t - 1);
}
function Te(e, t) {
  return e === 2 ** (t - 1) - 1;
}
function Ee(e, t, n) {
  let r, i;
  try {
    [r, i] = A(e, t, n);
  } catch {
    return null;
  }
  if (((n.rawParams = r), (n.extract = i), !n.node.parse)) return !0;
  try {
    if (n.node.parse(r) === !1) return null;
  } catch {}
  return !0;
}
function j(e, t) {
  return (
    !e ||
    t.statics > e.statics ||
    (t.statics === e.statics &&
      (t.dynamics > e.dynamics ||
        (t.dynamics === e.dynamics &&
          (t.optionals > e.optionals ||
            (t.optionals === e.optionals &&
              ((t.node.kind === O) > (e.node.kind === O) ||
                ((t.node.kind === O) == (e.node.kind === O) &&
                  t.node.depth > e.node.depth)))))))
  );
}
function M(e) {
  return N(e.filter((e) => e !== void 0).join(`/`));
}
function N(e) {
  return e.replace(/\/{2,}/g, `/`);
}
function De(e) {
  return e === `/` ? e : e.replace(/^\/{1,}/, ``);
}
function P(e) {
  let t = e.length;
  return t > 1 && e[t - 1] === `/` ? e.replace(/\/{1,}$/, ``) : e;
}
function Oe(e) {
  return P(De(e));
}
function ke(e, t) {
  return e?.endsWith(`/`) && e !== `/` && e !== `${t}/` ? e.slice(0, -1) : e;
}
function Ae(e, t, n) {
  return ke(e, n) === ke(t, n);
}
function je({ base: e, to: t, trailingSlash: n = `never`, cache: r }) {
  let i = t.startsWith(`/`),
    a = !i && t === `.`,
    o;
  if (r) {
    o = i ? t : a ? e : e + `\0` + t;
    let n = r.get(o);
    if (n) return n;
  }
  let s;
  if (a) s = e.split(`/`);
  else if (i) s = t.split(`/`);
  else {
    for (s = e.split(`/`); s.length > 1 && d(s) === ``;) s.pop();
    let n = t.split(`/`);
    for (let e = 0, t = n.length; e < t; e++) {
      let r = n[e];
      r === ``
        ? e
          ? e === t - 1 && s.push(r)
          : (s = [r])
        : r === `..`
          ? s.pop()
          : r === `.` || s.push(r);
    }
  }
  s.length > 1 &&
    (d(s) === `` ? n === `never` && s.pop() : n === `always` && s.push(``));
  let c = N(s.join(`/`)) || `/`;
  return (o && r && r.set(o, c), c);
}
function Me(e) {
  let t = new Map(e.map((e) => [encodeURIComponent(e), e])),
    n = Array.from(t.keys())
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`))
      .join(`|`),
    r = new RegExp(n, `g`);
  return (e) => e.replace(r, (e) => t.get(e) ?? e);
}
function Ne(e, t, n) {
  let r = t[e];
  return typeof r == `string`
    ? e === `_splat`
      ? /^[a-zA-Z0-9\-._~!/]*$/.test(r)
        ? r
        : r
            .split(`/`)
            .map((e) => Fe(e, n))
            .join(`/`)
      : Fe(r, n)
    : r;
}
function Pe({ path: e, params: t, decoder: n, ...r }) {
  let i = !1,
    a = Object.create(null);
  if (!e || e === `/`)
    return { interpolatedPath: `/`, usedParams: a, isMissingParams: i };
  if (!e.includes(`$`))
    return { interpolatedPath: e, usedParams: a, isMissingParams: i };
  let o = e.length,
    s = 0,
    c,
    l = ``;
  for (; s < o;) {
    let r = s;
    c = ue(e, r, c);
    let o = c[5];
    if (((s = o + 1), r === o)) continue;
    let u = c[0];
    if (u === 0) {
      l += `/` + e.substring(r, o);
      continue;
    }
    if (u === 2) {
      let s = t._splat;
      ((a._splat = s), (a[`*`] = s));
      let u = e.substring(r, c[1]),
        d = e.substring(c[4], o);
      if (!s) {
        ((i = !0), (u || d) && (l += `/` + u + d));
        continue;
      }
      let f = Ne(`_splat`, t, n);
      l += `/` + u + f + d;
      continue;
    }
    if (u === 1) {
      let s = e.substring(c[2], c[3]);
      (!i && !(s in t) && (i = !0), (a[s] = t[s]));
      let u = e.substring(r, c[1]),
        d = e.substring(c[4], o),
        f = Ne(s, t, n) ?? `undefined`;
      l += `/` + u + f + d;
      continue;
    }
    if (u === 3) {
      let i = e.substring(c[2], c[3]),
        s = t[i];
      if (s == null) continue;
      a[i] = s;
      let u = e.substring(r, c[1]),
        d = e.substring(c[4], o),
        f = Ne(i, t, n) ?? ``;
      l += `/` + u + f + d;
      continue;
    }
  }
  return (
    e.endsWith(`/`) && (l += `/`),
    { usedParams: a, interpolatedPath: l || `/`, isMissingParams: i }
  );
}
function Fe(e, t) {
  let n = encodeURIComponent(e);
  return t?.(n) ?? n;
}
function F(e) {
  return e?.isNotFound === !0;
}
function Ie() {
  try {
    return sessionStorage;
  } catch {
    return;
  }
}
var Le = `tsr-scroll-restoration-v1_3`,
  Re = Ie();
function ze() {
  try {
    return JSON.parse(Re?.getItem(`tsr-scroll-restoration-v1_3`) || `{}`);
  } catch {
    return {};
  }
}
function Be() {
  try {
    Re?.setItem(Le, JSON.stringify(Ve));
  } catch {}
}
var Ve = ze(),
  He = `data-scroll-restoration-id`,
  Ue = (e) => e.state.__TSR_key || e.href;
function We(e) {
  let t = e.getAttribute(He);
  if (t) return `[${He}="${t}"]`;
  let n = ``,
    r = e,
    i;
  for (; (i = r.parentNode);) {
    let e = 1,
      t = r;
    for (; (t = t.previousElementSibling);) e++;
    let a = `${r.localName}:nth-child(${e})`;
    ((n = n ? `${a} > ${n}` : a), (r = i));
  }
  return n;
}
var Ge = !1,
  Ke = `window`;
function qe(e) {
  try {
    return typeof e == `function` ? e() : document.querySelector(e);
  } catch {}
}
function Je(e) {
  let t = new Set();
  for (let n of e) {
    if (n === Ke) continue;
    let e = qe(n);
    e && t.add(e);
  }
  return t;
}
function Ye(e, t) {
  let n = t ?? e.options.scrollRestoration,
    r = e._scroll;
  n && (r.restoring = !0);
  let i = e.options.getScrollRestorationKey || Ue,
    a = new Set(),
    o = (e) => {
      let t = (Ve[e] ||= {});
      for (let e of a)
        e === document
          ? (t[Ke] = { scrollX, scrollY })
          : e.isConnected &&
            (t[We(e)] = { scrollX: e.scrollLeft, scrollY: e.scrollTop });
    };
  (n &&
    !r.restoration &&
    ((r.restoration = !0),
    (Ge = !1),
    (history.scrollRestoration = `manual`),
    document.addEventListener(
      `scroll`,
      (e) => {
        Ge || a.add(e.target);
      },
      !0,
    ),
    e.subscribe(`onBeforeLoad`, (e) => {
      (e.fromLocation && o(i(e.fromLocation)), a.clear());
    }),
    addEventListener(`pagehide`, () => {
      (o(i(e.stores.resolvedLocation.get() ?? e.stores.location.get())), Be());
    })),
    !r.reset &&
      ((r.reset = !0),
      e.subscribe(`onRendered`, (t) => {
        let n = e.options.scrollRestorationBehavior,
          o = e.options.scrollToTopSelectors,
          s = r.next,
          c = r.hash,
          l;
        if (
          (a.clear(),
          (r.next = !0),
          (r.hash = !1),
          typeof e.options.scrollRestoration == `function` &&
            !e.options.scrollRestoration({ location: e.latestLocation }))
        )
          return;
        let u = i(t.toLocation),
          d = t.fromLocation && i(t.fromLocation);
        if (r.restoring && d && d !== u) {
          let e = Ve[d];
          if (e) {
            let t = Ve[u];
            for (let n in e) {
              if (n === Ke) {
                if (s) continue;
              } else {
                let e = qe(n);
                if (!e || (s && o && ((l ??= Je(o)), l.has(e)))) continue;
              }
              ((t ||= Ve[u] = {}), (t[n] ??= e[n]));
            }
          }
        }
        Ge = !0;
        try {
          let e = t.toLocation.hash,
            i = t.toLocation.state.__hashScrollIntoViewOptions ?? !0,
            a = !1;
          if (s) {
            !e && o && (l ??= Je(o));
            let t = e && i && c,
              s = r.restoring ? Ve[u] : void 0;
            if (s)
              for (let e in s) {
                let { scrollX: r, scrollY: i } = s[e];
                if (e === Ke) {
                  if (t) continue;
                  (scrollTo({ top: i, left: r, behavior: n }), (a = !0));
                } else {
                  let t = qe(e);
                  t && ((t.scrollLeft = r), (t.scrollTop = i), l?.delete(t));
                }
              }
            if (!e) {
              let e = { top: 0, left: 0, behavior: n };
              if ((a || scrollTo(e), l)) for (let t of l) t.scrollTo(e);
            }
          }
          !a && e && i && document.getElementById(e)?.scrollIntoView(i);
        } finally {
          Ge = !1;
        }
      })));
}
function Xe(e, t = String) {
  let n = new URLSearchParams();
  for (let r in e) {
    let i = e[r];
    i !== void 0 && n.set(r, t(i));
  }
  return n.toString();
}
function Ze(e) {
  return e
    ? e === `false`
      ? !1
      : e === `true`
        ? !0
        : e * 0 == 0 && +e + `` === e
          ? +e
          : e
    : ``;
}
function Qe(e) {
  let t = new URLSearchParams(e),
    n = Object.create(null);
  for (let [e, r] of t.entries()) {
    let t = n[e];
    t == null
      ? (n[e] = Ze(r))
      : Array.isArray(t)
        ? t.push(Ze(r))
        : (n[e] = [t, Ze(r)]);
  }
  return n;
}
var $e = tt(JSON.parse),
  et = nt(JSON.stringify, JSON.parse);
function tt(e) {
  return (t) => {
    t[0] === `?` && (t = t.substring(1));
    let n = Qe(t);
    for (let t in n) {
      let r = n[t];
      if (typeof r == `string`)
        try {
          n[t] = e(r);
        } catch {}
    }
    return n;
  };
}
function nt(e, t) {
  let n = typeof t == `function`;
  function r(r) {
    if (typeof r == `object` && r)
      try {
        return e(r);
      } catch {}
    else if (n && typeof r == `string`)
      try {
        return (t(r), e(r));
      } catch {}
    return r;
  }
  return (e) => {
    let t = Xe(e, r);
    return t ? `?${t}` : ``;
  };
}
var rt = `__root__`;
function it(e) {
  if (
    ((e.statusCode = e.statusCode || e.code || 307),
    !e._builtLocation && !e.reloadDocument && typeof e.href == `string`)
  )
    try {
      (new URL(e.href), (e.reloadDocument = !0));
    } catch {}
  let t = new Headers(e.headers);
  e.href && t.get(`Location`) === null && t.set(`Location`, e.href);
  let n = new Response(null, { status: e.statusCode, headers: t });
  if (((n.options = e), e.throw)) throw n;
  return n;
}
function at(e) {
  return e instanceof Response && !!e.options;
}
function ot(e) {
  return {
    input: ({ url: t }) => {
      for (let n of e) t = ct(n, t);
      return t;
    },
    output: ({ url: t }) => {
      for (let n = e.length - 1; n >= 0; n--) t = lt(e[n], t);
      return t;
    },
  };
}
function st(e) {
  let t = Oe(e.basepath),
    n = `/${t}`,
    r = e.caseSensitive ? n : n.toLowerCase(),
    i = `${r}/`;
  return {
    input: ({ url: t }) => {
      let a = e.caseSensitive ? t.pathname : t.pathname.toLowerCase();
      return (
        a === r
          ? (t.pathname = `/`)
          : a.startsWith(i) && (t.pathname = t.pathname.slice(n.length)),
        t
      );
    },
    output: ({ url: e }) => ((e.pathname = M([`/`, t, e.pathname])), e),
  };
}
function ct(e, t) {
  let n = e?.input?.({ url: t });
  if (n) {
    if (typeof n == `string`) return new URL(n);
    if (n instanceof URL) return n;
  }
  return t;
}
function lt(e, t) {
  let n = e?.output?.({ url: t });
  if (n) {
    if (typeof n == `string`) return new URL(n);
    if (n instanceof URL) return n;
  }
  return t;
}
function ut(e, t) {
  let { createMutableStore: n, createReadonlyStore: r, batch: i } = t,
    a = new Map(),
    o = n(`idle`),
    s = n(e),
    c = n(void 0),
    l = n([]),
    u = r(() => l.get().map((e) => a.get(e).get())),
    d = r(() => ({
      status: o.get(),
      isLoading: o.get() === `pending`,
      matches: u.get(),
      location: s.get(),
      resolvedLocation: c.get(),
    }));
  function f(e) {
    let t = a.get(e);
    return (t || ((t = n(void 0)), a.set(e, t)), t);
  }
  let p = {
    status: o,
    location: s,
    resolvedLocation: c,
    ids: l,
    matches: u,
    byRoute: a,
    __store: d,
    getMatchStore: f,
    setMatches: m,
  };
  function m(e) {
    let t = l.get(),
      n = e.map((e) => e.routeId);
    i(() => {
      ae(t, n) || l.set(n);
      for (let e of t) n.includes(e) || a.get(e).set(() => void 0);
      for (let t of e) {
        let e = f(t.routeId);
        e.get() !== t && e.set(t);
      }
    });
  }
  return p;
}
var I = `__TSR_index`,
  dt = `popstate`,
  ft = `beforeunload`;
function pt(e) {
  let t = e.getLocation(),
    n = new Set(),
    r = (r) => {
      ((t = e.getLocation()), n.forEach((e) => e({ location: t, action: r })));
    },
    i = (n) => {
      (e.notifyOnIndexChange ?? !0) ? r(n) : (t = e.getLocation());
    },
    a = async ({ task: n, navigateOpts: r, ...i }) => {
      if (r?.ignoreBlocker ?? !1) {
        n();
        return;
      }
      let a = e.getBlockers?.() ?? [],
        o = i.type === `PUSH` || i.type === `REPLACE`;
      if (typeof document < `u` && a.length && o)
        for (let n of a) {
          let r = _t(i.path, i.state);
          if (
            await n.blockerFn({
              currentLocation: t,
              nextLocation: r,
              action: i.type,
            })
          ) {
            e.onBlocked?.();
            return;
          }
        }
      n();
    };
  return {
    get location() {
      return t;
    },
    get length() {
      return e.getLength();
    },
    subscribers: n,
    subscribe: (e) => (
      n.add(e),
      () => {
        n.delete(e);
      }
    ),
    push: (n, i, o) => {
      let s = t.state[I];
      ((i = mt(s + 1, i)),
        a({
          task: () => {
            (e.pushState(n, i), r({ type: `PUSH` }));
          },
          navigateOpts: o,
          type: `PUSH`,
          path: n,
          state: i,
        }));
    },
    replace: (n, i, o) => {
      let s = t.state[I];
      ((i = mt(s, i)),
        a({
          task: () => {
            (e.replaceState(n, i), r({ type: `REPLACE` }));
          },
          navigateOpts: o,
          type: `REPLACE`,
          path: n,
          state: i,
        }));
    },
    go: (t, n) => {
      a({
        task: () => {
          (e.go(t), i({ type: `GO`, index: t }));
        },
        navigateOpts: n,
        type: `GO`,
      });
    },
    back: (t) => {
      a({
        task: () => {
          (e.back(t?.ignoreBlocker ?? !1), i({ type: `BACK` }));
        },
        navigateOpts: t,
        type: `BACK`,
      });
    },
    forward: (t) => {
      a({
        task: () => {
          (e.forward(t?.ignoreBlocker ?? !1), i({ type: `FORWARD` }));
        },
        navigateOpts: t,
        type: `FORWARD`,
      });
    },
    canGoBack: () => t.state[I] !== 0,
    createHref: (t) => e.createHref(t),
    block: (t) => {
      if (!e.setBlockers) return () => {};
      let n = e.getBlockers?.() ?? [];
      return (
        e.setBlockers([...n, t]),
        () => {
          let n = e.getBlockers?.() ?? [];
          e.setBlockers?.(n.filter((e) => e !== t));
        }
      );
    },
    flush: () => e.flush?.(),
    destroy: () => e.destroy?.(),
    notify: r,
  };
}
function mt(e, t) {
  t ||= {};
  let n = vt();
  return { ...t, key: n, __TSR_key: n, [I]: e };
}
function ht(e) {
  let t = e?.window ?? (typeof document < `u` ? window : void 0),
    n = t.history.pushState,
    r = t.history.replaceState,
    i = [],
    a = () => i,
    o = (e) => (i = e),
    s = e?.createHref ?? ((e) => e),
    c =
      e?.parseLocation ??
      (() =>
        _t(
          `${t.location.pathname}${t.location.search}${t.location.hash}`,
          t.history.state,
        ));
  if (!t.history.state?.__TSR_key && !t.history.state?.key) {
    let e = vt();
    t.history.replaceState({ [I]: 0, key: e, __TSR_key: e }, ``);
  }
  let l = c(),
    u,
    d = !1,
    f = !1,
    p = !1,
    m = !1,
    h = () => l,
    g,
    _ = () => {
      g &&
        ((S._ignoreSubscribers = !0),
        (g[2] ? t.history.pushState : t.history.replaceState)(g[1], ``, g[0]),
        (S._ignoreSubscribers = !1),
        (g = void 0),
        (u = void 0));
    },
    v = (e, t, n) => {
      let r = s(t),
        i = !!g;
      (i || (u = l),
        (l = _t(t, n)),
        (g = [r, n, g?.[2] || e]),
        i || queueMicrotask(() => _()));
    },
    y = (e) => {
      ((l = c()), S.notify({ type: e }));
    },
    b = async () => {
      if (f) {
        f = !1;
        return;
      }
      let e = c(),
        n = e.state[I] - l.state[I],
        r = n === 1,
        i = n === -1,
        o = (!r && !i) || d;
      d = !1;
      let s = o ? `GO` : i ? `BACK` : `FORWARD`,
        u = o ? { type: `GO`, index: n } : { type: i ? `BACK` : `FORWARD` };
      if (p) p = !1;
      else {
        let n = a();
        if (typeof document < `u` && n.length) {
          for (let r of n)
            if (
              await r.blockerFn({
                currentLocation: l,
                nextLocation: e,
                action: s,
              })
            ) {
              ((f = !0), t.history.go(1), S.notify(u));
              return;
            }
        }
      }
      ((l = c()), S.notify(u));
    },
    x = (e) => {
      if (m) {
        m = !1;
        return;
      }
      let t = !1,
        n = a();
      if (typeof document < `u` && n.length)
        for (let e of n) {
          let n = e.enableBeforeUnload ?? !0;
          if (n === !0) {
            t = !0;
            break;
          }
          if (typeof n == `function` && n() === !0) {
            t = !0;
            break;
          }
        }
      if (t) return (e.preventDefault(), (e.returnValue = ``));
    },
    S = pt({
      getLocation: h,
      getLength: () => t.history.length,
      pushState: (e, t) => v(!0, e, t),
      replaceState: (e, t) => v(!1, e, t),
      back: (e) => (e && (p = !0), (m = !0), t.history.back()),
      forward: (e) => {
        (e && (p = !0), (m = !0), t.history.forward());
      },
      go: (e) => {
        ((d = !0), t.history.go(e));
      },
      createHref: (e) => s(e),
      flush: _,
      destroy: () => {
        ((t.history.pushState = n),
          (t.history.replaceState = r),
          t.removeEventListener(ft, x, { capture: !0 }),
          t.removeEventListener(dt, b));
      },
      onBlocked: () => {
        u && l !== u && (l = u);
      },
      getBlockers: a,
      setBlockers: o,
      notifyOnIndexChange: !1,
    });
  return (
    t.addEventListener(ft, x, { capture: !0 }),
    t.addEventListener(dt, b),
    (t.history.pushState = function (...e) {
      let r = n.apply(t.history, e);
      return (S._ignoreSubscribers || y(`PUSH`), r);
    }),
    (t.history.replaceState = function (...e) {
      let n = r.apply(t.history, e);
      return (S._ignoreSubscribers || y(`REPLACE`), n);
    }),
    S
  );
}
function gt(e) {
  let t = e.replace(/[\x00-\x1f\x7f]/g, ``);
  return (t.startsWith(`//`) && (t = `/` + t.replace(/^\/+/, ``)), t);
}
function _t(e, t) {
  let n = gt(e),
    r = n.indexOf(`#`),
    i = n.indexOf(`?`),
    a = vt();
  return {
    href: n,
    pathname: n.substring(
      0,
      r > 0 ? (i > 0 ? Math.min(r, i) : r) : i > 0 ? i : n.length,
    ),
    hash: r > -1 ? n.substring(r) : ``,
    search: i > -1 ? n.slice(i, r === -1 ? void 0 : r) : ``,
    state: t || { [I]: 0, key: a, __TSR_key: a },
  };
}
function vt() {
  return (Math.random() + 1).toString(36).substring(7);
}
function yt(e) {
  return (
    e.options.loader ||
    e.options.beforeLoad ||
    e.lazyFn ||
    e.options.component?.preload ||
    e.options.pendingComponent?.preload
  );
}
function bt(e, t) {
  return {
    fromLocation: t,
    toLocation: e,
    pathChanged: t?.pathname !== e.pathname,
    hrefChanged: t?.href !== e.href,
    hashChanged: t?.hash !== e.hash,
  };
}
function xt({
  key: e,
  __TSR_key: t,
  __TSR_index: n,
  __hashScrollIntoViewOptions: r,
  ...i
}) {
  return i;
}
function St(e, t, n, r) {
  for (let i of t) {
    if (r?.() === !1) return;
    n.some((e) => e.routeId === i.routeId) ||
      e.routesById[i.routeId].options.onLeave?.(i);
  }
  for (let i of n) {
    if (r?.() === !1) return;
    e.routesById[i.routeId].options[
      t.some((e) => e.routeId === i.routeId) ? `onStay` : `onEnter`
    ]?.(i);
  }
}
var Ct = class {
    constructor(e, t) {
      ((this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`),
        (this._scroll = { next: !0 }),
        (this.subscribers = new Set()),
        (this._cache = new Map()),
        (this._committed = []),
        (this.routeBranchCache = new WeakMap()),
        (this.lightweightCache = new WeakMap()),
        (this.startTransition = async (e) => (e(), !1)),
        (this.update = (e) => {
          let t = this.options,
            n = this.basepath ?? t?.basepath ?? `/`,
            r = this.basepath === void 0,
            i = t?.rewrite;
          if (
            ((this.options = { ...t, ...e }),
            (this.isServer =
              this.options.isServer ?? !1 ?? typeof document > `u`),
            (this.protocolAllowlist = new Set(this.options.protocolAllowlist)),
            this.options.pathParamsAllowedCharacters &&
              (this.pathParamsDecoder = Me(
                this.options.pathParamsAllowedCharacters,
              )),
            (!this.history ||
              (this.options.history &&
                this.options.history !== this.history)) &&
              (this.history = this.options.history
                ? this.options.history
                : ht()),
            (this.origin = this.options.origin),
            (this.origin ||=
              window?.origin && window.origin !== `null`
                ? window.origin
                : `http://localhost`),
            this.history && this.updateLatestLocation(),
            this.options.routeTree !== this.routeTree)
          ) {
            this.routeTree = this.options.routeTree;
            let e;
            ((this.resolvePathCache = se(1e3)),
              (e = this.buildRouteTree()),
              this.setRoutes(e));
          }
          if (!this.stores && this.latestLocation) {
            let e = this.getStoreConfig(this);
            ((this.batch = e.batch),
              (this.stores = ut(this.latestLocation, e)),
              Ye(this));
          }
          let a = this.options.basepath ?? `/`,
            o = this.options.rewrite;
          if (r || n !== a || i !== o) {
            this.basepath = a;
            let e = [],
              t = Oe(a);
            (t && t !== `/` && e.push(st({ basepath: a })),
              o && e.push(o),
              (this.rewrite =
                e.length === 0 ? void 0 : e.length === 1 ? e[0] : ot(e)),
              this.history && this.updateLatestLocation(),
              this.stores && this.stores.location.set(this.latestLocation));
          }
        }),
        (this.updateLatestLocation = () => {
          this.latestLocation = this.parseLocation(
            this.history.location,
            this.latestLocation,
          );
        }),
        (this.buildRouteTree = () => {
          let e = ye(this.routeTree, this.options.caseSensitive, (e, t) => {
            e.init({ originalIndex: t });
          });
          return (
            this.options.routeMasks &&
              me(this.options.routeMasks, e.processedTree),
            e
          );
        }),
        (this.subscribe = (e, t) => {
          let n = { eventType: e, fn: t };
          return (
            this.subscribers.add(n),
            () => {
              this.subscribers.delete(n);
            }
          );
        }),
        (this.emit = (e) => {
          for (let t of this.subscribers)
            if (t.eventType === e.type)
              try {
                t.fn(e);
              } catch (e) {
                console.error(e);
              }
        }),
        (this.parseLocation = (e, t) => {
          let n = ({ pathname: e, search: n, hash: r, href: i, state: a }) => {
              if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(e)) {
                let i = this.options.parseSearch(n),
                  o = this.options.stringifySearch(i);
                return {
                  href: e + o + r,
                  publicHref: e + o + r,
                  pathname: re(e).path,
                  external: !1,
                  searchStr: o,
                  search: v(t?.search, i),
                  hash: re(r.slice(1)).path,
                  state: y(t?.state, a),
                };
              }
              let o = new URL(i, this.origin),
                s = ct(this.rewrite, o),
                c = this.options.parseSearch(s.search),
                l = this.options.stringifySearch(c);
              return (
                (s.search = l),
                {
                  href: s.href.replace(s.origin, ``),
                  publicHref: i,
                  pathname: re(s.pathname).path,
                  external: !!this.rewrite && s.origin !== this.origin,
                  searchStr: l,
                  search: v(t?.search, c),
                  hash: re(s.hash.slice(1)).path,
                  state: y(t?.state, a),
                }
              );
            },
            r = n(e),
            { __tempLocation: i, __tempKey: a } = r.state;
          if (i && (!a || a === this.tempLocationKey)) {
            let e = n(i);
            return (
              (e.state.key = r.state.key),
              (e.state.__TSR_key = r.state.__TSR_key),
              delete e.state.__tempLocation,
              { ...e, maskedLocation: r }
            );
          }
          return r;
        }),
        (this.resolvePathWithBase = (e, t) =>
          je({
            base: e,
            to: t.includes(`//`) ? N(t) : t,
            trailingSlash: this.options.trailingSlash,
            cache: this.resolvePathCache,
          })),
        (this.matchRoutes = (e, t, n) =>
          typeof e == `string`
            ? this.matchRoutesInternal({ pathname: e, search: t }, n)
            : this.matchRoutesInternal(e, t)),
        (this.getMatchedRoutes = (e) => {
          let t = Object.create(null),
            n = _e(P(e), this.processedTree, !0);
          return (
            n && Object.assign(t, n.rawParams),
            [n?.branch || [this.routesById.__root__], t, n?.route]
          );
        }),
        (this.buildLocation = (e) => {
          let t = (t = {}) => {
              let n =
                  t._fromLocation ||
                  this._pendingLocation ||
                  this.latestLocation,
                r = this.matchRoutesLightweight(n);
              t.from;
              let i =
                  t.unsafeRelative === `path` ? n.pathname : (t.from ?? r[1]),
                a = t.to ? `${t.to}` : void 0,
                o = r[2],
                s = Object.assign(Object.create(null), r[3]),
                c =
                  a?.charCodeAt(0) === 47
                    ? `/`
                    : this.resolvePathWithBase(i, `.`),
                l = a ? this.resolvePathWithBase(c, a) : c,
                u = kt(t.params, s),
                d = this.routesByPath[P(l)],
                f;
              if (d) f = this.getRouteBranch(d);
              else if (l.includes(`$`)) f = [];
              else {
                let [e, t, n] = this.getMatchedRoutes(l);
                ((f = e),
                  this.options.notFoundRoute &&
                    (!n || (n.path !== `/` && t[`**`])) &&
                    (f = [...f, this.options.notFoundRoute]));
              }
              if (f.length && g(u))
                for (let e of f) {
                  let t =
                    e.options.params?.stringify ?? e.options.stringifyParams;
                  if (t)
                    try {
                      Object.assign(u, t(u));
                    } catch {}
                }
              let m = e.leaveParams
                  ? l
                  : re(
                      Pe({
                        path: l,
                        params: u,
                        decoder: this.pathParamsDecoder,
                        server: this.isServer,
                      }).interpolatedPath,
                    ).path,
                h = o;
              if (e._includeValidateSearch && this.options.search?.strict) {
                let e = {};
                (f.forEach((t) => {
                  if (t.options.validateSearch)
                    try {
                      Object.assign(
                        e,
                        Et(t.options.validateSearch, { ...e, ...h }),
                      );
                    } catch {}
                }),
                  (h = e));
              }
              ((h = Dt(h, t, f, e._includeValidateSearch)), (h = v(o, h)));
              let _ = this.options.stringifySearch(h),
                b =
                  t.hash === !0 ? n.hash : t.hash ? p(t.hash, n.hash) : void 0,
                x = b ? `#${b}` : ``,
                S =
                  t.state === !0 ? n.state : t.state ? p(t.state, n.state) : {};
              S = y(n.state, S);
              let C = `${m}${_}${x}`,
                w,
                T,
                E = !1;
              if (this.rewrite) {
                let e = new URL(C, this.origin),
                  t = lt(this.rewrite, e);
                ((w = e.href.replace(e.origin, ``)),
                  t.origin === this.origin
                    ? (T = t.pathname + t.search + t.hash)
                    : ((T = t.href), (E = !0)));
              } else ((w = ie(C)), (T = w));
              return {
                publicHref: T,
                href: w,
                pathname: m,
                search: h,
                searchStr: _,
                state: S,
                hash: b ?? ``,
                external: E,
                unmaskOnReload: t.unmaskOnReload,
              };
            },
            n = (n = {}, r) => {
              let i = t(n),
                a = r ? t(r) : void 0;
              if (!a) {
                let n = Object.create(null);
                if (this.options.routeMasks) {
                  let o = he(i.pathname, this.processedTree);
                  if (o) {
                    Object.assign(n, o.rawParams);
                    let { from: i, params: s, ...c } = o.route,
                      l = kt(s, n);
                    ((r = { from: e.from, ...c, params: l }), (a = t(r)));
                  }
                }
              }
              return (a && (i.maskedLocation = a), i);
            };
          return e.mask ? n(e, { from: e.from, ...e.mask }) : n(e);
        }),
        (this.commitLocation = async ({
          viewTransition: e,
          ignoreBlocker: t,
          ...n
        }) => {
          let r,
            i =
              P(this.latestLocation.href) === P(n.href) &&
              w(xt(n.state), xt(this.latestLocation.state)),
            a = this._commitPromise,
            o,
            s = new Promise((e) => {
              o = e;
            });
          if (
            ((s.resolve = () => {
              (o(), a?.resolve());
            }),
            (this._commitPromise = s),
            i)
          )
            this.load();
          else {
            let { maskedLocation: i, hashScrollIntoView: a, ...o } = n;
            (i &&
              ((o = {
                ...i,
                state: {
                  ...i.state,
                  __tempKey: void 0,
                  __tempLocation: {
                    ...o,
                    search: o.searchStr,
                    state: {
                      ...o.state,
                      __tempKey: void 0,
                      __tempLocation: void 0,
                      __TSR_key: void 0,
                      key: void 0,
                    },
                  },
                },
              }),
              (o.unmaskOnReload ?? this.options.unmaskOnReload ?? !1) &&
                (o.state.__tempKey = this.tempLocationKey)),
              (o.state.__hashScrollIntoViewOptions =
                a ?? this.options.defaultHashScrollIntoView ?? !0),
              (this.shouldViewTransition = e),
              (r = n.replace ? `REPLACE` : `PUSH`),
              this.history[r === `REPLACE` ? `replace` : `push`](
                o.publicHref,
                o.state,
                { ignoreBlocker: t },
              ),
              this.history.subscribers.size ||
                this.load({ action: { type: r } }));
          }
          return (
            (this._scroll.next = n.resetScroll ?? !0), this._commitPromise
          );
        }),
        (this.buildAndCommitLocation = ({
          replace: e,
          resetScroll: t,
          hashScrollIntoView: n,
          viewTransition: r,
          ignoreBlocker: i,
          _redirects: a,
          href: o,
          ...s
        } = {}) => {
          if (o) {
            let t = this.history.location.state.__TSR_index,
              n = _t(o, { __TSR_index: e ? t : t + 1 }),
              r = new URL(n.pathname, this.origin);
            ((s.to = ct(this.rewrite, r).pathname),
              (s.search = this.options.parseSearch(n.search)),
              (s.hash = n.hash.slice(1)));
          }
          let c = this.buildLocation({ ...s, _includeValidateSearch: !0 });
          (a && (c._redirects = a), (this._pendingLocation = c));
          let l = this.commitLocation({
            ...c,
            viewTransition: r,
            replace: e,
            resetScroll: t,
            hashScrollIntoView: n,
            ignoreBlocker: i,
          });
          return (
            queueMicrotask(() => {
              this._pendingLocation === c && (this._pendingLocation = void 0);
            }),
            l
          );
        }),
        (this.navigate = async ({
          to: e,
          reloadDocument: t,
          href: n,
          publicHref: r,
          ...i
        }) => {
          let a = !1;
          if (n)
            try {
              (new URL(`${n}`), (a = !0));
            } catch {}
          if ((a && !t && (t = !0), t)) {
            if (e !== void 0 || !n) {
              let t = this.buildLocation({ to: e, ...i });
              ((n ??= t.publicHref), (r ??= t.publicHref));
            }
            let t = !a && r ? r : n;
            if (D(t, this.protocolAllowlist)) return;
            if (!i.ignoreBlocker) {
              let e = this.history.getBlockers?.() ?? [];
              for (let t of e)
                if (
                  t?.blockerFn &&
                  (await t.blockerFn({
                    currentLocation: this.latestLocation,
                    nextLocation: this.latestLocation,
                    action: `PUSH`,
                  }))
                )
                  return;
            }
            i.replace ? window.location.replace(t) : (window.location.href = t);
            return;
          }
          return this.buildAndCommitLocation({
            ...i,
            href: n,
            to: e,
            _isNavigate: !0,
          });
        }),
        (this.load = async (e) => {
          (this.updateLatestLocation(),
            e?.action &&
              (this._scroll.hash =
                e.action.type === `PUSH` || e.action.type === `REPLACE`),
            await fn(this, e));
        }),
        (this.startViewTransition = (e) => {
          let t =
            this.shouldViewTransition ?? this.options.defaultViewTransition;
          if (
            ((this.shouldViewTransition = void 0),
            t && typeof document.startViewTransition == `function`)
          ) {
            let n;
            if (
              typeof t == `object` &&
              window.CSS?.supports?.(
                `selector(:active-view-transition-type(a))`,
              )
            ) {
              let r = this.latestLocation,
                i = this.stores.resolvedLocation.get(),
                a = typeof t.types == `function` ? t.types(bt(r, i)) : t.types;
              if (a === !1) return e();
              n = { update: e, types: a };
            } else n = e;
            return document.startViewTransition(n).updateCallbackDone;
          }
          return e();
        }),
        (this.invalidate = (e) => {
          let t = this._committed,
            n = e?.filter,
            r = this._preloads,
            i = new Set(
              [
                ...t,
                ...this._cache.values(),
                ...[...(r?.values() ?? [])].flat(),
                ...(this._tx?.[3] ?? []),
              ]
                .filter((e) => !n || n(e))
                .map((e) => e.id),
            ),
            a = [];
          for (let [e, t] of r ?? [])
            t.some((e) => i.has(e.id)) && (r.delete(e), a.push(e));
          let o = (t) => {
            if (i.has(t.id)) {
              let n = this.routesById[t.routeId],
                r = {
                  ...t,
                  invalid: !0,
                  ...((e?.forcePending ||
                    t.status === `error` ||
                    t.status === `notFound`) &&
                  yt(n)
                    ? { status: `pending`, error: void 0 }
                    : void 0),
                };
              return ((t._flight = void 0), r);
            }
            return t;
          };
          this._committed = t.map(o);
          for (let [t, n] of this._cache)
            i.has(t) &&
              ((n.invalid = !0), e?.forcePending && (n.status = `pending`));
          for (let e of i) this._flights?.delete(e);
          for (let e of a) e.abort();
          return (
            (this.shouldViewTransition = !1), this.load({ sync: e?.sync })
          );
        }),
        (this.resolveRedirect = (e) => {
          let t = e.headers.get(`Location`);
          if (!e.options.href || e.options._builtLocation) {
            let t =
              (e.options._builtLocation ?? this.buildLocation(e.options))
                .publicHref || `/`;
            ((e.options.href = t), e.headers.set(`Location`, t));
          } else if (t)
            try {
              let n = new URL(t);
              if (this.origin && n.origin === this.origin) {
                let t = n.pathname + n.search + n.hash;
                ((e.options.href = t), e.headers.set(`Location`, t));
              }
            } catch {}
          if (
            e.options.href &&
            !e.options._builtLocation &&
            D(e.options.href, this.protocolAllowlist)
          )
            throw Error(`Redirect blocked: unsafe protocol`);
          return (
            e.headers.get(`Location`) ||
              e.headers.set(`Location`, e.options.href),
            e
          );
        }),
        (this.clearCache = (e) => {
          let t = this._cache,
            n = this._preloads,
            r = e?.filter,
            i = [],
            a = [];
          for (let [e, n] of t) (!r || r(n)) && (a.push(e), i.push(n));
          let o = [];
          for (let [e, t] of n ?? [])
            (!r || t.some(r)) && (o.push(e), i.push(...t));
          for (let e of a) t.delete(e);
          for (let e of o) n.delete(e);
          for (let e of i) {
            let t = e._flight;
            ((e._flight = void 0),
              t &&
                !--t[2] &&
                (this._flights?.get(e.id) === t && this._flights.delete(e.id),
                o.push(t[1])));
          }
          for (let e of o) e.abort();
        }),
        (this.loadRouteChunk = L),
        (this.preloadRoute = (e) => pn(this, e)),
        (this.matchRoute = (e, t) => {
          let n = {
              ...e,
              to: e.to ? this.resolvePathWithBase(e.from || ``, e.to) : void 0,
              params: e.params || {},
              leaveParams: !0,
            },
            r = this.buildLocation(n),
            i = this.stores.status.get() === `pending`;
          if (t?.pending && !i) return !1;
          let a =
              (t?.pending ?? !i)
                ? this.latestLocation
                : this.stores.resolvedLocation.get() ||
                  this.stores.location.get(),
            o = ge(
              r.pathname,
              t?.caseSensitive ?? !1,
              t?.fuzzy ?? !1,
              a.pathname,
              this.processedTree,
            );
          return !o || (e.params && !w(o.rawParams, e.params, { partial: !0 }))
            ? !1
            : (t?.includeSearch ?? !0)
              ? w(a.search, r.search, { partial: !0 })
                ? o.rawParams
                : !1
              : o.rawParams;
        }),
        (this.getStoreConfig = t),
        this.update({
          defaultPreloadDelay: 50,
          defaultPendingMs: 1e3,
          defaultPendingMinMs: 500,
          context: void 0,
          ...e,
          caseSensitive: e.caseSensitive ?? !1,
          notFoundMode: e.notFoundMode ?? `fuzzy`,
          stringifySearch: e.stringifySearch ?? et,
          parseSearch: e.parseSearch ?? $e,
          protocolAllowlist: e.protocolAllowlist ?? ne,
        }),
        (self.__TSR_ROUTER__ = this));
    }
    isShell() {
      return !!this.options.isShell;
    }
    get state() {
      return this.stores.__store.get();
    }
    setRoutes({ routesById: e, routesByPath: t, processedTree: n }) {
      ((this.routesById = e),
        (this.routesByPath = t),
        (this.processedTree = n));
      let r = this.options.notFoundRoute;
      r &&
        (r.init({ originalIndex: 99999999999 }), (this.routesById[r.id] = r));
    }
    getRouteBranch(e) {
      let t = this.routeBranchCache.get(e);
      return (t || ((t = xe(e)), this.routeBranchCache.set(e, t)), t);
    }
    matchRoutesInternal(e, t) {
      let [n, r, i] = this.getMatchedRoutes(e.pathname),
        a = n,
        o = !1;
      (i ? i.path !== `/` && r[`**`] : P(e.pathname)) &&
        (this.options.notFoundRoute
          ? (a = [...a, this.options.notFoundRoute])
          : (o = !0));
      let s = o ? Ot(this.options.notFoundMode, a) : void 0,
        c = Array(a.length),
        l = this._committed,
        u = (e, t) => {
          let n = l[t];
          return n?.routeId === e.id
            ? n
            : e === this.options.notFoundRoute
              ? l.find((t) => t.routeId === e.id)
              : void 0;
        },
        d;
      for (let n = 0; n < a.length; n++) {
        let i = a[n],
          o = c[n - 1],
          l,
          f,
          p;
        {
          let n = o?.search ?? e.search,
            r = o?._strictSearch ?? void 0;
          try {
            let e = Et(i.options.validateSearch, { ...n }) ?? void 0;
            ((l = { ...n, ...e }), (f = { ...r, ...e }));
          } catch (e) {
            let r = e;
            if (
              (e instanceof wt || (r = new wt(e.message, { cause: e })),
              t?.throwOnError)
            )
              throw r;
            ((l = n), (f = {}), (p = r));
          }
        }
        let m = ``,
          h = ``;
        try {
          ((m = i.options.loaderDeps?.({ search: l }) ?? ``),
            (h = (m && JSON.stringify(m)) || ``));
        } catch (e) {
          if (t?.throwOnError) throw e;
          p ??= e;
        }
        let { interpolatedPath: g, usedParams: _ } = Pe({
            path: i.fullPath,
            params: r,
            decoder: this.pathParamsDecoder,
            server: this.isServer,
          }),
          b = i.id + g + h,
          x = u(i, n),
          S = this._cache.get(b) ?? (x?.id === b ? x : void 0);
        d = S?._strictParams ?? Object.assign(_, d);
        let C;
        if (!S)
          try {
            At(i, d);
          } catch (e) {
            if (
              ((C = F(e) || at(e) ? e : new Tt(e.message, { cause: e })),
              t?.throwOnError)
            )
              throw C;
          }
        let w = x ? `stay` : `enter`,
          T;
        if (S)
          T = {
            ...S,
            cause: w,
            search: v(x ? x.search : S.search, l),
            _strictSearch: f,
            searchError: p,
          };
        else {
          let e = yt(i) ? `pending` : `success`;
          T = {
            id: b,
            ssr: i.options.ssr,
            index: n,
            routeId: i.id,
            params: x?.params ?? d,
            _strictParams: d,
            pathname: g,
            updatedAt: Date.now(),
            search: x ? v(x.search, l) : l,
            _strictSearch: f,
            searchError: p,
            status: e,
            isFetching: !1,
            error: void 0,
            paramsError: C,
            context: {},
            abortController: t?._controller ?? new AbortController(),
            cause: w,
            loaderDeps: x ? y(x.loaderDeps, m) : m,
            invalid: !1,
            preload: !1,
            staticData: i.options.staticData || {},
            fullPath: i.fullPath,
          };
        }
        let E = s === i.id;
        (T._notFound && !E && (T.error = void 0),
          (T._notFound = E),
          (c[n] = T));
      }
      for (let e = 0; e < c.length; e++) {
        let n = c[e];
        ((n.params = n.cause === `stay` ? v(n.params, d) : d),
          t?._controller && (n.context = {}));
      }
      return c;
    }
    matchRoutesLightweight(e) {
      let t = d(this.stores.ids.get()),
        n = t ? this.stores.byRoute.get(t).get() : void 0,
        r = n?.id,
        i = this.lightweightCache.get(e);
      if (i && i[0] === r) return i[1];
      let [a, o] = this.getMatchedRoutes(e.pathname),
        s = d(a),
        c = { ...e.search };
      for (let e of a)
        try {
          Object.assign(c, Et(e.options.validateSearch, c));
        } catch {}
      let l = n && n.routeId === s.id && n.pathname === e.pathname,
        u;
      if (l) u = n.params;
      else {
        let e = Object.assign(Object.create(null), o);
        for (let t of a)
          try {
            At(t, e);
          } catch {}
        u = e;
      }
      let f = [a, s.fullPath, c, u];
      return (this.lightweightCache.set(e, [r, f]), f);
    }
  },
  wt = class extends Error {},
  Tt = class extends Error {};
function Et(e, t) {
  if (e == null) return {};
  if (`~standard` in e) {
    let n = e[`~standard`].validate(t);
    if (n instanceof Promise) throw new wt(`Async validation not supported`);
    if (n.issues)
      throw new wt(JSON.stringify(n.issues, void 0, 2), { cause: n });
    return n.value;
  }
  return `parse` in e ? e.parse(t) : typeof e == `function` ? e(t) : {};
}
function Dt(e, t, n, r) {
  let i = [];
  for (let e of n) {
    let t = e.options;
    `search` in t
      ? t.search?.middlewares && i.push(...t.search.middlewares)
      : (t.preSearchFilters || t.postSearchFilters) &&
        i.push(({ search: e, next: n }) => {
          let r = n(
            t.preSearchFilters
              ? t.preSearchFilters.reduce((e, t) => t(e), e)
              : e,
          );
          return t.postSearchFilters
            ? t.postSearchFilters.reduce((e, t) => t(e), r)
            : r;
        });
    let n = t.validateSearch;
    n &&
      i.push(({ search: e, next: t, meta: i }) => {
        let a = t(e);
        if (r)
          try {
            let e = Et(n, a);
            if (i && e)
              for (let t in e)
                t in a || (i.defaulted ||= new Map()).set(t, e[t]);
            return { ...a, ...e };
          } catch {}
        return a;
      });
  }
  let a = (e, n, r) => {
    if (e >= i.length) {
      if (!t.search) return {};
      if (t.search === !0) return n;
      let e = p(t.search, n);
      return (r && (r.explicit = e), e);
    }
    return i[e]({
      search: n,
      next: (t, n) => {
        if (n) {
          let n = r || {};
          return { search: a(e + 1, t, n), meta: n };
        }
        return a(e + 1, t, r);
      },
      meta: r,
    });
  };
  return a(0, e);
}
function Ot(e, t) {
  if (e !== `root`) {
    let e;
    for (let n = t.length - 1; n >= 0; n--) {
      let r = t[n];
      if (r.options.notFoundComponent) return r.id;
      e ||= r.children && r.id;
    }
    if (e) return e;
  }
  return rt;
}
function kt(e, t) {
  return e === !1 || e === null
    ? Object.create(null)
    : (e ?? !0) === !0
      ? t
      : Object.assign(t, p(e, t));
}
function At(e, t) {
  let n = e.options.params?.parse ?? e.options.parseParams;
  n && Object.assign(t, n(t));
}
function jt(e, t) {
  return e.options[t]?.preload?.();
}
function Mt(e, t) {
  let n = jt(e, `component`),
    r = jt(e, `pendingComponent`),
    i = t && r ? r.then(t) : r;
  return (
    t && !r && t(), n && i ? Promise.all([n, i]).then(() => {}) : (n ?? i)
  );
}
function L(e, t, n) {
  let r = () => (t === !1 ? void 0 : t ? jt(e, t) : Mt(e, n)),
    i = e._lazy;
  if (i) return i === !0 ? r() : i.then(r);
  if (!e.lazyFn) return r();
  let a = e.lazyFn().then(
    (t) => {
      {
        let { id: n, ...r } = t.options;
        (Object.assign(e.options, r), (e._lazy = !0));
      }
    },
    (t) => {
      throw ((e._lazy = void 0), t);
    },
  );
  return ((e._lazy = a), a.then(r));
}
function Nt(e) {
  let t = e.findIndex((e) => e.status !== `success` || e._notFound) + 1;
  return t && t < e.length ? e.slice(0, t) : e;
}
var R = 0,
  z = 1,
  Pt = 2,
  B = 3,
  V = 4;
function Ft(e) {
  return typeof e[0] == `number`;
}
function H(e, t) {
  return t.aborted
    ? Promise.race([Promise.reject(t), e])
    : new Promise((n, r) => {
        let i = () => r(t);
        (t.addEventListener(`abort`, i, { once: !0 }),
          Promise.resolve(e)
            .then(n, r)
            .finally(() => t.removeEventListener(`abort`, i)));
      });
}
function U(e, t) {
  return e.routesById[t.routeId];
}
function It(e, t, n) {
  return at(e)
    ? [B, e]
    : F(e)
      ? ((e.routeId ||= n), [Pt, e])
      : (t &&
          typeof e?.then == `function` &&
          (e = Error(`A Promise was thrown`, { cause: e })),
        t ? [z, e] : [R, e]);
}
function Lt(e, t) {
  let n = It(t, !0, e.id);
  if (n[0] !== z) return n;
  try {
    e.options.onError?.(n[1]);
  } catch (t) {
    n = It(t, !0, e.id);
  }
  return n;
}
function Rt(e, t, n) {
  return n[0].signal.aborted || !n[2]() ? (n[0].abort(), [V]) : Lt(e, t);
}
function zt(e, t) {
  return (n) => e.navigate({ ...n, _fromLocation: t });
}
async function Bt(e, t, n, r, i, a) {
  let [o, s] = t,
    c = n[0].signal,
    l = !!n[4];
  for (let t = n[7] ?? 0; t < r; t++) {
    let r = s[t],
      i = U(e, r);
    r.abortController = n[0];
    let u = s[t - 1]?.context ?? e.options.context ?? {},
      d = {
        params: r.params,
        location: o,
        navigate: zt(e, o),
        buildLocation: e.buildLocation,
        cause: l ? `preload` : r.cause,
        abortController: n[0],
        preload: l,
        matches: s,
        routeId: i.id,
      },
      f = u;
    try {
      let e = r._ctx;
      (!e &&
        i.options.context &&
        (e = r._ctx =
          i.options.context({ ...d, deps: r.loaderDeps, context: u }) || {}),
        (f = { ...u, ...e }),
        (r.context = f));
    } catch (a) {
      return (W(e, r), [t, Rt(i, a, n)]);
    }
    if (c.aborted || !n[2]()) return (n[0].abort(), [t, [V]]);
    let p = r.paramsError ?? r.searchError;
    if (p !== void 0) return (W(e, r), [t, Rt(i, p, n)]);
    let m = i.options.beforeLoad;
    if (!m) continue;
    let h = {
        ...d,
        search: r.search,
        context: f,
        ...e.options.additionalContext,
      },
      g = r.status;
    (g === `success` && t >= a && (r.status = `pending`), n[8]?.());
    try {
      Ut(e, r, `beforeLoad`, n[0]);
      let a = await H(m(h), c);
      if (!n[2]()) return (n[0].abort(), [t, [V]]);
      let o = It(a, !1, i.id);
      if (o[0] !== R) return (W(e, r), [t, o]);
      r.context = { ...f, ...a };
    } catch (a) {
      return (W(e, r), [t, Rt(i, a, n)]);
    } finally {
      (g === `success` && r.status === `pending` && (r.status = `success`),
        Ut(e, r, !1, n[0]));
    }
  }
  i();
}
function Vt(e, t, n) {
  if (!(!n || --n[2])) {
    if (e._flights?.get(t.id) === n) {
      let n = e._tx;
      if (
        n &&
        !n[0].signal.aborted &&
        !n[3].includes(t) &&
        n[3].some((e) => e.id === t.id) &&
        n[3].some((e) => e.isFetching === `beforeLoad`)
      )
        return;
      e._flights.delete(t.id);
    }
    return n[1];
  }
}
function W(e, t) {
  let n = t._flight;
  ((t._flight = void 0), Vt(e, t, n)?.abort());
}
function G(e, t, n, r) {
  let i = [];
  for (let a of t)
    if (!n?.includes(a)) {
      let t = a._flight;
      if (
        ((a._flight = void 0),
        r &&
          t?.[2] === 1 &&
          e._flights?.get(a.id) === t &&
          n?.some((e) => e.id === a.id))
      )
        t[2] = 0;
      else {
        let n = Vt(e, a, t);
        n && i.push(n);
      }
    }
  for (let e of i) e.abort();
}
function Ht(e) {
  for (let t of e) {
    let e = t._flight;
    e && e[2]++;
  }
}
function Ut(e, t, n, r) {
  if (((t.isFetching = n), r && e._tx?.[0] !== r)) return;
  let i = e.stores.byRoute.get(t.routeId),
    a = i?.get();
  a?.id === t.id && i.set({ ...a, isFetching: n });
}
function Wt(e, t, n, r, i, a, o) {
  let s = t[0];
  return {
    params: n.params,
    location: s,
    navigate: zt(e, s),
    cause: o ? `preload` : n.cause,
    abortController: i,
    preload: o,
    deps: n.loaderDeps,
    parentMatchPromise: a,
    context: n.context,
    route: r,
    ...e.options.additionalContext,
  };
}
async function Gt(e, t, n, r, i, a, o, s) {
  let c = s.signal;
  if (c.aborted) return [V];
  if (!i) return [R, void 0];
  let l = n._flight;
  Ut(e, n, `loader`, s);
  try {
    if (!l) {
      let s = new AbortController();
      ((l = [
        Promise.resolve()
          .then(() => i(Wt(e, t, n, r, s, a, o)))
          .then(
            (e) => It(e, !1, r.id),
            (e) => It(e, !0, r.id),
          )
          .then(
            (t) => (
              t[0] !== R &&
                e._flights?.get(n.id) === l &&
                (e._flights.delete(n.id), l[2] || s.abort()),
              t[0] === z && l[2] ? Lt(r, t[1]) : t
            ),
          ),
        s,
        1,
      ]),
        (e._flights ??= new Map()).set(n.id, l));
    }
    return ((n._flight = l), (n.abortController = l[1]), await H(l[0], c));
  } catch (t) {
    if (t !== c) throw t;
    return (W(e, n), [V]);
  } finally {
    Ut(e, n, !1, s);
  }
}
function Kt(e, t, n) {
  t[0] === R
    ? ((e.loaderData = t[1]),
      (e.error = void 0),
      (e.status = `success`),
      (e.invalid = !1),
      (e.updatedAt = Date.now()),
      (e.preload = n))
    : t[0] !== B &&
      ((e.status = `success`), (e.error = void 0), (e.invalid = !0));
}
function qt(e, t, n) {
  let r = e._cache.get(t.id);
  if (
    r !== n ||
    e._committed.some((e) => e.id === t.id && e._flight === t._flight)
  )
    return;
  let i = { ...t, _notFound: void 0, context: {} };
  (i._flight && i._flight[2]++, e._cache.set(t.id, i), r && W(e, r));
}
function Jt(e, t) {
  return t[0] === z || t[0] === Pt
    ? {
        ...e,
        status: t[0] === z ? `error` : `notFound`,
        error: t[1],
        _flight: void 0,
      }
    : e;
}
function Yt(e, t, n, r, i, a, o) {
  let s = t[1][n],
    c = U(e, s),
    l = !!a[4],
    u = l ? e._cache.get(s.id) : void 0,
    d,
    f = !1,
    p;
  try {
    if (
      (s.status === `success` &&
        ((d = c.options.shouldReload),
        typeof d == `function` && (d = d(Wt(e, t, s, c, a[0], i, l))),
        a[2]() || (a[0].abort(), (p = [V]))),
      !p)
    ) {
      if (s.status !== `success`) f = !0;
      else {
        let t =
          a[4] || s.preload
            ? (c.options.preloadStaleTime ??
              e.options.defaultPreloadStaleTime ??
              3e4)
            : (c.options.staleTime ?? e.options.defaultStaleTime ?? 0);
        f = !!(
          s.invalid ||
          d ||
          (d === void 0 &&
            Date.now() - s.updatedAt >= t &&
            (a[6] ||
              s.cause === `enter` ||
              a[3].some((e) => e.routeId === s.routeId && e.id !== s.id)))
        );
      }
    }
  } catch (t) {
    ((s.invalid = !0), W(e, s), (p = Rt(c, t, a)));
  }
  let m = c.options.loader,
    h = typeof m == `function` ? m : m?.handler,
    g = (!l || c.options.preload !== !1) && m ? e._flights?.get(s.id) : void 0;
  g === s._flight || p
    ? (g = void 0)
    : g && !f && !l && d === void 0
      ? (f = !0)
      : f || (g = void 0);
  let _ = !!(
      m &&
      f &&
      s.status === `success` &&
      !l &&
      !a[5] &&
      ((typeof m == `function` ? void 0 : m?.staleReloadMode) ??
        e.options.defaultStaleReloadMode) !== `blocking`
    ),
    v = f && (!l || c.options.preload !== !1),
    y = v && !_ && (s.status !== `success` || !!m),
    b = c.lazyFn && c._lazy !== !0 ? a[8] : void 0;
  if (
    (v && !m && ((s.invalid = !1), (s.updatedAt = Date.now())), g && g[2]++, y)
  ) {
    let t = s._flight;
    ((s._flight = g),
      Vt(e, s, t)?.abort(),
      s.status === `success` && n >= o && (s.status = `pending`),
      a[8]?.());
  }
  v || (s.isFetching = !1);
  let x = (
      p
        ? Promise.resolve(p)
        : y
          ? Gt(e, t, s, c, h, i, l, a[0])
          : Promise.resolve([R, s.loaderData])
    ).then(
      (t) => (
        y &&
          (Kt(s, t, l),
          t[0] === R &&
            (l && m && !a[0].signal.aborted && qt(e, s, u),
            (s.status = `pending`))),
        t
      ),
    ),
    S = H(
      Promise.resolve().then(() => L(c, void 0, b)),
      a[0].signal,
    )
      .then(
        () => void 0,
        (e) => [n, Rt(c, e, a)],
      )
      .then((e) =>
        x.then(
          (t) => (
            y &&
              !e &&
              t[0] === R &&
              s.status === `pending` &&
              a[2]() &&
              ((s.status = `success`), a[8]?.()),
            e
          ),
        ),
      );
  if ((r.push([n, x, S]), !_)) return x.then((e) => Jt(s, e));
  let C = { ...s, status: `pending`, preload: !1, _flight: g };
  ((s.invalid = !1), (s.isFetching = `loader`));
  let w = Gt(e, t, C, c, h, i, !1, a[0]).then(
    (e) => ((s.isFetching = !1), Kt(C, e, !1), e),
  );
  return ((t[2] ??= []).push([n, w, S, C]), w.then((e) => Jt(C, e)));
}
async function Xt(e, t, n, r, i = 0) {
  let a = n?.[1][1],
    o = a?.routeId
      ? t.findIndex((e) => e.routeId === a.routeId)
      : (n?.[0] ?? t.length - 1);
  o < 0 && (o = 0);
  for (let n = o; n >= 0; n--) {
    let i = U(e, t[n]),
      a = L(i, !1);
    if (a)
      try {
        await H(a, r);
      } catch (e) {
        if (e === r) throw e;
      }
    if (i.options.notFoundComponent) return n;
  }
  return a?.routeId ? o : i;
}
function Zt(e, t) {
  t[2] &&=
    (G(
      e,
      t[2].map((e) => e[3]),
    ),
    void 0);
}
async function Qt(e, t, n, r) {
  let i;
  try {
    await Promise.all(
      e.map((e) =>
        e[1].then(async (t) => {
          let a = e[0];
          if (!(r && a >= (await r))) {
            if (t[0] >= B) throw [a, t];
            !i &&
              t[0] !== R &&
              ((i = [a, t]),
              await Promise.all(
                (n ?? []).map((e) => {
                  if (!(e[0] <= a))
                    return e[1].then((t) => {
                      if (t[0] === B) throw [e[0], t];
                    });
                }),
              ));
          }
        }),
      ),
    );
  } catch (e) {
    return e;
  }
  return t ?? i;
}
async function $t(e, t, n, r, i, a, o) {
  let s = t[1],
    c = await a,
    l = !1,
    u = s.findIndex((e) => e._notFound),
    d = (t) => (t[1][0] === Pt ? Xt(e, s, t, r.signal) : t[0]),
    f = u < 0 ? s.length : u;
  if ((c?.[1][0] ?? 0) >= B) f = 0;
  else if (c) {
    f = c[2] ??= await d(c);
    for (let e of n) {
      if (e[0] >= f) break;
      let t = await e[1];
      if (t[0] !== R && t[0] < B && !(`loaderData` in s[e[0]])) {
        ((c = [e[0], t]), (f = c[2] = await d(c)));
        break;
      }
    }
  }
  for (let e of n) {
    if (e[0] >= f) break;
    let t = await e[2];
    if (t) {
      c = t;
      break;
    }
  }
  if ((c?.[1][0] ?? 0) >= B) {
    let n = c[1];
    if (n[0] !== B || n[1].options.reloadDocument || i < 20)
      return (Zt(e, t), n);
    ((l = !0), (c = [0, [z, Error(`Too many redirects`)]]));
  }
  let p = c ? (c[2] ?? (await d(c))) : u;
  if (p >= 0) {
    let i = c?.[1],
      a = i?.[0],
      u = s[p],
      d = i?.[1],
      f = () => {
        i &&
          ((u._notFound = void 0),
          a === z
            ? (u.status = `error`)
            : ((d.routeId = u.routeId),
              u.routeId === e.routeTree.id
                ? ((u.status = `success`), (u._notFound = !0))
                : (u.status = `notFound`)),
          (u.error = d),
          (u.isFetching = !1));
      };
    f();
    let m = U(e, u);
    try {
      await H(
        i
          ? Promise.resolve().then(() =>
              L(m, a === z ? `errorComponent` : `notFoundComponent`),
            )
          : Promise.all([L(m), L(m, `notFoundComponent`)]),
        r.signal,
      );
    } catch (n) {
      if (n === r.signal) return (Zt(e, t), [V]);
    }
    i
      ? l &&
        (r.abort(),
        await Promise.all([
          ...n.map((e) => e[1]),
          ...n.map((e) => e[2]),
          ...(t[2] ?? []).map((e) => e[1]),
        ]),
        Zt(e, t),
        G(e, s),
        f())
      : ((u.status = `success`), o?.());
  }
  return t;
}
async function en(e, t, n, r = 0, i = t[1].length) {
  let a = t[1];
  for (let t = r; t < i; t++) {
    let r = a[t],
      i = U(e, r).options;
    if (i.head || i.scripts)
      try {
        let t = {
            ssr: e.options.ssr,
            matches: a,
            match: r,
            params: r.params,
            loaderData: r.loaderData,
          },
          [o, s] = await H(Promise.all([i.head?.(t), i.scripts?.(t)]), n);
        ((r.meta = o?.meta),
          (r.links = o?.links),
          (r.headScripts = o?.scripts),
          (r.styles = o?.styles),
          (r.scripts = s));
      } catch (e) {
        if (e === n) break;
        console.error(e);
      }
    if (r.status !== `success` || r._notFound) break;
  }
  return t;
}
async function tn(e, t, n, r) {
  let i = [t, n],
    a = e.stores.matches.get(),
    o = n.findIndex((e) => e._notFound);
  if (e.options.notFoundMode !== `root` && o >= 0) {
    let t = await Xt(e, i[1], void 0, r[0].signal, o);
    (t !== o && ((n[o]._notFound = void 0), (n[t]._notFound = !0)), (o = t));
  }
  let s = o < 0 ? n.length : o + 1,
    c = 0;
  for (; c < s && c !== o;) {
    let e = n[c],
      t = r[3][c],
      i = a[c];
    if (
      t?.id !== e.id ||
      t.status !== `success` ||
      t._notFound ||
      e.preload ||
      i?.id !== e.id ||
      i.status !== `success` ||
      i._notFound
    )
      break;
    c++;
  }
  let l = [],
    u = r[7] ?? 0,
    d = u ? Promise.resolve(i[1][u - 1]) : void 0,
    f = () => {
      for (let t = u; t < s && !r[0].signal.aborted; t++)
        d = Yt(e, i, t, l, d, r, c);
    },
    p = await Bt(e, i, r, s, f, c);
  if (
    (p &&
      ((r[5] = !0),
      (s = p[0]),
      p[1][0] === Pt
        ? ((p[2] = await Xt(e, i[1], p, r[0].signal)),
          (s = Math.min(s, p[2] + 1)))
        : p[1][0] >= B && (s = 0),
      f()),
    r[2]() && !r[4])
  ) {
    let t = [];
    for (let [n, r] of e._flights ?? [])
      r[2] || (e._flights.delete(n), t.push(r[1]));
    for (let e of t) e.abort();
  }
  let m;
  try {
    let t = $t(e, i, l, r[0], r[1], Qt(l, p, i[2]), r[8]);
    (i[2]?.length &&
      (i[3] = Qt(
        i[2],
        void 0,
        void 0,
        t.then(
          (e) => (Ft(e) ? 0 : Nt(e[1]).length),
          () => 0,
        ),
      )),
      (m = await t));
  } catch (t) {
    throw (Zt(e, i), t);
  }
  return Ft(m) ? m : en(e, m, r[0].signal, r[7] === m[1].length ? r[7] : 0);
}
function nn(e, t) {
  if (e._tx !== t) return;
  let n = e._pending,
    r = !1,
    i = n?.[0][3][n[1]]?.id;
  n?.[0] !== t &&
    (n && t[3][n[1]]?.id === i
      ? ((n[0] = t), (r = !0))
      : (clearTimeout(n?.[3]), (e._pending = n = void 0)));
  let a = t[3],
    o = e.stores.matches.get(),
    s = -1,
    c,
    l,
    u,
    d = !1;
  for (let t = 0; t < a.length; t++) {
    let n = a[t],
      r = n.status === `success`;
    if (((d = o[t]?.id === n.id && o[t]?.status === `pending`), r && !d))
      continue;
    let i = U(e, n);
    if (
      ((c =
        (r && d) || n.invalid
          ? 0
          : (i.options.pendingMs ?? e.options.defaultPendingMs)),
      (u = i.options.pendingComponent ?? e.options.defaultPendingComponent),
      !u || typeof c != `number` || c === 1 / 0)
    )
      return;
    ((s = t),
      (l = i.options.pendingMinMs ?? e.options.defaultPendingMinMs ?? 0));
    break;
  }
  if (s < 0) return;
  let f = a[s].id;
  if (
    ((!n || n[1] !== s || i !== f) &&
      (clearTimeout(n?.[3]),
      (e._pending = n =
        [
          t,
          s,
          d ? Date.now() + l : t[4] + c,
          void 0,
          d ? Promise.resolve(!0) : void 0,
          u,
        ])),
    n[4] && !r && n[5] === u)
  )
    return;
  if (((n[5] = u), !n[4])) {
    clearTimeout(n[3]);
    let r = n[2] - Date.now();
    if (r > 0) {
      n[3] = setTimeout(() => nn(e, t), r);
      return;
    }
    n[2] = 0;
  }
  let p = a.map((e) => ({ ...e, _flight: void 0 }));
  p[s].status = `pending`;
  let m = e
    .startTransition(() => e.stores.setMatches(p), p)
    .then(
      (t) => (
        t && e._pending === n && n[4] === m && !n[2] && (n[2] = Date.now() + l),
        t
      ),
    );
  n[4] = m;
}
function rn(e, t) {
  let n = e._pending;
  n?.[0] === t && (clearTimeout(n[3]), (e._pending = void 0));
}
function an(e, t) {
  ((e._committed = t), e.stores.setMatches(t));
}
function on(e, t) {
  (G(e, t[1]), Zt(e, t));
}
function sn(e, t, n, r) {
  let i = e._committed,
    a = e._cache;
  for (let e of n) ((e.preload = !1), r && (e._assetEnd = void 0));
  let o = Nt(n).length,
    s = new Map(),
    c = Date.now();
  for (let t of [...i, ...a.values()]) {
    if (
      t.status !== `success` ||
      n.some((e, n) => e.id === t.id && (n < o || e.status === `success`))
    )
      continue;
    let r = U(e, t);
    !r.options.loader ||
      c - t.updatedAt >=
        (t.preload
          ? (r.options.preloadGcTime ?? e.options.defaultPreloadGcTime ?? 3e5)
          : (r.options.gcTime ?? e.options.defaultGcTime ?? 3e5)) ||
      s.set(
        t.id,
        a.get(t.id) === t
          ? t
          : { ...t, _flight: void 0, isFetching: !1, context: {} },
      );
  }
  ((t[3] = []),
    (e._cache = s),
    an(e, n),
    G(e, [...a.values(), ...i], [...n, ...s.values()]),
    St(e, i, n, () => e._tx === t));
}
async function K(e, t) {
  let n = e._tx;
  for (; n && n !== t;) {
    if ((await n[5], e._tx === n)) return;
    n = e._tx;
  }
}
async function cn(e, t, n) {
  await e.navigate({
    ...n.options,
    replace: !0,
    ignoreBlocker: !0,
    _redirects: t[1] + 1,
  });
}
function ln(e, t) {
  (rn(e, t),
    t[0].abort(),
    G(e, t[3]),
    (t[3] = []),
    e._tx === t &&
      (e.batch(() => {
        (e.stores.status.set(`idle`), e.stores.setMatches(e._committed));
      }),
      e._tx === t &&
        (e._commitPromise?.resolve(), (e._commitPromise = void 0))));
}
async function un(e, t, n, r, i) {
  let a = n.map((e) => ({ ...e }));
  Ht(a);
  for (let t of r) (W(e, a[t[0]]), (a[t[0]] = t[3]));
  let o = [t[2], a],
    s;
  try {
    s = await $t(e, o, r, t[0], t[1], i);
  } catch (t) {
    throw (G(e, a), t);
  }
  if (Ft(s)) {
    (G(e, a),
      s[0] === B &&
        e._tx === t &&
        e._committed === n &&
        (await cn(e, t, s[1])));
    return;
  }
  let c = await en(e, s, t[0].signal);
  if (e._tx !== t || e._committed !== n) {
    G(e, c[1]);
    return;
  }
  for (let t of c[1]) {
    let n = e._cache.get(t.id);
    n?._flight && n._flight === t._flight && (e._cache.delete(t.id), W(e, n));
  }
  (an(e, c[1]), G(e, n, c[1]));
}
async function dn(e, t, n, r, i, a) {
  let o = [
      t[0],
      t[1],
      () => e._tx === t && !!t[3].length,
      e._committed,
      void 0,
      i,
      n,
      a,
      r,
    ],
    s = await tn(e, t[2], t[3], o);
  if (Ft(s)) {
    s[0] === B && e._tx === t
      ? (rn(e, t),
        G(e, t[3]),
        (t[3] = []),
        e._tx === t && (await cn(e, t, s[1])))
      : ln(e, t);
    return;
  }
  let c = e._pending;
  if (c?.[0] === t && (clearTimeout(c[3]), c[4])) {
    let n = t[0].signal,
      r = !1;
    try {
      r = await H(c[4], n);
    } catch (e) {
      if (e !== n) throw e;
    }
    if (r && e._pending === c && c[0] === t) {
      let e = c[2] - Date.now();
      if (e > 0) {
        try {
          await H(
            new Promise((t) => {
              c[3] = setTimeout(t, e);
            }),
            n,
          );
        } catch {}
        clearTimeout(c[3]);
      }
    }
  }
  if (e._tx !== t) {
    (rn(e, t), on(e, s));
    return;
  }
  let l = t[2],
    u = bt(l, e.stores.resolvedLocation.get()),
    d = s[2];
  await e.startViewTransition(async () => {
    if (e._tx !== t) {
      on(e, s);
      return;
    }
    let n = await e.startTransition(() => {
      (rn(e, t),
        sn(e, t, s[1], a),
        e._tx === t &&
          (e.emit({ type: `onLoad`, ...u }),
          e._tx === t && e.emit({ type: `onBeforeRouteMount`, ...u })));
    }, s[1]);
    if (e._tx !== t) {
      Zt(e, s);
      return;
    }
    (d?.length && un(e, t, s[1], d, s[3]).catch(console.error),
      e.batch(() => {
        (e.stores.resolvedLocation.set(l),
          e.stores.status.set(`idle`),
          e._tx === t && e.emit({ type: `onResolved`, ...u }),
          n && e._tx === t && e.emit({ type: `onRendered`, ...u }));
      }),
      e._tx === t &&
        (e._commitPromise?.resolve(), (e._commitPromise = void 0)));
  });
}
async function fn(e, t) {
  let n = e._tx,
    r = e.stores.resolvedLocation.get(),
    i = r ?? e.stores.location.get(),
    a = e.latestLocation,
    o = e._pendingLocation,
    s = o?.href === a.href ? (o._redirects ?? 0) : 0,
    c = e._handoff,
    l = c?.[0](),
    u = new AbortController(),
    d = e._preflight;
  if (((e._preflight = u), l || c?.[1](), d?.abort(), u.signal.aborted)) {
    await K(e, n);
    return;
  }
  let f = bt(a, r);
  if (
    (e.emit({ type: `onBeforeNavigate`, ...f }),
    u.signal.aborted || e.emit({ type: `onBeforeLoad`, ...f }),
    u.signal.aborted)
  ) {
    await K(e, n);
    return;
  }
  let p = i.href === a.href,
    m,
    h = u;
  try {
    ((m = e.matchRoutes(a, { _controller: u })), Ht(m));
  } catch (t) {
    if ((u.abort(), !at(t))) {
      (await K(e), e._commitPromise?.resolve(), (e._commitPromise = void 0));
      return;
    }
    (await e.navigate({ ...t.options, replace: !0, ignoreBlocker: !0 }),
      await K(e, n));
    return;
  }
  let g = l ? c[1](m) : void 0;
  if ((g ? (h = l) : l?.abort(), u.signal.aborted)) {
    (G(e, m), await K(e, n));
    return;
  }
  e._preflight = void 0;
  let _ = [
    h,
    s,
    a,
    m,
    Date.now(),
    Promise.resolve()
      .then(() => dn(e, _, p, () => nn(e, _), t?.sync, g))
      .catch(() => {
        e._tx === _ && ln(e, _);
      }),
  ];
  if (((e._tx = _), n)) {
    for (let t of e.stores.matches.get()) {
      if (e._tx !== _) break;
      t.isFetching && Ut(e, t, !1);
    }
    (n[0].abort(), G(e, n[3], _[3], !0));
  }
  if (e._tx !== _) {
    (G(e, _[3]), (_[3] = []), await K(e, _));
    return;
  }
  (e.batch(() => {
    (e.stores.status.set(`pending`), e.stores.location.set(a));
  }),
    !r && !m.some((e) => e._notFound) && nn(e, _));
  try {
    await _[5];
  } finally {
    await K(e, _);
  }
}
async function pn(e, t, n = 0) {
  if (n > 20) return;
  let r = t._builtLocation ?? e.buildLocation(t),
    i = e._committed,
    a = new AbortController(),
    o;
  try {
    ((o = e.matchRoutes(r, { _controller: a })), Ht(o));
  } catch (e) {
    (a.abort(), F(e) || console.error(e));
    return;
  }
  (e._preloads ??= new Map()).set(a, o);
  let s;
  try {
    let t;
    try {
      t = await tn(e, r, o, [a, n, () => !0, i, !0]);
    } finally {
      ((s = e._preloads.delete(a)), G(e, o), a.abort());
    }
    if (!Ft(t)) return t[1];
    if (s && t[0] === B && !t[1].options.reloadDocument)
      return pn(e, { ...t[1].options, _fromLocation: r }, n + 1);
  } catch (e) {
    F(e) || console.error(e);
  }
}
var mn = `Error preloading route! ☝️`,
  hn = class {
    get to() {
      return this._to;
    }
    get id() {
      return this._id;
    }
    get path() {
      return this._path;
    }
    get fullPath() {
      return this._fullPath;
    }
    constructor(e) {
      if (
        ((this.init = (e) => {
          this.originalIndex = e.originalIndex;
          let t = this.options,
            n = !t?.path && !t?.id;
          ((this.parentRoute = this.options.getParentRoute?.()),
            n ? (this._path = rt) : this.parentRoute || oe());
          let r = n ? rt : t?.path;
          r && r !== `/` && (r = De(r));
          let i = t?.id || r,
            a = n
              ? rt
              : M([
                  this.parentRoute.id === `__root__` ? `` : this.parentRoute.id,
                  i,
                ]);
          (r === `__root__` && (r = `/`),
            a !== `__root__` && (a = M([`/`, a])));
          let o = a === `__root__` ? `/` : M([this.parentRoute.fullPath, r]);
          ((this._path = r),
            (this._id = a),
            (this._fullPath = o),
            (this._to = P(o)));
        }),
        (this.addChildren = (e) => this._addFileChildren(e)),
        (this._addFileChildren = (e) => (
          Array.isArray(e) && (this.children = e),
          typeof e == `object` && e && (this.children = Object.values(e)),
          this
        )),
        (this._addFileTypes = () => this),
        (this.updateLoader = (e) => (Object.assign(this.options, e), this)),
        (this.update = (e) => (Object.assign(this.options, e), this)),
        (this.lazy = (e) => ((this.lazyFn = e), this)),
        (this.redirect = (e) => it({ from: this.fullPath, ...e })),
        (this.options = e || {}),
        (this.isRoot = !e?.getParentRoute),
        e?.id && e?.path)
      )
        throw Error(`Route cannot have both an 'id' and a 'path' option.`);
    }
  },
  gn = class extends hn {
    constructor(e) {
      super(e);
    }
  },
  _n = i(),
  q = a();
function vn(e) {
  return (0, q.jsx)(yn, { ...e });
}
var yn = class extends o.Component {
  constructor(...e) {
    (super(...e),
      (this.state = { error: null }),
      (this.reset = () => {
        this.setState({ error: null });
      }));
  }
  static getDerivedStateFromProps(e, t) {
    let n = e.getResetKey();
    return t.error && t.resetKey !== n
      ? { resetKey: n, error: null }
      : { resetKey: n };
  }
  static getDerivedStateFromError(e) {
    return { error: e };
  }
  componentDidCatch(e, t) {
    this.props.onCatch?.(e, t);
  }
  render() {
    let e = this.state.error;
    return e
      ? o.createElement(this.props.errorComponent ?? bn, {
          error: e,
          reset: this.reset,
        })
      : this.props.children;
  }
};
function bn({ error: e }) {
  let [t, n] = o.useState(!1);
  return (0, q.jsxs)(`div`, {
    style: { padding: `.5rem`, maxWidth: `100%` },
    children: [
      (0, q.jsxs)(`div`, {
        style: { display: `flex`, alignItems: `center`, gap: `.5rem` },
        children: [
          (0, q.jsx)(`strong`, {
            style: { fontSize: `1rem` },
            children: `Something went wrong!`,
          }),
          (0, q.jsx)(`button`, {
            style: {
              appearance: `none`,
              fontSize: `.6em`,
              border: `1px solid currentColor`,
              padding: `.1rem .2rem`,
              fontWeight: `bold`,
              borderRadius: `.25rem`,
            },
            onClick: () => n((e) => !e),
            children: t ? `Hide Error` : `Show Error`,
          }),
        ],
      }),
      (0, q.jsx)(`div`, { style: { height: `.25rem` } }),
      t
        ? (0, q.jsx)(`div`, {
            children: (0, q.jsx)(`pre`, {
              style: {
                fontSize: `.7em`,
                border: `1px solid red`,
                borderRadius: `.25rem`,
                padding: `.3rem`,
                color: `red`,
                overflow: `auto`,
              },
              children: e.message
                ? (0, q.jsx)(`code`, { children: e.message })
                : null,
            }),
          })
        : null,
    ],
  });
}
function xn({ children: e, fallback: t = null }) {
  return (0, q.jsx)(o.Fragment, { children: Sn() ? e : t });
}
function Sn() {
  return o.useSyncExternalStore(
    Cn,
    () => !0,
    () => !1,
  );
}
function Cn() {
  return () => {};
}
var wn = o.createContext(null);
function J(e) {
  return o.useContext(wn);
}
var Tn = o.createContext(void 0),
  En = o.createContext(void 0),
  Y = ((e) => (
    (e[(e.None = 0)] = `None`),
    (e[(e.Mutable = 1)] = `Mutable`),
    (e[(e.Watching = 2)] = `Watching`),
    (e[(e.RecursedCheck = 4)] = `RecursedCheck`),
    (e[(e.Recursed = 8)] = `Recursed`),
    (e[(e.Dirty = 16)] = `Dirty`),
    (e[(e.Pending = 32)] = `Pending`),
    e
  ))(Y || {});
function Dn({ update: e, notify: t, unwatched: n }) {
  return {
    link: r,
    unlink: i,
    propagate: a,
    checkDirty: o,
    shallowPropagate: s,
  };
  function r(e, t, n) {
    let r = t.depsTail;
    if (r !== void 0 && r.dep === e) return;
    let i = r === void 0 ? t.deps : r.nextDep;
    if (i !== void 0 && i.dep === e) {
      ((i.version = n), (t.depsTail = i));
      return;
    }
    let a = e.subsTail;
    if (a !== void 0 && a.version === n && a.sub === t) return;
    let o =
      (t.depsTail =
      e.subsTail =
        {
          version: n,
          dep: e,
          sub: t,
          prevDep: r,
          nextDep: i,
          prevSub: a,
          nextSub: void 0,
        });
    (i !== void 0 && (i.prevDep = o),
      r === void 0 ? (t.deps = o) : (r.nextDep = o),
      a === void 0 ? (e.subs = o) : (a.nextSub = o));
  }
  function i(e, t = e.sub) {
    let r = e.dep,
      i = e.prevDep,
      a = e.nextDep,
      o = e.nextSub,
      s = e.prevSub;
    return (
      a === void 0 ? (t.depsTail = i) : (a.prevDep = i),
      i === void 0 ? (t.deps = a) : (i.nextDep = a),
      o === void 0 ? (r.subsTail = s) : (o.prevSub = s),
      s === void 0 ? (r.subs = o) === void 0 && n(r) : (s.nextSub = o),
      a
    );
  }
  function a(e) {
    let n = e.nextSub,
      r;
    top: do {
      let i = e.sub,
        a = i.flags;
      if (
        (a & 60
          ? a & 12
            ? a & 4
              ? !(a & 48) && c(e, i)
                ? ((i.flags = a | 40), (a &= 1))
                : (a = 0)
              : (i.flags = (a & -9) | 32)
            : (a = 0)
          : (i.flags = a | 32),
        a & 2 && t(i),
        a & 1)
      ) {
        let t = i.subs;
        if (t !== void 0) {
          let i = (e = t).nextSub;
          i !== void 0 && ((r = { value: n, prev: r }), (n = i));
          continue;
        }
      }
      if ((e = n) !== void 0) {
        n = e.nextSub;
        continue;
      }
      for (; r !== void 0;)
        if (((e = r.value), (r = r.prev), e !== void 0)) {
          n = e.nextSub;
          continue top;
        }
      break;
    } while (!0);
  }
  function o(t, n) {
    let r,
      i = 0,
      a = !1;
    top: do {
      let o = t.dep,
        c = o.flags;
      if (n.flags & 16) a = !0;
      else if ((c & 17) == 17) {
        if (e(o)) {
          let e = o.subs;
          (e.nextSub !== void 0 && s(e), (a = !0));
        }
      } else if ((c & 33) == 33) {
        ((t.nextSub !== void 0 || t.prevSub !== void 0) &&
          (r = { value: t, prev: r }),
          (t = o.deps),
          (n = o),
          ++i);
        continue;
      }
      if (!a) {
        let e = t.nextDep;
        if (e !== void 0) {
          t = e;
          continue;
        }
      }
      for (; i--;) {
        let i = n.subs,
          o = i.nextSub !== void 0;
        if ((o ? ((t = r.value), (r = r.prev)) : (t = i), a)) {
          if (e(n)) {
            (o && s(i), (n = t.sub));
            continue;
          }
          a = !1;
        } else n.flags &= -33;
        n = t.sub;
        let c = t.nextDep;
        if (c !== void 0) {
          t = c;
          continue top;
        }
      }
      return a;
    } while (!0);
  }
  function s(e) {
    do {
      let n = e.sub,
        r = n.flags;
      (r & 48) == 32 && ((n.flags = r | 16), (r & 6) == 2 && t(n));
    } while ((e = e.nextSub) !== void 0);
  }
  function c(e, t) {
    let n = t.depsTail;
    for (; n !== void 0;) {
      if (n === e) return !0;
      n = n.prevDep;
    }
    return !1;
  }
}
function On(e, t, n) {
  let r = typeof e == `object`,
    i = r ? e : void 0;
  return {
    next: (r ? e.next : e)?.bind(i),
    error: (r ? e.error : t)?.bind(i),
    complete: (r ? e.complete : n)?.bind(i),
  };
}
var kn = [],
  An = 0,
  {
    link: jn,
    unlink: Mn,
    propagate: Nn,
    checkDirty: Pn,
    shallowPropagate: Fn,
  } = Dn({
    update(e) {
      return e._update();
    },
    notify(e) {
      ((kn[Ln++] = e), (e.flags &= ~Y.Watching));
    },
    unwatched(e) {
      e.depsTail !== void 0 &&
        ((e.depsTail = void 0), (e.flags = Y.Mutable | Y.Dirty), Bn(e));
    },
  }),
  In = 0,
  Ln = 0,
  X,
  Rn = 0;
function zn(e) {
  try {
    (++Rn, e());
  } finally {
    --Rn || Vn();
  }
}
function Bn(e) {
  let t = e.depsTail,
    n = t === void 0 ? e.deps : t.nextDep;
  for (; n !== void 0;) n = Mn(n, e);
}
function Vn() {
  if (!(Rn > 0)) {
    for (; In < Ln;) {
      let e = kn[In];
      ((kn[In++] = void 0), e.notify());
    }
    ((In = 0), (Ln = 0));
  }
}
function Hn(e, t) {
  let n = typeof e == `function`,
    r = e,
    i = {
      _snapshot: n ? void 0 : e,
      subs: void 0,
      subsTail: void 0,
      deps: void 0,
      depsTail: void 0,
      flags: n ? Y.None : Y.Mutable,
      get() {
        return (X !== void 0 && jn(i, X, An), i._snapshot);
      },
      subscribe(e) {
        let t = On(e),
          n = { current: !1 },
          r = Un(() => {
            (i.get(), n.current ? t.next?.(i._snapshot) : (n.current = !0));
          });
        return {
          unsubscribe: () => {
            r.stop();
          },
        };
      },
      _update(e) {
        let a = X,
          o = t?.compare ?? Object.is;
        if (n) ((X = i), ++An, (i.depsTail = void 0));
        else if (e === void 0) return !1;
        n && (i.flags = Y.Mutable | Y.RecursedCheck);
        try {
          let t = i._snapshot,
            a = typeof e == `function` ? e(t) : e === void 0 && n ? r(t) : e;
          return t === void 0 || !o(t, a) ? ((i._snapshot = a), !0) : !1;
        } finally {
          ((X = a), n && (i.flags &= ~Y.RecursedCheck), Bn(i));
        }
      },
    };
  return (
    n
      ? ((i.flags = Y.Mutable | Y.Dirty),
        (i.get = function () {
          let e = i.flags;
          if (e & Y.Dirty || (e & Y.Pending && Pn(i.deps, i))) {
            if (i._update()) {
              let e = i.subs;
              e !== void 0 && Fn(e);
            }
          } else e & Y.Pending && (i.flags = e & ~Y.Pending);
          return (X !== void 0 && jn(i, X, An), i._snapshot);
        }))
      : (i.set = function (e) {
          if (i._update(e)) {
            let e = i.subs;
            e !== void 0 && (Nn(e), Fn(e), Vn());
          }
        }),
    i
  );
}
function Un(e) {
  let t = () => {
      let t = X;
      ((X = n),
        ++An,
        (n.depsTail = void 0),
        (n.flags = Y.Watching | Y.RecursedCheck));
      try {
        return e();
      } finally {
        ((X = t), (n.flags &= ~Y.RecursedCheck), Bn(n));
      }
    },
    n = {
      deps: void 0,
      depsTail: void 0,
      subs: void 0,
      subsTail: void 0,
      flags: Y.Watching | Y.RecursedCheck,
      notify() {
        let e = this.flags;
        e & Y.Dirty || (e & Y.Pending && Pn(this.deps, this))
          ? t()
          : (this.flags = Y.Watching);
      },
      stop() {
        ((this.flags = Y.None), (this.depsTail = void 0), Bn(this));
      },
    };
  return (t(), n);
}
var Wn = t((e) => {
    var t = r(),
      i = n();
    function a(e, t) {
      return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    var o = typeof Object.is == `function` ? Object.is : a,
      s = i.useSyncExternalStore,
      c = t.useRef,
      l = t.useEffect,
      u = t.useMemo,
      d = t.useDebugValue;
    e.useSyncExternalStoreWithSelector = function (e, t, n, r, i) {
      var a = c(null);
      if (a.current === null) {
        var f = { hasValue: !1, value: null };
        a.current = f;
      } else f = a.current;
      a = u(
        function () {
          function e(e) {
            if (!a) {
              if (((a = !0), (s = e), (e = r(e)), i !== void 0 && f.hasValue)) {
                var t = f.value;
                if (i(t, e)) return (c = t);
              }
              return (c = e);
            }
            if (((t = c), o(s, e))) return t;
            var n = r(e);
            return i !== void 0 && i(t, n) ? ((s = e), t) : ((s = e), (c = n));
          }
          var a = !1,
            s,
            c,
            l = n === void 0 ? null : n;
          return [
            function () {
              return e(t());
            },
            l === null
              ? void 0
              : function () {
                  return e(l());
                },
          ];
        },
        [t, n, r, i],
      );
      var p = s(e, a[0], a[1]);
      return (
        l(
          function () {
            ((f.hasValue = !0), (f.value = p));
          },
          [p],
        ),
        d(p),
        p
      );
    };
  }),
  Gn = t((e, t) => {
    t.exports = Wn();
  })();
function Kn(e, t) {
  return e === t;
}
function Z(e, t, n = Kn) {
  let r = (0, o.useCallback)(
      (t) => {
        if (!e) return () => {};
        let { unsubscribe: n } = e.subscribe(t);
        return n;
      },
      [e],
    ),
    i = (0, o.useCallback)(() => e?.get(), [e]);
  return (0, Gn.useSyncExternalStoreWithSelector)(r, i, i, t, n);
}
var qn = {};
function Jn(e, t) {
  let n = o.useRef();
  return (r) => {
    let i = e?.select ? e.select(r) : r;
    return (e?.structuralSharing ?? t.options.defaultStructuralSharing)
      ? (n.current = y(n.current, i))
      : i;
  };
}
function Q(e) {
  let t = J(),
    n = o.useContext(e.from ? En : Tn),
    r = e.from ?? n,
    i = t.stores.getMatchStore(r),
    a = Jn(e, t),
    s = Z(i, (e) => (e ? a(e) : qn));
  if (s !== qn) return s;
  (e.shouldThrow ?? !0) && oe();
}
function Yn(e) {
  return Q({
    from: e.from,
    strict: e.strict,
    structuralSharing: e.structuralSharing,
    select: (t) => (e.select ? e.select(t.loaderData) : t.loaderData),
  });
}
function Xn(e) {
  let { select: t, ...n } = e;
  return Q({ ...n, select: (e) => (t ? t(e.loaderDeps) : e.loaderDeps) });
}
function Zn(e) {
  return Q({
    from: e.from,
    shouldThrow: e.shouldThrow,
    structuralSharing: e.structuralSharing,
    strict: e.strict,
    select: (t) => {
      let n = e.strict === !1 ? t.params : t._strictParams;
      return e.select ? e.select(n) : n;
    },
  });
}
function Qn(e) {
  return Q({
    from: e.from,
    strict: e.strict,
    shouldThrow: e.shouldThrow,
    structuralSharing: e.structuralSharing,
    select: (t) => (e.select ? e.select(t.search) : t.search),
  });
}
function $n(e) {
  let t = J();
  return o.useCallback(
    (n) => t.navigate({ ...n, from: n.from ?? e?.from }),
    [e?.from, t],
  );
}
function er(e) {
  return Q({
    ...e,
    select: (t) => (e.select ? e.select(t.context) : t.context),
  });
}
function tr(e) {
  let t = o.useRef(e);
  return (
    w(t.current, e, { ignoreUndefined: !1 }) || (t.current = e), t.current
  );
}
function nr(e, t) {
  return e[0] === t[0] && e[1] === t[1] && e[2] === t[2];
}
function rr(e, t, n) {
  if (e?.external) return D(e.href, n) ? void 0 : e.href;
  if (!hr(t) && typeof t == `string` && t.indexOf(`:`) !== -1)
    try {
      return (new URL(t), D(t, n) ? void 0 : t);
    } catch {}
}
function ir(e, t, n, r, i, a) {
  if (a) return !1;
  if (n?.exact) {
    if (!Ae(e.pathname, t.pathname, r)) return !1;
  } else {
    let n = ke(e.pathname, r),
      i = ke(t.pathname, r);
    if (!(n.startsWith(i) && (n.length === i.length || n[i.length] === `/`)))
      return !1;
  }
  return (n?.includeSearch ?? !0) &&
    !w(e.search, t.search, {
      partial: !n?.exact,
      ignoreUndefined: !n?.explicitUndefined,
    })
    ? !1
    : !n?.includeHash || (i && e.hash === t.hash);
}
function ar(e, t) {
  let n = J(),
    r = u(t),
    {
      activeProps: i,
      inactiveProps: a,
      activeOptions: s,
      to: c,
      preload: d,
      preloadDelay: f,
      preloadIntentProximity: m,
      hashScrollIntoView: h,
      replace: g,
      startTransition: _,
      resetScroll: v,
      viewTransition: y,
      children: b,
      target: x,
      disabled: S,
      style: C,
      className: w,
      onClick: T,
      onBlur: E,
      onFocus: ee,
      onMouseEnter: te,
      onMouseLeave: ne,
      onTouchStart: D,
      ignoreBlocker: re,
      params: ie,
      search: ae,
      hash: oe,
      state: se,
      mask: O,
      reloadDocument: ce,
      unsafeRelative: le,
      from: ue,
      _fromLocation: de,
      ...fe
    } = e,
    k = Sn(),
    pe = tr(e.search),
    me = tr(e.params),
    he = tr(s),
    ge = o.useMemo(
      () => e,
      [
        n,
        e.from,
        e._fromLocation,
        e.hash,
        e.to,
        pe,
        me,
        e.state,
        e.mask,
        e.unsafeRelative,
      ],
    ),
    _e = o.useCallback(
      (e) => {
        let t = n.buildLocation({ _fromLocation: e, ...ge }),
          r = mr(
            t.maskedLocation ? t.maskedLocation.publicHref : t.publicHref,
            t.maskedLocation ? t.maskedLocation.external : t.external,
            n.history,
            S,
          ),
          i = rr(r, c, n.protocolAllowlist);
        return [r?.href, i, ir(e, t, he, n.basepath, k, i !== void 0)];
      },
      [he, S, k, ge, n, c],
    ),
    [ve, ye, be] = Z(n.stores.location, _e, nr),
    A = be ? (p(i, {}) ?? sr) : or,
    xe = be ? or : (p(a, {}) ?? or),
    Se = [w, A.className, xe.className].filter(Boolean).join(` `),
    Ce = (C || A.style || xe.style) && { ...C, ...A.style, ...xe.style },
    [we, Te] = o.useState(!1),
    Ee = o.useRef(!1),
    j = e.reloadDocument || ye ? !1 : (d ?? n.options.defaultPreload),
    M = f ?? n.options.defaultPreloadDelay ?? 0,
    N = o.useCallback(() => {
      n.preloadRoute(ge).catch((e) => {
        (console.warn(e), console.warn(mn));
      });
    }, [n, ge]);
  (l(
    r,
    o.useCallback(
      (e) => {
        e?.isIntersecting && N();
      },
      [N],
    ),
    fr,
    !!S || j !== `viewport`,
  ),
    o.useEffect(() => {
      Ee.current || (!S && j === `render` && (N(), (Ee.current = !0)));
    }, [S, N, j]));
  let De = (e) => {
    let t = e.currentTarget.getAttribute(`target`),
      r = x === void 0 ? t : x;
    if (
      !S &&
      !_r(e) &&
      !e.defaultPrevented &&
      (!r || r === `_self`) &&
      e.button === 0
    ) {
      (e.preventDefault(),
        (0, _n.flushSync)(() => {
          Te(!0);
        }));
      let t = n.subscribe(`onResolved`, () => {
        (t(), Te(!1));
      });
      n.navigate({
        ...ge,
        replace: g,
        resetScroll: v,
        hashScrollIntoView: h,
        startTransition: _,
        viewTransition: y,
        ignoreBlocker: re,
      });
    }
  };
  if (ye)
    return {
      ...fe,
      ref: r,
      href: ye,
      ...(b && { children: b }),
      ...(x && { target: x }),
      ...(S && { disabled: S }),
      ...(C && { style: C }),
      ...(w && { className: w }),
      ...(T && { onClick: T }),
      ...(E && { onBlur: E }),
      ...(ee && { onFocus: ee }),
      ...(te && { onMouseEnter: te }),
      ...(ne && { onMouseLeave: ne }),
      ...(D && { onTouchStart: D }),
    };
  let P = (e) => {
      if (S || j !== `intent`) return;
      if (!M) {
        N();
        return;
      }
      let t = e.currentTarget;
      if (dr.has(t)) return;
      let n = setTimeout(() => {
        (dr.delete(t), N());
      }, M);
      dr.set(t, n);
    },
    Oe = (e) => {
      S || j !== `intent` || N();
    },
    ke = (e) => {
      if (S || !j || !M) return;
      let t = e.currentTarget,
        n = dr.get(t);
      n && (clearTimeout(n), dr.delete(t));
    };
  return {
    ...fe,
    ...A,
    ...xe,
    href: ve,
    ref: r,
    onClick: pr([T, De]),
    onBlur: pr([E, ke]),
    onFocus: pr([ee, P]),
    onMouseEnter: pr([te, P]),
    onMouseLeave: pr([ne, ke]),
    onTouchStart: pr([D, Oe]),
    disabled: !!S,
    target: x,
    ...(Ce && { style: Ce }),
    ...(Se && { className: Se }),
    ...(S && cr),
    ...(be && lr),
    ...(k && we && ur),
  };
}
var or = {},
  sr = { className: `active` },
  cr = { role: `link`, "aria-disabled": !0 },
  lr = { "data-status": `active`, "aria-current": `page` },
  ur = { "data-transitioning": `transitioning` },
  dr = new WeakMap(),
  fr = { rootMargin: `100px` },
  pr = (e) => (t) => {
    for (let n of e)
      if (n) {
        if (t.defaultPrevented) return;
        n(t);
      }
  };
function mr(e, t, n, r) {
  if (!r)
    return t
      ? { href: e, external: !0 }
      : { href: n.createHref(e) || `/`, external: !1 };
}
function hr(e) {
  if (typeof e != `string`) return !1;
  let t = e.charCodeAt(0);
  return t === 47 ? e.charCodeAt(1) !== 47 : t === 46;
}
var gr = o.forwardRef((e, t) => {
  let { _asChild: n, ...r } = e,
    { type: i, ...a } = ar(r, t),
    s =
      typeof r.children == `function`
        ? r.children({ isActive: a[`data-status`] === `active` })
        : r.children;
  if (!n) {
    let { disabled: e, ...t } = a;
    return o.createElement(`a`, t, s);
  }
  return o.createElement(n, a, s);
});
function _r(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
var vr = class extends hn {
  constructor(e) {
    (super(e),
      (this.useMatch = (e) =>
        Q({
          select: e?.select,
          from: this.id,
          structuralSharing: e?.structuralSharing,
        })),
      (this.useRouteContext = (e) => er({ ...e, from: this.id })),
      (this.useSearch = (e) =>
        Qn({
          select: e?.select,
          structuralSharing: e?.structuralSharing,
          from: this.id,
        })),
      (this.useParams = (e) =>
        Zn({
          select: e?.select,
          structuralSharing: e?.structuralSharing,
          from: this.id,
        })),
      (this.useLoaderDeps = (e) => Xn({ ...e, from: this.id })),
      (this.useLoaderData = (e) => Yn({ ...e, from: this.id })),
      (this.useNavigate = () => $n({ from: this.fullPath })),
      (this.Link = o.forwardRef((e, t) =>
        (0, q.jsx)(gr, { ref: t, from: this.fullPath, ...e }),
      )));
  }
};
function yr(e) {
  return new vr(e);
}
var br = class extends gn {
  constructor(e) {
    (super(e),
      (this.useMatch = (e) =>
        Q({
          select: e?.select,
          from: this.id,
          structuralSharing: e?.structuralSharing,
        })),
      (this.useRouteContext = (e) => er({ ...e, from: this.id })),
      (this.useSearch = (e) =>
        Qn({
          select: e?.select,
          structuralSharing: e?.structuralSharing,
          from: this.id,
        })),
      (this.useParams = (e) =>
        Zn({
          select: e?.select,
          structuralSharing: e?.structuralSharing,
          from: this.id,
        })),
      (this.useLoaderDeps = (e) => Xn({ ...e, from: this.id })),
      (this.useLoaderData = (e) => Yn({ ...e, from: this.id })),
      (this.useNavigate = () => $n({ from: this.fullPath })),
      (this.Link = o.forwardRef((e, t) =>
        (0, q.jsx)(gr, { ref: t, from: this.fullPath, ...e }),
      )));
  }
};
function xr(e) {
  return new br(e);
}
function Sr(e) {
  return (e) => {
    let t = yr(e);
    return ((t.isRoot = !1), t);
  };
}
function Cr(e, t) {
  let n,
    r,
    i,
    a = () => (
      (n ||=
        ((i = void 0),
        e()
          .then((e) => {
            ((n = void 0), (r = e[t ?? `default`]));
          })
          .catch((e) => {
            ((n = void 0), (i = e));
          }))),
      n
    ),
    c = function (e) {
      if (i) {
        if (T(i) && typeof sessionStorage < `u`) {
          let e = `tanstack_router_reload:${i.message}`;
          if (!sessionStorage.getItem(e))
            throw (
              sessionStorage.setItem(e, `1`),
              window.location.reload(),
              new Promise(() => {})
            );
        }
        throw i;
      }
      if (!r) {
        if (s) s(a());
        else throw a();
      }
      return o.createElement(r, e);
    };
  return ((c.preload = a), c);
}
function wr(e) {
  let t = J(),
    n = `not-found-${Z(t.stores.location, (e) => e.pathname)}-${Z(t.stores.status, (e) => e)}`;
  return (0, q.jsx)(vn, {
    getResetKey: () => n,
    onCatch: (t, n) => {
      if (F(t)) e.onCatch?.(t, n);
      else throw t;
    },
    errorComponent: ({ error: t }) => {
      if (F(t)) return e.fallback?.(t);
      throw t;
    },
    children: e.children,
  });
}
function Tr() {
  return (0, q.jsx)(`p`, { children: `Not Found` });
}
function $(e) {
  return (0, q.jsx)(q.Fragment, { children: e.children });
}
function Er(e, t, n) {
  return t.options.notFoundComponent
    ? (0, q.jsx)(t.options.notFoundComponent, { ...n })
    : e.options.defaultNotFoundComponent
      ? (0, q.jsx)(e.options.defaultNotFoundComponent, { ...n })
      : (0, q.jsx)(Tr, {});
}
function Dr(e, t) {
  let n = t?.options.pendingComponent ?? e.options.defaultPendingComponent;
  return n ? (0, q.jsx)(n, {}) : null;
}
var Or = (e, t) => e[0] === t[0] && e[1] === t[1],
  kr = o.memo(function ({ routeId: e }) {
    let t = J();
    return (0, q.jsx)(Ar, {
      router: t,
      match: Z(t.stores.getMatchStore(e), (e) => e),
    });
  });
function Ar({ router: e, match: t }) {
  let n = e.routesById[t.routeId],
    r = Dr(e, n),
    i = n.options.errorComponent ?? e.options.defaultErrorComponent,
    a = n.options.onCatch ?? e.options.defaultOnCatch,
    s = n.isRoot
      ? (n.options.notFoundComponent ??
        e.options.notFoundRoute?.options.component)
      : n.options.notFoundComponent,
    c = t.ssr === !1 || t.ssr === `data-only`,
    l =
      (n.options.wrapInSuspense ??
      r ??
      (n.options.errorComponent?.preload || c))
        ? o.Suspense
        : $,
    u = i ? vn : $,
    d = s ? wr : $;
  return (0, q.jsxs)(n.isRoot ? (n.options.shellComponent ?? $) : $, {
    children: [
      (0, q.jsx)(Tn.Provider, {
        value: t.routeId,
        children: (0, q.jsx)(l, {
          fallback: r,
          children: (0, q.jsx)(u, {
            getResetKey: () => t,
            errorComponent: i,
            onCatch: (e, n) => {
              if (F(e)) throw ((e.routeId ??= t.routeId), e);
              a?.(e, n);
            },
            children: (0, q.jsx)(d, {
              fallback: (e) => {
                if (((e.routeId ??= t.routeId), e.routeId !== t.routeId))
                  throw e;
                return o.createElement(s, e);
              },
              children: c
                ? (0, q.jsx)(xn, {
                    fallback: r,
                    children: (0, q.jsx)(jr, { match: t }),
                  })
                : (0, q.jsx)(jr, { match: t }),
            }),
          }),
        }),
      }),
      null,
    ],
  });
}
var jr = o.memo(function ({ match: e }) {
    let t = J(),
      n = e.routeId,
      r = t.routesById[n],
      i = o.useMemo(() => {
        let i = (r.options.remountDeps ?? t.options.defaultRemountDeps)?.({
          routeId: n,
          loaderDeps: e.loaderDeps,
          params: e._strictParams,
          search: e._strictSearch,
        });
        return i ? JSON.stringify(i) : void 0;
      }, [
        n,
        e.loaderDeps,
        e._strictParams,
        e._strictSearch,
        r.options.remountDeps,
        t.options.defaultRemountDeps,
      ]),
      a = o.useMemo(() => {
        let e = r.options.component ?? t.options.defaultComponent;
        return e ? (0, q.jsx)(e, {}, i) : (0, q.jsx)(Mr, {});
      }, [i, r.options.component, t.options.defaultComponent]);
    if (e.status === `pending`) {
      if (t._tx) throw t._tx[5];
      return Dr(t, r);
    }
    if (e.status === `notFound`) return Er(t, r, e.error);
    if (e.status === `error`) throw e.error;
    return a;
  }),
  Mr = o.memo(function () {
    let e = J(),
      t = o.useContext(Tn),
      n,
      r,
      i;
    {
      let a = e.stores.getMatchStore(t);
      (([n, r] = Z(a, (e) => [!!e._notFound, e.error], Or)),
        (i = Z(e.stores.ids, (e) => e[e.indexOf(t) + 1])));
    }
    if (n) return Er(e, e.routesById[t], r);
    if (!i) return null;
    let a = (0, q.jsx)(kr, { routeId: i });
    return t === `__root__`
      ? (0, q.jsx)(o.Suspense, { fallback: Dr(e), children: a })
      : a;
  });
function Nr(e, t) {
  let n = e[1];
  ((e.length = 0), n?.(t));
}
function Pr({ t: e }) {
  let t = J(),
    n = (t._rendered ??= []);
  return (
    (t.startTransition = (r, i) =>
      new Promise((a, s) => {
        (Nr(n, !1),
          n.push(i, a),
          e(t),
          o.startTransition(() => {
            try {
              r();
            } catch (e) {
              (n[1] === a && (n.length = 0), s(e));
            }
          }));
      })),
    c(() => {
      let e = t.history.subscribe(t.load);
      t.updateLatestLocation();
      let r = t.latestLocation,
        i = t.buildLocation({
          to: r.pathname,
          search: !0,
          params: !0,
          hash: !0,
          state: !0,
          _includeValidateSearch: !0,
        });
      if (P(r.publicHref) !== P(i.publicHref))
        return (t.commitLocation({ ...i, replace: !0, ignoreBlocker: !0 }), e);
      let a = t.stores.resolvedLocation.get();
      return (
        a?.href === r.href && a.state.__TSR_key === r.state.__TSR_key
          ? n.push(t.stores.matches.get(), (e) => {
              e && t.emit({ type: `onRendered`, ...bt(a, a) });
            })
          : t._tx || t.load().catch(console.error),
        e
      );
    }, [t, t.history]),
    null
  );
}
function Fr() {
  let e = J(),
    t = e.routesById[rt],
    n = Dr(e, t),
    r = e.ssr ? $ : o.Suspense,
    i = (0, q.jsxs)(q.Fragment, {
      children: [
        (0, q.jsx)(Pr, { t: o.useState()[1] }),
        (0, q.jsx)(r, { fallback: n, children: (0, q.jsx)(Ir, {}) }),
      ],
    });
  return e.options.InnerWrap
    ? (0, q.jsx)(e.options.InnerWrap, { children: i })
    : i;
}
function Ir() {
  let e = J(),
    t = e._rendered,
    n = Z(e.stores.matches, (e) => t[0] ?? e),
    r = n[0],
    i = r?.routeId;
  c(() => {
    t[0] === n && Nr(t, !0);
  }, [t, n]);
  let a = i ? (0, q.jsx)(kr, { routeId: i }) : null;
  return (0, q.jsx)(Tn.Provider, {
    value: i,
    children: e.options.disableGlobalCatchBoundary
      ? a
      : (0, q.jsx)(vn, { getResetKey: () => r, onCatch: void 0, children: a }),
  });
}
var Lr = (e) => ({
    createMutableStore: Hn,
    createReadonlyStore: Hn,
    batch: zn,
  }),
  Rr = (e) => new zr(e),
  zr = class extends Ct {
    constructor(e) {
      super(e, Lr);
    }
  };
function Br({ router: e, children: t, ...n }) {
  g(n) &&
    e.update({
      ...e.options,
      ...n,
      context: { ...e.options.context, ...n.context },
    });
  let r = (0, q.jsx)(wn.Provider, { value: e, children: t });
  return e.options.Wrap ? (0, q.jsx)(e.options.Wrap, { children: r }) : r;
}
function Vr({ router: e, ...t }) {
  return (0, q.jsx)(Br, { router: e, ...t, children: (0, q.jsx)(Fr, {}) });
}
export { Sr as a, Cr as i, Rr as n, xr as o, Mr as r, gr as s, Vr as t };
