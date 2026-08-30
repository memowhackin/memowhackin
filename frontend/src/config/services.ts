import type { LucideIcon } from "lucide-react";
import {
  Crosshair,
  Database,
  Gauge,
  KeyRound,
  SlidersHorizontal,
  UserCheck,
  Workflow,
} from "lucide-react";

/*
 * The services the site sells, as structure rather than copy.
 *
 * Both pentest pages are the same page: a definition, what the test covers, the
 * levels it can be run at, how an engagement runs, what lands on the client's
 * desk at the end, how that measures up, and the questions buyers actually ask.
 * What differs between them is which items each section holds — so that is what
 * lives here, and the words live in `servicePages.<key>` in the translation
 * files. One template renders both, and a third pentest is this object plus a
 * translation block, not a new layout.
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
  /**
   * Rows of the comparison against a conventional engagement.
   *
   * Every left-hand claim is one this site already makes somewhere else — the
   * ARGUS pages are where most of them live — so the table is a summary of the
   * product rather than a new set of promises invented for a table.
   */
  comparison: readonly string[];
  /** Question keys, in the order they are asked. */
  faqs: readonly string[];
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
  comparison: [
    "approach",
    "cadence",
    "findings",
    "retesting",
    "contact",
    "compliance",
    "integrations",
  ],
  faqs: ["blackbox", "duration", "production", "remediation", "compliance"],
};

/**
 * The awareness programme, which is not shaped like a pentest.
 *
 * Its own type rather than a `ServiceDefinition` with unused fields. The two
 * pentests share a shape because they *are* the same engagement pointed at
 * different targets — scope it, test it, report it, retest it — and a template
 * over that shape is what keeps them consistent. Awareness has no scope call,
 * no findings and no retest: it is a programme that runs on people and repeats.
 * Forcing it through `coverage`/`process`/`deliverables` would have produced a
 * third page that reads like the first two with the nouns swapped, which is
 * exactly what it should not be.
 */
export interface AwarenessDefinition {
  key: string;
  pageKey: string;
  path: string;
  serviceType: string;
  /** The subjects a programme covers, in the order they are taught. */
  topics: readonly string[];
  /** The loop a programme runs on — it ends where it started, on purpose. */
  phases: readonly string[];
  /** What a programme is cut to fit. */
  tailoring: readonly string[];
  faqs: readonly string[];
}

export const SECURITY_AWARENESS: AwarenessDefinition = {
  key: "awareness",
  pageKey: "servicesAwareness",
  path: "/services/security-awareness",
  serviceType: "Security awareness training",
  topics: [
    "phishing",
    "socialEngineering",
    "passwords",
    "workingSafely",
    "dataLeaks",
  ],
  phases: ["baseline", "training", "simulation", "adjust"],
  tailoring: ["sector", "size", "risk"],
  faqs: ["format", "language", "consent", "duration", "measure"],
};

export const API_PENTESTING: ServiceDefinition = {
  key: "api",
  pageKey: "servicesApi",
  path: "/services/api-pentesting",
  serviceType: "API penetration testing",
  /*
   * Ordered the way an API is actually attacked: who you are, what you may
   * reach, what comes back, how hard you can push, what the calls mean
   * together, and what the deployment gives away for free.
   */
  coverage: [
    { key: "auth", icon: KeyRound },
    { key: "authorization", icon: UserCheck },
    { key: "dataExposure", icon: Database },
    { key: "rateLimits", icon: Gauge },
    { key: "businessLogic", icon: Workflow },
    { key: "configuration", icon: SlidersHorizontal },
  ],
  /*
   * The same six stages as a web application test, and deliberately the same
   * keys: an engagement runs the way it runs whatever is being tested, the
   * marks beside each stage are drawn once in `StepGlyph`, and a client buying
   * both should recognise the second process as the first. What differs is the
   * copy behind each key.
   */
  process: ["scope", "recon", "testing", "validation", "reporting", "retest"],
  deliverables: ["findings", "risk", "fixes", "summary", "compliance"],
  comparison: [
    "approach",
    "cadence",
    "findings",
    "retesting",
    "contact",
    "compliance",
    "integrations",
  ],
  faqs: ["protocols", "documentation", "access", "production", "compliance"],
};
