import { logger } from "../../logger.js";
import {
  checkDnssec,
  isTakeoverCandidate,
  lookupDns,
  resolves,
} from "../checks/dns.js";
import { inspectEmailAuth } from "../checks/email.js";
import {
  cspIsPermissive,
  frameProtected,
  hstsMaxAge,
  inspectHttp,
} from "../checks/http.js";
import {
  extractImages,
  thirdPartyOrigins,
  verifyImages,
} from "../checks/images.js";
import { findLookalikes } from "../checks/lookalike.js";
import { discoverPaths } from "../checks/paths.js";
import { discoverSubdomains, probeSensitivePaths } from "../checks/surface.js";
import { detectTechnologies } from "../checks/technology.js";
import { detectWaf, hasFirewall } from "../checks/waf.js";
import { inspectTls } from "../net/tls.js";
import type {
  ProviderResult,
  WebsiteFinding,
  WebsiteObservation,
  WebsiteProvider,
} from "./types.js";

/*
 * The real website scan.
 *
 * Every finding below comes from something actually observed in this run —
 * a DNS answer, a TLS handshake, a response header, a certificate log. There
 * is no inference from a version number to a vulnerability anywhere in here,
 * which is the line most automated scanners cross: knowing that a server
 * announces "nginx/1.18.0" is not knowing that it is unpatched, and a report
 * that lists CVEs on that basis is guessing in a confident voice.
 *
 * Confidence is assigned honestly and it is not decoration:
 *
 *   confirmed  we saw it directly and it cannot be anything else
 *   high       strong evidence, but read from an indirect signal
 *   possible   a real chance this is a false positive; a person must check
 *
 * The whole scan is bounded. Every stage has its own timeout, and the run as a
 * whole is capped, so a slow target costs a scan rather than a worker.
 */

const OVERALL_TIMEOUT_MS = 45_000;

/** Fold a timeout around any stage, so one slow answer cannot hold the rest. */
async function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, ms);
  });

  try {
    return await Promise.race([work, guard]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function finding(
  id: string,
  category: WebsiteFinding["category"],
  severity: WebsiteFinding["severity"],
  confidence: WebsiteFinding["confidence"],
  evidence = "",
): WebsiteFinding {
  return { id, category, severity, confidence, evidence };
}

export const liveWebsiteProvider: WebsiteProvider = {
  name: "live",

  async scanWebsite(
    domain: string,
  ): Promise<ProviderResult<WebsiteObservation>> {
    const started = Date.now();
    const findings: WebsiteFinding[] = [];
    const limitations: string[] = [];
    let partial = false;

    /*
     * The stages run together rather than in sequence. They are independent
     * and almost entirely latency-bound, so running them serially would make
     * the scan as slow as the sum of its network waits for no benefit.
     */
    const [dns, http, tls, subdomains, exposed, lookalikes, paths] =
      await Promise.all([
        withTimeout(lookupDns(domain), 10_000, {
          a: [],
          mx: [],
          ns: [],
          txt: [],
          caa: [],
        }),
        withTimeout(inspectHttp(domain), 20_000, {
          httpsReachable: false,
          httpReachable: false,
          httpRedirectsToHttps: false,
          headers: {},
          cookies: [],
          chain: [],
          body: "",
        }),
        withTimeout(inspectTls(domain), 20_000, { reachable: false }),
        // Room for a crt.sh retry and the Cert Spotter fallback when the first
        // log is down; the common case still returns in a second or two.
        withTimeout(discoverSubdomains(domain), 26_000, []),
        withTimeout(probeSensitivePaths(domain), 20_000, []),
        withTimeout(findLookalikes(domain), 25_000, []),
        withTimeout(discoverPaths(domain), 25_000, {
          entries: [],
          disallowed: [],
          listings: [],
          securityTxt: false,
        }),
      ]);

    // A domain with no address is not a website; nothing below would mean
    // anything, so this is a failure rather than a clean report.
    if (dns.a.length === 0 && !http.httpsReachable && !http.httpReachable) {
      return { ok: false, failure: "invalid_target" };
    }

    const email = await withTimeout(inspectEmailAuth(domain, dns), 12_000, {
      spf: {
        present: false,
        qualifier: "none" as const,
        lookups: 0,
        duplicate: false,
      },
      dmarc: {
        present: false,
        policy: "missing" as const,
        percent: 0,
        hasReporting: false,
      },
      mtaSts: false,
      acceptsMail: dns.mx.length > 0,
    });

    // ---- Transport ------------------------------------------------------

    if (!http.httpsReachable) {
      findings.push(
        finding(
          "no_https",
          "transport",
          "high",
          "confirmed",
          "https did not answer",
        ),
      );
    }

    if (http.httpReachable && !http.httpRedirectsToHttps) {
      findings.push(
        finding(
          "no_https_redirect",
          "transport",
          "medium",
          "confirmed",
          "plain http served content without redirecting to https",
        ),
      );
    }

    if (tls.reachable) {
      if (tls.daysUntilExpiry !== undefined) {
        if (tls.daysUntilExpiry < 0) {
          findings.push(
            finding("tls_cert_expired", "transport", "high", "confirmed"),
          );
        } else if (tls.daysUntilExpiry <= 14) {
          findings.push(
            finding("tls_cert_expiring", "transport", "medium", "confirmed"),
          );
        }
      }
      if (tls.hostnameMatches === false) {
        findings.push(
          finding("tls_hostname_mismatch", "transport", "high", "confirmed"),
        );
      }
      if (tls.chainTrusted === false && tls.hostnameMatches !== false) {
        findings.push(
          finding("tls_chain_untrusted", "transport", "medium", "confirmed"),
        );
      }
      if (tls.legacyProtocolAccepted === true) {
        findings.push(
          finding("tls_legacy_protocol", "transport", "medium", "confirmed"),
        );
      }
    }

    const maxAge = hstsMaxAge(http.headers.hsts);
    if (http.httpsReachable && http.headers.hsts === undefined) {
      findings.push(
        finding("missing_hsts", "transport", "medium", "confirmed"),
      );
    } else if (maxAge !== undefined && maxAge < 15_552_000) {
      // Six months is the floor for preload eligibility and the usual advice.
      findings.push(
        finding("hsts_short_max_age", "transport", "low", "confirmed"),
      );
    }

    // ---- Response headers ----------------------------------------------

    if (http.httpsReachable) {
      if (http.headers.csp === undefined) {
        findings.push(finding("missing_csp", "headers", "medium", "confirmed"));
      } else if (cspIsPermissive(http.headers.csp)) {
        findings.push(
          finding("permissive_csp", "headers", "medium", "confirmed"),
        );
      }

      if (http.headers.contentTypeOptions === undefined) {
        findings.push(finding("missing_xcto", "headers", "low", "confirmed"));
      }

      if (!frameProtected(http.headers.frameOptions, http.headers.csp)) {
        findings.push(
          finding("missing_frame_protection", "headers", "medium", "confirmed"),
        );
      }

      if (http.headers.referrerPolicy === undefined) {
        findings.push(
          finding("missing_referrer_policy", "headers", "low", "confirmed"),
        );
      }

      if (http.headers.cors === "*") {
        findings.push(
          finding("permissive_cors", "headers", "medium", "confirmed"),
        );
      }

      for (const cookie of http.cookies) {
        if (!cookie.secure) {
          findings.push(
            finding("cookie_not_secure", "headers", "medium", "confirmed"),
          );
          break;
        }
      }
      for (const cookie of http.cookies) {
        if (!cookie.httpOnly) {
          findings.push(
            finding("cookie_not_httponly", "headers", "low", "confirmed"),
          );
          break;
        }
      }
    }

    // ---- Email authentication ------------------------------------------

    if (!email.spf.present) {
      findings.push(
        finding("missing_spf", "email_authentication", "high", "confirmed"),
      );
    } else {
      if (
        email.spf.qualifier === "softfail" ||
        email.spf.qualifier === "neutral"
      ) {
        findings.push(
          finding("weak_spf", "email_authentication", "medium", "confirmed"),
        );
      }
      if (email.spf.qualifier === "pass") {
        findings.push(
          finding(
            "spf_allows_all",
            "email_authentication",
            "high",
            "confirmed",
          ),
        );
      }
      if (email.spf.lookups > SPF_LOOKUP_CEILING) {
        findings.push(
          finding(
            "spf_too_many_lookups",
            "email_authentication",
            "medium",
            "high",
          ),
        );
      }
      if (email.spf.duplicate) {
        findings.push(
          finding(
            "spf_duplicate",
            "email_authentication",
            "medium",
            "confirmed",
          ),
        );
      }
    }

    if (!email.dmarc.present) {
      findings.push(
        finding("missing_dmarc", "email_authentication", "high", "confirmed"),
      );
    } else {
      if (email.dmarc.policy === "none") {
        findings.push(
          finding(
            "dmarc_policy_none",
            "email_authentication",
            "medium",
            "confirmed",
          ),
        );
      }
      if (email.dmarc.percent < 100 && email.dmarc.policy !== "none") {
        findings.push(
          finding("dmarc_partial", "email_authentication", "low", "confirmed"),
        );
      }
      if (!email.dmarc.hasReporting) {
        findings.push(
          finding(
            "dmarc_no_reporting",
            "email_authentication",
            "low",
            "confirmed",
          ),
        );
      }
    }

    if (email.acceptsMail && !email.mtaSts) {
      findings.push(
        finding("missing_mta_sts", "email_authentication", "low", "confirmed"),
      );
    }

    // ---- DNS -------------------------------------------------------------

    if (dns.caa.length === 0) {
      findings.push(finding("missing_caa", "dns", "low", "confirmed"));
    }

    const dnssec = await withTimeout(checkDnssec(domain), 6000, undefined);
    if (dnssec === false) {
      findings.push(finding("missing_dnssec", "dns", "low", "confirmed"));
    } else if (dnssec === undefined) {
      // Reported as a gap in coverage rather than as a finding either way.
      limitations.push("dnssec_undetermined");
      partial = true;
    }

    if (dns.cname !== undefined && isTakeoverCandidate(dns.cname)) {
      const live = await withTimeout(resolves(dns.cname), 5000, true);
      if (!live) {
        findings.push(
          finding("dangling_cname", "dns", "high", "high", dns.cname),
        );
      }
    }

    // ---- Exposed surface -------------------------------------------------

    for (const item of exposed) {
      // Never "confirmed": a marker match is strong but a person should look
      // before anyone acts on it.
      findings.push(finding(item.id, "exposed_surface", "high", "possible"));
    }

    if (subdomains.length > 10) {
      findings.push(
        finding(
          "large_subdomain_surface",
          "exposed_surface",
          "info",
          "confirmed",
        ),
      );
    }
    if (subdomains.length === 0) {
      limitations.push("no_ct_records");
    }

    // ---- Published paths --------------------------------------------------

    for (const path of paths.listings) {
      // A server rendering a directory's contents to anyone who asks. Nothing
      // was read out of it; the listing itself is the finding.
      findings.push(
        finding(
          "open_directory_index",
          "exposed_surface",
          "medium",
          "confirmed",
          path,
        ),
      );
    }

    if (paths.entries.length > 0 && !paths.securityTxt) {
      // RFC 9116. Cheap to publish, and its absence is why disclosure reports
      // reach a sales inbox and die there.
      findings.push(
        finding("missing_security_txt", "policy", "low", "confirmed"),
      );
    }

    /*
     * A robots.txt that names paths worth hiding.
     *
     * Only raised when an entry looks administrative, because every site
     * disallows something and a finding that fires on all of them says
     * nothing. The file is served to every crawler on the internet by design,
     * so this is not a leak we are creating — it is one the owner may not
     * realise they published.
     */
    const revealing = paths.disallowed.filter((path) =>
      /admin|login|private|backup|internal|staging|config|secret|\.git|\bapi\b|\bdev\b/i.test(
        path,
      ),
    );
    if (revealing.length > 0) {
      findings.push(
        finding(
          "robots_reveals_paths",
          "policy",
          "low",
          "confirmed",
          String(revealing.length),
        ),
      );
    }

    // ---- Edge protection --------------------------------------------------

    const waf = http.response === undefined ? [] : detectWaf(http.response);
    if (!hasFirewall(waf)) {
      /*
       * Reported as a gap in coverage, never as "there is no firewall". A WAF
       * configured not to announce itself is invisible to passive detection,
       * and the one thing worse than missing it is telling an owner who has
       * one that they do not.
       */
      limitations.push("waf_undetermined");
    }

    // ---- Homepage images --------------------------------------------------

    const pageUrl = http.response?.finalUrl ?? `https://${domain}/`;
    const images = await withTimeout(
      verifyImages(extractImages(http.body, pageUrl)),
      15_000,
      [],
    );

    if (
      http.httpsReachable &&
      images.some((img) => img.url.startsWith("http:"))
    ) {
      // A padlock that a single image can break: the browser downgrades the
      // whole page's guarantees for it.
      findings.push(
        finding("mixed_content_images", "transport", "medium", "confirmed"),
      );
    }

    const foreign = thirdPartyOrigins(images, domain);
    if (foreign.length >= 3) {
      findings.push(
        finding(
          "many_third_party_origins",
          "exposed_surface",
          "info",
          "confirmed",
          String(foreign.length),
        ),
      );
    }

    // ---- Brand impersonation --------------------------------------------

    /*
     * Never "confirmed": a registered lookalike is very often the brand's own
     * defensive registration, and telling someone they are being impersonated
     * when they are not is the fastest way to lose their trust in the rest of
     * the report. Mail capability is what separates a parked name from one set
     * up to be replied to, so it is graded separately and higher.
     */
    const mailCapable = lookalikes.filter((entry) => entry.hasMail);
    if (mailCapable.length > 0) {
      findings.push(
        finding(
          "lookalike_domain_with_mail",
          "exposed_surface",
          "high",
          "high",
          String(mailCapable.length),
        ),
      );
    }
    if (lookalikes.length > 0) {
      findings.push(
        finding(
          "lookalike_domains_registered",
          "exposed_surface",
          lookalikes.length >= 5 ? "medium" : "low",
          "possible",
          String(lookalikes.length),
        ),
      );
    }

    // ---- Software disclosure ---------------------------------------------

    if (http.headers.server !== undefined && /\d/.test(http.headers.server)) {
      findings.push(
        finding(
          "server_version_disclosed",
          "software_disclosure",
          "low",
          "confirmed",
        ),
      );
    }
    if (http.headers.poweredBy !== undefined) {
      findings.push(
        finding(
          "powered_by_disclosed",
          "software_disclosure",
          "low",
          "confirmed",
        ),
      );
    }

    const elapsed = Date.now() - started;
    if (elapsed > OVERALL_TIMEOUT_MS) partial = true;

    logger.debug(
      {
        findings: findings.length,
        subdomains: subdomains.length,
        paths: paths.entries.length,
        images: images.length,
        waf: waf.length,
        elapsed,
      },
      "live website scan finished",
    );

    return {
      ok: true,
      value: {
        findings,
        // The observed hosts. `redactWebsite` reduces this to a count before
        // it reaches anyone who has not proved they own the domain.
        assets: subdomains.length > 0 ? subdomains : [domain],
        lookalikes: lookalikes.map((entry) => ({
          domain: entry.domain,
          hasMail: entry.hasMail,
        })),
        // Read off the response the site already served us; nothing extra
        // was requested to learn any of it.
        technologies:
          http.response === undefined
            ? []
            : detectTechnologies(http.response, http.body),
        waf,
        paths,
        images,
        limitations: [
          ...limitations,
          "unauthenticated_only",
          "no_business_logic",
          "point_in_time",
        ],
      },
      partial,
    };
  },
};

/** SPF permits ten lookups; the eleventh is a permanent error. */
const SPF_LOOKUP_CEILING = 10;
