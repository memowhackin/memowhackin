import { lookup } from "node:dns/promises";
import net from "node:net";

/*
 * Deciding whether an address is on the public internet.
 *
 * This is the control that stands between "scan the domain a stranger typed"
 * and "make our server fetch our own cloud credentials". The threat is not
 * exotic: `169.254.169.254` is the instance metadata endpoint on every major
 * cloud, `127.0.0.1` is whatever else runs on this host, and a name an
 * attacker controls can point at either.
 *
 * Two properties matter more than the block list itself.
 *
 * The check is on the *resolved address*, never the hostname. Hostname
 * allowlisting cannot work: `evil.test` may have an A record of `127.0.0.1`,
 * and no amount of string inspection will reveal that.
 *
 * The address that was checked is the address that must be connected to.
 * Otherwise a name that resolves safely at check time and hostilely a
 * millisecond later — DNS rebinding — passes the check and then connects
 * somewhere else. `resolvePublicAddress` therefore hands back the literal IP
 * it approved, and the caller is expected to connect to that, with the
 * hostname carried only in the Host header. Re-resolving before connecting is
 * exactly the bug this shape exists to prevent.
 */

export type BlockReason =
  | "unresolvable"
  | "loopback"
  | "private"
  | "link_local"
  | "unique_local"
  | "reserved"
  | "multicast"
  | "unspecified"
  | "carrier_grade_nat"
  | "broadcast";

export type AddressVerdict =
  | { allowed: true; address: string; family: 4 | 6 }
  | { allowed: false; reason: BlockReason };

function parseIPv4(address: string): number[] | undefined {
  const parts = address.split(".");
  if (parts.length !== 4) return undefined;

  const octets = parts.map((part) => Number(part));
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return undefined;
  }
  return octets;
}

/**
 * Classify an IPv4 address, following the IANA special-purpose registry.
 *
 * Written as explicit ranges rather than a regex because the failure mode of a
 * clever pattern here is silent and severe.
 */
function classifyIPv4(address: string): BlockReason | undefined {
  const octets = parseIPv4(address);
  if (octets === undefined) return "reserved";

  const [a = 0, b = 0, c = 0, d = 0] = octets;

  if (a === 0) return "unspecified"; // 0.0.0.0/8
  if (a === 127) return "loopback"; // 127.0.0.0/8
  if (a === 10) return "private"; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return "private"; // 172.16.0.0/12
  if (a === 192 && b === 168) return "private"; // 192.168.0.0/16
  if (a === 169 && b === 254) return "link_local"; // 169.254.0.0/16 (metadata)
  if (a === 100 && b >= 64 && b <= 127) return "carrier_grade_nat"; // 100.64/10
  if (a === 192 && b === 0 && c === 0) return "reserved"; // 192.0.0.0/24
  if (a === 192 && b === 0 && c === 2) return "reserved"; // TEST-NET-1
  if (a === 198 && b === 51 && c === 100) return "reserved"; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return "reserved"; // TEST-NET-3
  if (a === 198 && (b === 18 || b === 19)) return "reserved"; // benchmarking
  if (a === 192 && b === 88 && c === 99) return "reserved"; // 6to4 relay
  if (a >= 224 && a <= 239) return "multicast"; // 224.0.0.0/4
  if (a >= 240) return "reserved"; // 240.0.0.0/4, includes 255.x
  if (a === 255 && b === 255 && c === 255 && d === 255) return "broadcast";

  return undefined;
}

/** Expand an IPv6 address to its sixteen bytes, or undefined if malformed. */
function ipv6Bytes(address: string): number[] | undefined {
  // Strip a zone index (`fe80::1%eth0`) before parsing.
  const bare = address.split("%")[0] ?? "";
  const halves = bare.split("::");
  if (halves.length > 2) return undefined;

  const parseGroups = (part: string): number[] | undefined => {
    if (part.length === 0) return [];
    const out: number[] = [];
    for (const group of part.split(":")) {
      if (group.length === 0) return undefined;
      // A trailing IPv4 form, as in ::ffff:127.0.0.1 or 64:ff9b::1.2.3.4.
      if (group.includes(".")) {
        const octets = parseIPv4(group);
        if (octets === undefined) return undefined;
        out.push((octets[0] ?? 0) * 256 + (octets[1] ?? 0));
        out.push((octets[2] ?? 0) * 256 + (octets[3] ?? 0));
        continue;
      }
      if (!/^[0-9a-f]{1,4}$/i.test(group)) return undefined;
      out.push(Number.parseInt(group, 16));
    }
    return out;
  };

  const head = parseGroups(halves[0] ?? "");
  const tail = halves.length === 2 ? parseGroups(halves[1] ?? "") : [];
  if (head === undefined || tail === undefined) return undefined;

  const groups =
    halves.length === 2
      ? [
          ...head,
          ...Array<number>(8 - head.length - tail.length).fill(0),
          ...tail,
        ]
      : head;

  if (groups.length !== 8 || groups.some((g) => g < 0 || g > 0xffff)) {
    return undefined;
  }

  return groups.flatMap((group) => [group >> 8, group & 0xff]);
}

/**
 * Classify an IPv6 address.
 *
 * The subtle case is the embedded IPv4 forms. `::ffff:127.0.0.1` is a v4
 * loopback wearing a v6 costume, and `64:ff9b::a9fe:a9fe` is NAT64 pointing at
 * the metadata endpoint. Both are unwrapped and judged as the v4 address they
 * actually reach, which is the check a naive prefix comparison misses.
 */
function classifyIPv6(address: string): BlockReason | undefined {
  const bytes = ipv6Bytes(address);
  if (bytes === undefined) return "reserved";

  const isZero = (from: number, to: number) =>
    bytes.slice(from, to).every((byte) => byte === 0);

  // ::  and ::1
  if (isZero(0, 15)) {
    const last = bytes[15] ?? 0;
    if (last === 0) return "unspecified";
    if (last === 1) return "loopback";
  }

  const asV4 = (offset: number) =>
    `${String(bytes[offset] ?? 0)}.${String(bytes[offset + 1] ?? 0)}.${String(
      bytes[offset + 2] ?? 0,
    )}.${String(bytes[offset + 3] ?? 0)}`;

  // ::ffff:0:0/96 — IPv4-mapped.
  if (isZero(0, 10) && bytes[10] === 0xff && bytes[11] === 0xff) {
    return classifyIPv4(asV4(12)) ?? undefined;
  }
  // ::/96 — deprecated IPv4-compatible.
  if (isZero(0, 12)) return classifyIPv4(asV4(12)) ?? "reserved";
  // 64:ff9b::/96 — NAT64.
  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x64 &&
    bytes[2] === 0xff &&
    bytes[3] === 0x9b &&
    isZero(4, 12)
  ) {
    return classifyIPv4(asV4(12)) ?? "reserved";
  }

  const first = bytes[0] ?? 0;
  const second = bytes[1] ?? 0;

  if (first === 0xff) return "multicast"; // ff00::/8
  if (first === 0xfe && (second & 0xc0) === 0x80) return "link_local"; // fe80::/10
  if ((first & 0xfe) === 0xfc) return "unique_local"; // fc00::/7
  if (first === 0x20 && second === 0x01) {
    const third = bytes[2] ?? 0;
    const fourth = bytes[3] ?? 0;
    if (third === 0x0d && fourth === 0xb8) return "reserved"; // 2001:db8::/32
    if (third === 0x00) return "reserved"; // 2001::/23 protocol assignments
  }

  return undefined;
}

/** Whether a literal IP address is a routable public one. */
export function classifyAddress(address: string): BlockReason | undefined {
  const family = net.isIP(address);
  if (family === 4) return classifyIPv4(address);
  if (family === 6) return classifyIPv6(address);
  return "reserved";
}

/**
 * Resolve a hostname and approve one address, or refuse the host.
 *
 * Every address the name resolves to must pass. Taking the first acceptable
 * one instead would let a name publish a public record alongside a loopback
 * record and win on a coin flip — the classic multi-record bypass.
 *
 * The returned address is the one to connect to. See the note at the top of
 * this file: re-resolving after this returns re-opens the rebinding hole.
 */
export async function resolvePublicAddress(
  hostname: string,
): Promise<AddressVerdict> {
  // A literal was passed rather than a name. `normalizeDomain` already refuses
  // these as scan subjects; this keeps the function honest if reused.
  const literal = net.isIP(hostname);
  if (literal !== 0) {
    const reason = classifyAddress(hostname);
    if (reason !== undefined) return { allowed: false, reason };
    return { allowed: true, address: hostname, family: literal === 4 ? 4 : 6 };
  }

  let records: { address: string; family: number }[];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    return { allowed: false, reason: "unresolvable" };
  }

  if (records.length === 0) return { allowed: false, reason: "unresolvable" };

  for (const record of records) {
    const reason = classifyAddress(record.address);
    if (reason !== undefined) return { allowed: false, reason };
  }

  const chosen = records[0];
  if (chosen === undefined) return { allowed: false, reason: "unresolvable" };

  return {
    allowed: true,
    address: chosen.address,
    family: chosen.family === 4 ? 4 : 6,
  };
}
