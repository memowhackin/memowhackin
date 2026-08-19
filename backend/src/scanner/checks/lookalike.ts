import { Resolver } from "node:dns/promises";

/*
 * Domains registered to be mistaken for this one.
 *
 * This is the part of a brand-exposure report that customers react to, and it
 * is also the part that vendors charge most for. It does not need a vendor:
 * a lookalike domain is a public DNS fact, so generating the plausible
 * spellings and asking whether anyone registered them costs nothing but
 * lookups. Doing it ourselves means no per-scan quota, no third party learning
 * which domains our visitors are curious about, and no licence terms on the
 * results.
 *
 * The permutations are the ones attackers actually use, in rough order of how
 * often they turn up in real phishing:
 *
 *   - omission        assistec.nl        (a dropped letter)
 *   - repetition      assisstsec.nl      (a doubled letter)
 *   - transposition   asssitsec.nl       (two letters swapped)
 *   - substitution    asdistsec.nl       (a neighbouring key)
 *   - homoglyph       assistsec.nl with rn for m, 1 for l, 0 for o
 *   - hyphenation     assist-sec.nl
 *   - TLD swap        assistsec.com, .net, .co, ...
 *
 * A registered lookalike is not proof of anything on its own — defensive
 * registration by the brand itself is common and is the usual explanation. So
 * findings from here are never "confirmed", and the one signal that raises
 * severity is a mail exchanger: a lookalike that can receive mail is set up to
 * be replied to.
 */

const TIMEOUT_MS = 3000;
/*
 * A ceiling on how many names we resolve. The generator can produce several
 * hundred for a long domain, and a free scan should not fire that many DNS
 * queries at once. The ordering below puts the highest-signal permutations
 * first, so the cap trims the least interesting tail.
 */
const MAX_CANDIDATES = 64;
const CONCURRENCY = 8;

/** TLDs a Dutch or European brand is most often impersonated on. */
const SWAP_TLDS = [
  "com",
  "net",
  "org",
  "nl",
  "be",
  "de",
  "eu",
  "co",
  "info",
  "online",
  "site",
];

/** Keyboard neighbours, for the substitution set. QWERTY, lowercase only. */
const NEIGHBOURS: Record<string, string> = {
  a: "qwsz",
  b: "vghn",
  c: "xdfv",
  d: "serfcx",
  e: "wsdr",
  f: "drtgvc",
  g: "ftyhbv",
  h: "gyujnb",
  i: "ujko",
  j: "huikmn",
  k: "jiolm",
  l: "kop",
  m: "njk",
  n: "bhjm",
  o: "iplk",
  p: "ol",
  q: "wa",
  r: "edft",
  s: "awedxz",
  t: "rfgy",
  u: "yhji",
  v: "cfgb",
  w: "qase",
  x: "zsdc",
  y: "tghu",
  z: "asx",
};

/** Characters that read as another character in a browser address bar. */
const HOMOGLYPHS: Record<string, string[]> = {
  o: ["0"],
  l: ["1", "i"],
  i: ["1", "l"],
  e: ["3"],
  a: ["4"],
  s: ["5"],
  g: ["9"],
  b: ["6"],
  m: ["rn"],
  w: ["vv"],
  n: ["m"],
  u: ["v"],
};

/** Split a domain into its name and the rest, e.g. "a.co.uk" → ["a","co.uk"]. */
function split(domain: string): [string, string] {
  const parts = domain.split(".");
  // Treat a two-label public suffix (co.uk) as part of the suffix.
  const suffixLength =
    parts.length > 2 && (parts.at(-2)?.length ?? 0) <= 3 ? 2 : 1;
  const name = parts.slice(0, parts.length - suffixLength).join(".");
  const suffix = parts.slice(parts.length - suffixLength).join(".");
  return [name, suffix];
}

/**
 * Every plausible misspelling, highest-signal first and de-duplicated.
 *
 * Exported and pure so the generator can be tested without touching DNS —
 * which matters, because the thing most likely to go wrong here is generating
 * the original domain back and reporting it as its own impersonator.
 */
export function permutations(domain: string): string[] {
  const [name, suffix] = split(domain);

  /*
   * Collected into buckets and flattened in this order, because the cap at the
   * end trims the tail — so the tail has to be the least interesting part.
   *
   * An earlier version generated character mutations before hyphenation and
   * affixes, which for any name longer than about eight characters produced
   * enough substitutions to fill the budget on its own and cut the shapes most
   * used in real phishing. Substitution and homoglyph sets are the largest and
   * individually the weakest signal, so they go last.
   */
  const tldSwaps: string[] = [];
  const structural: string[] = []; // hyphenation and affixes
  const dropped: string[] = []; // omission and transposition
  const mutated: string[] = []; // substitution, homoglyph, repetition

  const add = (bucket: string[], candidate: string) => {
    const full = `${candidate}.${suffix}`;
    if (candidate.length > 0 && full !== domain) bucket.push(full);
  };

  for (const tld of SWAP_TLDS) {
    if (tld !== suffix) tldSwaps.push(`${name}.${tld}`);
  }

  for (let i = 1; i < name.length; i += 1) {
    add(structural, `${name.slice(0, i)}-${name.slice(i)}`);
  }
  for (const affix of ["secure", "login", "my", "portal", "mail", "support"]) {
    add(structural, `${affix}-${name}`);
    add(structural, `${name}-${affix}`);
  }

  for (let i = 0; i < name.length; i += 1) {
    const char = name[i] ?? "";
    const before = name.slice(0, i);
    const after = name.slice(i + 1);

    add(dropped, before + after); // omission
    if (i < name.length - 1) {
      add(dropped, before + (name[i + 1] ?? "") + char + after.slice(1));
    }

    add(mutated, before + char + char + after); // repetition
    for (const neighbour of NEIGHBOURS[char] ?? "") {
      add(mutated, before + neighbour + after);
    }
    for (const glyph of HOMOGLYPHS[char] ?? []) {
      add(mutated, before + glyph + after);
    }
  }

  // The Set is what de-duplicates across buckets while preserving this order.
  return [
    ...new Set([...tldSwaps, ...structural, ...dropped, ...mutated]),
  ].slice(0, MAX_CANDIDATES);
}

export interface Lookalike {
  domain: string;
  /** Whether it resolves to an address. */
  resolves: boolean;
  /** Whether it can receive mail, which is what makes it reply-capable. */
  hasMail: boolean;
}

async function inspect(candidate: string): Promise<Lookalike | undefined> {
  const dns = new Resolver({ timeout: TIMEOUT_MS, tries: 1 });

  const [addresses, mx] = await Promise.all([
    dns.resolve4(candidate).catch(() => []),
    dns.resolveMx(candidate).catch(() => []),
  ]);

  // Nothing at all means the name is almost certainly unregistered; an
  // unregistered lookalike is not a finding, it is the normal case.
  if (addresses.length === 0 && mx.length === 0) return undefined;

  return {
    domain: candidate,
    resolves: addresses.length > 0,
    hasMail: mx.length > 0,
  };
}

/**
 * Resolve the candidate set, a few at a time.
 *
 * Bounded concurrency rather than `Promise.all` over the whole list: sixty-odd
 * simultaneous queries is enough to look like a flood to a resolver, and the
 * scan is not in a hurry.
 */
export async function findLookalikes(domain: string): Promise<Lookalike[]> {
  const candidates = permutations(domain);
  const found: Lookalike[] = [];

  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(inspect));
    for (const result of results) {
      if (result !== undefined) found.push(result);
    }
  }

  return found.sort((a, b) => a.domain.localeCompare(b.domain));
}
