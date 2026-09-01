import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyAddress } from "./ssrf.js";

/*
 * The address classifier, tested as the security control it is rather than as
 * a utility. Each block below is a real bypass technique: if any of these
 * returns "allowed", the scanner can be pointed at the machine it runs on or
 * at a cloud metadata endpoint.
 */

/** Undefined means "public, allowed to connect". */
const allowed = (address: string) => classifyAddress(address) === undefined;

describe("classifyAddress: IPv4", () => {
  it("allows ordinary public addresses", () => {
    expect(allowed("8.8.8.8")).toBe(true);
    expect(allowed("93.184.216.34")).toBe(true);
    expect(allowed("1.1.1.1")).toBe(true);
  });

  it("blocks loopback", () => {
    expect(classifyAddress("127.0.0.1")).toBe("loopback");
    // The whole /8 is loopback, not just .1 — a common half-fix.
    expect(classifyAddress("127.1.2.3")).toBe("loopback");
    expect(classifyAddress("127.255.255.254")).toBe("loopback");
  });

  it("blocks the cloud metadata endpoint", () => {
    // The single most valuable SSRF target: instance credentials.
    expect(classifyAddress("169.254.169.254")).toBe("link_local");
    expect(classifyAddress("169.254.170.2")).toBe("link_local");
  });

  it("blocks RFC 1918 private space", () => {
    expect(classifyAddress("10.0.0.1")).toBe("private");
    expect(classifyAddress("192.168.1.1")).toBe("private");
    expect(classifyAddress("172.16.0.1")).toBe("private");
    expect(classifyAddress("172.31.255.255")).toBe("private");
  });

  it("does not over-block around the 172.16/12 edges", () => {
    // 172.15 and 172.32 are public; blocking all of 172/8 is a real bug.
    expect(allowed("172.15.255.255")).toBe(true);
    expect(allowed("172.32.0.0")).toBe(true);
  });

  it("blocks 0.0.0.0/8, which many stacks route to localhost", () => {
    expect(classifyAddress("0.0.0.0")).toBe("unspecified");
    expect(classifyAddress("0.1.2.3")).toBe("unspecified");
  });

  it("blocks carrier-grade NAT, multicast and reserved space", () => {
    expect(classifyAddress("100.64.0.1")).toBe("carrier_grade_nat");
    expect(classifyAddress("224.0.0.1")).toBe("multicast");
    expect(classifyAddress("255.255.255.255")).toBe("reserved");
    expect(classifyAddress("240.0.0.1")).toBe("reserved");
    expect(classifyAddress("192.0.2.1")).toBe("reserved");
  });
});

describe("classifyAddress: IPv6", () => {
  it("allows ordinary public addresses", () => {
    expect(allowed("2606:4700:4700::1111")).toBe(true);
    expect(allowed("2a00:1450:4001:82f::200e")).toBe(true);
  });

  it("blocks loopback and unspecified in every spelling", () => {
    expect(classifyAddress("::1")).toBe("loopback");
    expect(classifyAddress("0:0:0:0:0:0:0:1")).toBe("loopback");
    expect(classifyAddress("0000:0000:0000:0000:0000:0000:0000:0001")).toBe(
      "loopback",
    );
    expect(classifyAddress("::")).toBe("unspecified");
  });

  it("unwraps IPv4-mapped addresses instead of trusting the prefix", () => {
    // ::ffff:127.0.0.1 reaches v4 loopback. A prefix-only check misses it.
    expect(classifyAddress("::ffff:127.0.0.1")).toBe("loopback");
    expect(classifyAddress("::ffff:169.254.169.254")).toBe("link_local");
    expect(classifyAddress("::ffff:10.0.0.1")).toBe("private");
    // The same address written as hex groups rather than dotted quad.
    expect(classifyAddress("::ffff:7f00:1")).toBe("loopback");
  });

  it("unwraps NAT64, which reaches v4 space from a v6 literal", () => {
    expect(classifyAddress("64:ff9b::169.254.169.254")).toBe("link_local");
    expect(classifyAddress("64:ff9b::127.0.0.1")).toBe("loopback");
  });

  it("blocks link-local and unique-local", () => {
    expect(classifyAddress("fe80::1")).toBe("link_local");
    // A zone index must not smuggle it past the parser.
    expect(classifyAddress("fe80::1%eth0")).toBe("link_local");
    expect(classifyAddress("fc00::1")).toBe("unique_local");
    expect(classifyAddress("fd12:3456:789a::1")).toBe("unique_local");
  });

  it("blocks multicast and documentation space", () => {
    expect(classifyAddress("ff02::1")).toBe("multicast");
    expect(classifyAddress("2001:db8::1")).toBe("reserved");
  });
});

describe("classifyAddress: malformed input", () => {
  it("refuses anything it cannot parse rather than allowing it", () => {
    // Failing open here would be the worst possible default.
    for (const value of [
      "",
      "not-an-address",
      "999.999.999.999",
      "1.2.3",
      "1.2.3.4.5",
      "::fffff:1.2.3.4",
      "12345::1",
      "1:2:3::4::5",
      "0x7f.0.0.1",
      "2130706433",
    ]) {
      expect(allowed(value), value).toBe(false);
    }
  });
});

/*
 * `resolvePublicAddress`, which is the control that actually runs before a
 * connection. `classifyAddress` above judges a literal; this judges a *name*,
 * and a name is what an attacker controls.
 *
 * The DNS is mocked because these cases cannot be produced with real records:
 * the multi-record bypass needs a name that publishes a public address and a
 * loopback address at once, which is precisely what nobody will host for us.
 */
const lookupMock = vi.hoisted(() => vi.fn());
vi.mock("node:dns/promises", () => ({ lookup: lookupMock }));

const { resolvePublicAddress } = await import("./ssrf.js");

/** What `dns.lookup(host, { all: true })` hands back. */
function records(...addresses: string[]) {
  return addresses.map((address) => ({
    address,
    family: address.includes(":") ? 6 : 4,
  }));
}

beforeEach(() => {
  lookupMock.mockReset();
});

describe("resolvePublicAddress", () => {
  it("approves a name that resolves only to public space", async () => {
    lookupMock.mockResolvedValue(records("93.184.216.34"));

    await expect(resolvePublicAddress("example.com")).resolves.toEqual({
      allowed: true,
      address: "93.184.216.34",
      family: 4,
    });
  });

  it("refuses a name that resolves to loopback", async () => {
    lookupMock.mockResolvedValue(records("127.0.0.1"));

    await expect(resolvePublicAddress("localtest.me")).resolves.toEqual({
      allowed: false,
      reason: "loopback",
    });
  });

  /*
   * The multi-record bypass, and the reason this function exists rather than a
   * single `classifyAddress` call at the call site. A name that publishes one
   * good record and one bad one must be refused outright: approving the good
   * one leaves which address gets connected to up to resolver ordering, which
   * is a coin flip the attacker gets to re-toss on every request.
   */
  it("refuses the whole name when any record is private", async () => {
    lookupMock.mockResolvedValue(records("93.184.216.34", "127.0.0.1"));

    const verdict = await resolvePublicAddress("rebind.example");
    expect(verdict.allowed).toBe(false);
  });

  it("refuses it in the other order too, so it is not first-record luck", async () => {
    lookupMock.mockResolvedValue(records("127.0.0.1", "93.184.216.34"));

    const verdict = await resolvePublicAddress("rebind.example");
    expect(verdict.allowed).toBe(false);
  });

  it("refuses a public v4 record paired with metadata space", async () => {
    lookupMock.mockResolvedValue(records("8.8.8.8", "169.254.169.254"));

    await expect(resolvePublicAddress("metadata.example")).resolves.toEqual({
      allowed: false,
      reason: "link_local",
    });
  });

  it("checks v6 records too rather than only the v4 ones", async () => {
    lookupMock.mockResolvedValue(records("93.184.216.34", "::1"));

    const verdict = await resolvePublicAddress("dual.example");
    expect(verdict.allowed).toBe(false);
  });

  /*
   * The returned literal is the whole contract: callers connect to it and must
   * never re-resolve the name. If this ever returned the hostname, every caller
   * would silently reopen rebinding — the resolver could answer differently
   * between the check and the connection.
   */
  it("hands back an address to connect to, never the name", async () => {
    lookupMock.mockResolvedValue(records("93.184.216.34"));

    const verdict = await resolvePublicAddress("example.com");
    expect(verdict.allowed && verdict.address).toBe("93.184.216.34");
    expect(JSON.stringify(verdict)).not.toContain("example.com");
  });

  it("treats a name that resolves to nothing as unresolvable", async () => {
    lookupMock.mockResolvedValue([]);

    await expect(resolvePublicAddress("void.example")).resolves.toEqual({
      allowed: false,
      reason: "unresolvable",
    });
  });

  it("fails closed when the resolver itself errors", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));

    await expect(resolvePublicAddress("gone.example")).resolves.toEqual({
      allowed: false,
      reason: "unresolvable",
    });
  });

  it("judges a literal without asking the resolver at all", async () => {
    await expect(resolvePublicAddress("127.0.0.1")).resolves.toEqual({
      allowed: false,
      reason: "loopback",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });
});
