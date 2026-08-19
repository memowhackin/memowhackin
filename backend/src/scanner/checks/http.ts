import {
  header,
  headerAll,
  safeFetch,
  type FetchedResponse,
} from "../net/fetch.js";

/*
 * What the site's own responses say about it.
 *
 * Two requests, deliberately: one to the plain-http origin and one to https.
 * The pair answers a question neither answers alone — whether http is
 * redirected, served in parallel, or refused — and "http serves the site
 * happily alongside https" is a real finding that a https-only check cannot
 * see.
 */

export interface CookieReport {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
}

export interface HttpReport {
  /** Whether https answered at all. */
  httpsReachable: boolean;
  /** Whether plain http answered. */
  httpReachable: boolean;
  /** Whether http ended up on https after redirects. */
  httpRedirectsToHttps: boolean;
  status?: number;
  headers: {
    hsts?: string;
    csp?: string;
    contentTypeOptions?: string;
    frameOptions?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    cors?: string;
    server?: string;
    poweredBy?: string;
  };
  cookies: CookieReport[];
  /** Redirect chain of the https request. */
  chain: string[];
  /** The response itself, for fingerprinting. Never stored. */
  response?: FetchedResponse;
  /** First stretch of markup, for fingerprinting. Never stored. */
  body: string;
}

function parseCookies(response: FetchedResponse): CookieReport[] {
  return headerAll(response, "set-cookie").map((raw) => {
    const lower = raw.toLowerCase();
    const name = raw.split("=")[0]?.trim() ?? "";
    const sameSite = /samesite\s*=\s*([^;]+)/i.exec(raw)?.[1]?.trim();

    return {
      name,
      secure: lower.includes("; secure") || lower.endsWith("; secure"),
      httpOnly: lower.includes("httponly"),
      ...(sameSite === undefined ? {} : { sameSite }),
    };
  });
}

export async function inspectHttp(domain: string): Promise<HttpReport> {
  const [secure, plain] = await Promise.all([
    safeFetch(`https://${domain}/`),
    safeFetch(`http://${domain}/`),
  ]);

  const report: HttpReport = {
    httpsReachable: secure.ok,
    httpReachable: plain.ok,
    httpRedirectsToHttps:
      plain.ok && plain.response.finalUrl.startsWith("https://"),
    headers: {},
    cookies: [],
    chain: secure.ok ? secure.response.chain : [],
    body: "",
  };

  if (!secure.ok) return report;

  const response = secure.response;
  report.status = response.status;
  report.response = response;
  report.body = response.body;
  report.cookies = parseCookies(response);
  report.headers = {
    ...pick(response, "strict-transport-security", "hsts"),
    ...pick(response, "content-security-policy", "csp"),
    ...pick(response, "x-content-type-options", "contentTypeOptions"),
    ...pick(response, "x-frame-options", "frameOptions"),
    ...pick(response, "referrer-policy", "referrerPolicy"),
    ...pick(response, "permissions-policy", "permissionsPolicy"),
    ...pick(response, "access-control-allow-origin", "cors"),
    ...pick(response, "server", "server"),
    ...pick(response, "x-powered-by", "poweredBy"),
  };

  return report;
}

/** Read one header into a named slot, omitting it when absent. */
function pick(
  response: FetchedResponse,
  name: string,
  key: string,
): Record<string, string> {
  const value = header(response, name);
  return value === undefined ? {} : { [key]: value };
}

/** HSTS max-age in seconds, or undefined when the header is absent/unparsable. */
export function hstsMaxAge(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const match = /max-age\s*=\s*"?(\d+)"?/i.exec(value);
  if (match?.[1] === undefined) return undefined;

  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) ? seconds : undefined;
}

/**
 * Whether a CSP is doing anything worth having.
 *
 * A policy containing `unsafe-inline` in `script-src` is, for the purpose it
 * exists to serve, not a policy: the whole point is to stop injected script
 * from executing, and `unsafe-inline` permits exactly that. Reporting its
 * presence as a pass is how a scanner gives false comfort.
 */
export function cspIsPermissive(value: string | undefined): boolean {
  if (value === undefined) return false;
  const lower = value.toLowerCase();
  const scriptSrc = /(?:^|;)\s*(?:script-src|default-src)\s+([^;]*)/.exec(
    lower,
  );
  const directive = scriptSrc?.[1] ?? "";
  return directive.includes("'unsafe-inline'") || directive.includes("*");
}

/**
 * Whether frames are refused, by either mechanism.
 *
 * `frame-ancestors` in a CSP supersedes `X-Frame-Options`, so a site with a
 * modern policy and no legacy header is correctly configured — and a check
 * that only looks for the old header would report a finding that is not one.
 */
export function frameProtected(
  frameOptions: string | undefined,
  csp: string | undefined,
): boolean {
  if (frameOptions !== undefined) {
    const value = frameOptions.toLowerCase();
    if (value.includes("deny") || value.includes("sameorigin")) return true;
  }
  return (csp ?? "").toLowerCase().includes("frame-ancestors");
}
