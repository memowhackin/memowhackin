import { connect, type PeerCertificate } from "node:tls";
import { resolvePublicAddress } from "../ssrf.js";

/*
 * What the certificate and the handshake say.
 *
 * Connects to the address the SSRF guard approved, with the hostname supplied
 * only as SNI — the same rule as `fetch.ts`, for the same reason.
 *
 * `rejectUnauthorized` is off throughout. That is not a lapse: an expired or
 * mismatched certificate is precisely the thing being measured, and refusing
 * the handshake would turn the most reportable finding into a connection
 * error. Nothing here trusts the peer; it only describes it.
 */

const HANDSHAKE_TIMEOUT_MS = 8000;

export interface TlsReport {
  reachable: boolean;
  /** Negotiated protocol, e.g. "TLSv1.3". */
  protocol?: string;
  /** Days until notAfter. Negative when already expired. */
  daysUntilExpiry?: number;
  /** Whether the certificate covers the hostname asked for. */
  hostnameMatches?: boolean;
  /** Whether the chain validated against the system trust store. */
  chainTrusted?: boolean;
  issuer?: string;
  /** Whether the server accepted a deprecated protocol version. */
  legacyProtocolAccepted?: boolean;
}

function hostnameCovered(cert: PeerCertificate, hostname: string): boolean {
  const names = new Set<string>();

  const subject: unknown = cert.subject;
  if (typeof subject === "object" && subject !== null && "CN" in subject) {
    const common = (subject as { CN?: unknown }).CN;
    if (typeof common === "string") names.add(common.toLowerCase());
  }

  for (const entry of (cert.subjectaltname ?? "").split(",")) {
    const trimmed = entry.trim();
    if (trimmed.startsWith("DNS:")) names.add(trimmed.slice(4).toLowerCase());
  }

  const target = hostname.toLowerCase();
  for (const name of names) {
    if (name === target) return true;
    // One wildcard level only, which is what the specification allows.
    if (name.startsWith("*.")) {
      const suffix = name.slice(1);
      const label = target.slice(0, Math.max(target.length - suffix.length, 0));
      if (target.endsWith(suffix) && label.length > 0 && !label.includes(".")) {
        return true;
      }
    }
  }

  return false;
}

/** Open one handshake and describe it. Never throws. */
function handshake(
  address: string,
  hostname: string,
  maxVersion?: "TLSv1.1",
): Promise<TlsReport> {
  return new Promise<TlsReport>((resolve) => {
    let settled = false;
    const finish = (report: TlsReport) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(report);
    };

    const socket = connect({
      host: address,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: HANDSHAKE_TIMEOUT_MS,
      ...(maxVersion === undefined ? {} : { maxVersion, minVersion: "TLSv1" }),
    });

    socket.on("secureConnect", () => {
      const cert = socket.getPeerCertificate(true);
      const expiry = Date.parse(cert.valid_to ?? "");
      // Read once: `getProtocol` is a live call, and under
      // `exactOptionalPropertyTypes` a second one is an expression the
      // compiler cannot narrow.
      const protocol = socket.getProtocol();

      finish({
        reachable: true,
        ...(protocol === null ? {} : { protocol }),
        ...(Number.isNaN(expiry)
          ? {}
          : {
              daysUntilExpiry: Math.floor(
                (expiry - Date.now()) / (24 * 60 * 60 * 1000),
              ),
            }),
        hostnameMatches: hostnameCovered(cert, hostname),
        chainTrusted: socket.authorized,
        ...(typeof cert.issuer === "object" &&
        cert.issuer !== null &&
        "O" in cert.issuer &&
        typeof cert.issuer.O === "string"
          ? { issuer: cert.issuer.O }
          : {}),
      });
    });

    socket.on("timeout", () => {
      finish({ reachable: false });
    });
    socket.on("error", () => {
      finish({ reachable: false });
    });
  });
}

/**
 * Inspect a host's TLS.
 *
 * Two handshakes: one ordinary, and one capped at TLS 1.1 to find out whether
 * the server still accepts a deprecated version. The second is a separate
 * connection because a server that supports both will always negotiate the
 * newer one, so the only way to ask "would you accept the old one" is to offer
 * nothing else.
 */
export async function inspectTls(hostname: string): Promise<TlsReport> {
  const verdict = await resolvePublicAddress(hostname);
  if (!verdict.allowed) return { reachable: false };

  const primary = await handshake(verdict.address, hostname);
  if (!primary.reachable) return primary;

  const legacy = await handshake(verdict.address, hostname, "TLSv1.1");
  return { ...primary, legacyProtocolAccepted: legacy.reachable };
}
