import { env, isProduction } from "../../env.js";
import { fixtureEmailProvider, fixtureWebsiteProvider } from "./fixture.js";
import { liveWebsiteProvider } from "./live.js";
import type { EmailProvider, ScannerProviders } from "./types.js";

/*
 * Which providers answer, decided once.
 *
 * The important property is what happens when nothing is configured: the
 * scanner reports itself unavailable and the API refuses to create scans. It
 * does not fall back to fixtures, and it does not return an empty result that
 * reads like a clean bill of health. "We could not look" and "we looked and
 * found nothing" are different answers and the difference matters to the
 * person reading it.
 *
 * The production guard is duplicated here on purpose. `env.ts` already refuses
 * to boot with fixtures in production, and this refuses to serve them even if
 * that check is ever loosened. Two independent refusals is the right number
 * for the failure mode "we invented security findings about a real company".
 */

export function resolveProviders(): ScannerProviders | undefined {
  if (!env.SCANNER_ENABLED) return undefined;

  if (env.SCANNER_PROVIDER === "fixture") {
    if (isProduction) return undefined;
    return {
      website: fixtureWebsiteProvider,
      email: fixtureEmailProvider,
      isFixture: true,
    };
  }

  /*
   * The real scan.
   *
   * Website checks are performed by us — DNS, TLS, headers, email
   * authentication, certificate transparency — so they need no credentials
   * and are available wherever the feature is switched on.
   *
   * Email exposure is a different matter: it needs a licensed breach-data
   * feed, and no such integration exists. Rather than quietly pair a real
   * website scan with invented personal data, the email side keeps the
   * fixture in development and is refused outright in production. A personal
   * report is therefore either real or not produced at all.
   */
  if (env.SCANNER_PROVIDER === "live") {
    return {
      website: liveWebsiteProvider,
      email: isProduction ? unavailableEmailProvider : fixtureEmailProvider,
      isFixture: false,
    };
  }

  return undefined;
}

/*
 * Stands in for the breach-data feed that has not been bought. It reports
 * itself unavailable rather than returning an empty result, because "we found
 * nothing" and "we did not look" are different answers and the report renders
 * them differently.
 */
const unavailableEmailProvider: EmailProvider = {
  name: "unavailable",
  scanEmail: () => Promise.resolve({ ok: false, failure: "unavailable" }),
};

/** Whether the API should accept scan requests at all. */
export function scannerAvailable(): boolean {
  return resolveProviders() !== undefined;
}

export type { ScannerProviders };
