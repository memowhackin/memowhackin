import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { resolvePublicAddress } from "../ssrf.js";

/*
 * The only way this feature talks to a target.
 *
 * Everything about it exists to make one guarantee: the socket is opened to an
 * address that was checked, and to nothing else. That is why it takes the
 * hostname, resolves it through `resolvePublicAddress`, and then connects to
 * the *literal IP* that came back, carrying the hostname only in the `Host`
 * header and the TLS SNI. A plain `fetch(url)` cannot do this — it resolves
 * the name itself, inside the stack, after our check has already passed, which
 * is the DNS-rebinding window in one line of code.
 *
 * Redirects are followed by hand for the same reason. Each hop is a fresh URL
 * with a fresh hostname, and every one is re-resolved and re-checked before it
 * is followed. A library that follows redirects internally would take the
 * first hop to a public address and the second to 169.254.169.254 without ever
 * asking us.
 *
 * Everything is bounded: time per request, total redirects, and bytes read.
 * A target we do not control can otherwise hold a socket open forever or
 * stream us a terabyte, and both are denial of service against ourselves.
 */

const REQUEST_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 256 * 1024;

export interface FetchOptions {
  /** "GET" or "HEAD". Nothing here ever writes to a target. */
  method?: "GET" | "HEAD";
  /** Follow 3xx responses, re-validating each hop. Defaults to true. */
  followRedirects?: boolean;
}

export interface FetchedResponse {
  status: number;
  headers: Record<string, string | string[]>;
  /** Truncated at MAX_BODY_BYTES. Empty for HEAD. */
  body: string;
  /** The URL actually answered, after redirects. */
  finalUrl: string;
  /** Every URL in the chain, including the first. */
  chain: string[];
  /** Whether the connection negotiated TLS. */
  secure: boolean;
}

export type FetchFailure =
  | "blocked"
  | "unresolvable"
  | "timeout"
  | "connection_failed"
  | "too_many_redirects"
  | "invalid_url";

export type FetchResult =
  | { ok: true; response: FetchedResponse }
  | { ok: false; failure: FetchFailure };

/** A single hop. No redirect handling; `safeFetch` composes these. */
async function hop(target: URL, method: "GET" | "HEAD"): Promise<FetchResult> {
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return { ok: false, failure: "invalid_url" };
  }

  const verdict = await resolvePublicAddress(target.hostname);
  if (!verdict.allowed) {
    return {
      ok: false,
      failure: verdict.reason === "unresolvable" ? "unresolvable" : "blocked",
    };
  }

  const secure = target.protocol === "https:";
  const send = secure ? httpsRequest : httpRequest;
  const port = target.port.length > 0 ? Number(target.port) : secure ? 443 : 80;

  return new Promise<FetchResult>((resolve) => {
    let settled = false;
    const finish = (result: FetchResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const req = send(
      {
        // The checked address, not the name. This is the whole point.
        host: verdict.address,
        port,
        path: `${target.pathname}${target.search}`,
        method,
        // The name still has to reach the server, or a virtual host serves
        // the wrong site and TLS has no SNI to present a certificate for.
        headers: {
          host: target.host,
          "user-agent": "AssistSecScanner/1.0 (+https://assistsec.nl)",
          accept: "*/*",
          "accept-encoding": "identity",
        },
        ...(secure
          ? {
              servername: target.hostname,
              // Certificate problems are a finding to report, not a reason to
              // abort: `tls.ts` inspects the chain properly and separately.
              rejectUnauthorized: false,
            }
          : {}),
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res: IncomingMessage) => {
        const chunks: Buffer[] = [];
        let size = 0;

        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size <= MAX_BODY_BYTES) {
            chunks.push(chunk);
            return;
          }
          // Enough to analyse; stop paying for the rest.
          res.destroy();
        });

        const done = () => {
          finish({
            ok: true,
            response: {
              status: res.statusCode ?? 0,
              headers: res.headers as Record<string, string | string[]>,
              body: Buffer.concat(chunks).toString("utf8"),
              finalUrl: target.toString(),
              chain: [target.toString()],
              secure,
            },
          });
        };

        res.on("end", done);
        // A body cut short by our own size cap is still a usable response.
        res.on("close", done);
        res.on("error", () => {
          finish({ ok: false, failure: "connection_failed" });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      finish({ ok: false, failure: "timeout" });
    });
    req.on("error", () => {
      finish({ ok: false, failure: "connection_failed" });
    });
    req.end();
  });
}

/**
 * Fetch a URL, re-validating every redirect hop.
 *
 * Returns the last response in the chain, with `chain` recording the whole
 * path — which is itself worth reporting: an http URL that redirects to https
 * is a fact about the site, and one that redirects off-domain may be an open
 * redirect.
 */
export async function safeFetch(
  url: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const method = options.method ?? "GET";
  const follow = options.followRedirects ?? true;

  let current: URL;
  try {
    current = new URL(url);
  } catch {
    return { ok: false, failure: "invalid_url" };
  }

  const chain: string[] = [];

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    chain.push(current.toString());

    const result = await hop(current, method);
    if (!result.ok) return result;

    const { status, headers } = result.response;
    const location = headers.location;
    const isRedirect = status >= 300 && status < 400 && location !== undefined;

    if (!follow || !isRedirect) {
      return {
        ok: true,
        response: { ...result.response, chain, finalUrl: current.toString() },
      };
    }

    const raw = Array.isArray(location) ? location[0] : location;
    if (raw === undefined) {
      return {
        ok: true,
        response: { ...result.response, chain, finalUrl: current.toString() },
      };
    }

    try {
      // Resolved against the current URL, so a relative Location works and an
      // absolute one to another host is caught by the next iteration's check.
      current = new URL(raw, current);
    } catch {
      return { ok: false, failure: "invalid_url" };
    }
  }

  return { ok: false, failure: "too_many_redirects" };
}

/** First header value, lowercased name lookup, as a plain string. */
export function header(
  response: FetchedResponse,
  name: string,
): string | undefined {
  const value = response.headers[name.toLowerCase()];
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/** Every value for a header that legitimately repeats, such as set-cookie. */
export function headerAll(response: FetchedResponse, name: string): string[] {
  const value = response.headers[name.toLowerCase()];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
