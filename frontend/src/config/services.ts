import type { LucideIcon } from "lucide-react";
import {
  Crosshair,
  Database,
  KeyRound,
  SlidersHorizontal,
  UserCheck,
  Workflow,
} from "lucide-react";

/*
 * The services the site sells, as structure rather than copy.
 *
 * Every service page is the same page: a definition, what the test covers, how
 * an engagement runs, what lands on the client's desk at the end, why it is us,
 * the questions buyers actually ask, and a way into the neighbouring services.
 * What differs between them is which items each section holds — so that is what
 * lives here, and the words live in `servicePages.<key>` in the translation
 * files. One template renders all three, and a fourth service is this object
 * plus a translation block, not a new layout.
 *
 * The keys here are i18n keys, never text: a definition that carried English
 * strings would have to be duplicated per language, which is exactly the drift
 * this file exists to prevent.
 */

/** One entry in a section that pairs an icon with a title and a line of copy. */
export interface ServiceListItem {
  /** i18n key under this service's own section, e.g. `coverage.items.auth`. */
  key: string;
  icon: LucideIcon;
}

export interface ServiceDefinition {
  /**
   * This service's block in `servicePages.*`, and the suffix every `data-testid`
   * on the page is built from.
   */
  key: string;
  /**
   * Its block in `pages.*` — title, description, heading, intro. Kept in the
   * same place every other route keeps them, so the SEO surface stays readable
   * as one list rather than being scattered per page.
   */
  pageKey: string;
  /** The route it is served at, for the canonical URL, hreflang and JSON-LD. */
  path: string;
  /**
   * schema.org `serviceType`. Deliberately English in every language: it is a
   * classifier a machine matches on, not a label anybody reads.
   */
  serviceType: string;
  /** What the engagement covers — the grid under "what we test". */
  coverage: readonly ServiceListItem[];
  /** The stages of an engagement, in the order they happen. */
  process: readonly string[];
  /** What the client is left holding: the report's contents. */
  deliverables: readonly string[];
  /** Reasons to pick us, kept to the claims this site can actually stand behind. */
  reasons: readonly string[];
  /** Question keys, in the order they are asked. */
  faqs: readonly string[];
  /**
   * Pages to hand the reader on to, as route paths. Read back out of `NAV_ITEMS`
   * so each one arrives with the label, blurb and icon the nav already carries —
   * no second copy of that text, and a renamed page cannot leave a stale link
   * behind here.
   */
  related: readonly string[];
}

/**
 * Where these services are offered, for `areaServed` in the structured data.
 *
 * A pentest is delivered remotely, so the market is a region rather than an
 * address — and stating it is what lets a search engine answer "web application
 * pentesting in the Netherlands" with this page instead of guessing from the
 * domain suffix.
 */
export const SERVICE_AREA_SERVED = ["Netherlands", "Europe"] as const;

export const WEB_APP_PENTESTING: ServiceDefinition = {
  key: "webApp",
  pageKey: "servicesWebApp",
  path: "/services/web-app-pentesting",
  serviceType: "Web application penetration testing",
  coverage: [
    { key: "auth", icon: KeyRound },
    { key: "accessControl", icon: UserCheck },
    { key: "injection", icon: Crosshair },
    { key: "businessLogic", icon: Workflow },
    { key: "configuration", icon: SlidersHorizontal },
    { key: "dataExposure", icon: Database },
  ],
  process: ["scope", "recon", "testing", "validation", "reporting", "retest"],
  deliverables: ["findings", "risk", "fixes", "summary", "compliance"],
  reasons: ["european", "agents", "language"],
  faqs: ["blackbox", "duration", "production", "remediation", "compliance"],
  related: [
    "/services/api-pentesting",
    "/services/security-awareness",
    "/argus/retesting",
  ],
};
