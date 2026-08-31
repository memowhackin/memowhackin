/*
 * The ARGUS feature pages.
 *
 * Six pages built from the home page's devices, composed differently on each,
 * and each showing the portal in the way its own screen asks for. A feature
 * page earns its place by making one argument well, and the argument differs:
 * scanning is about a calendar, retesting follows a single finding from
 * discovery to closure, integrations is organised by destination.
 *
 * A page is a list of sections. What a section says lives in
 * `argusPages.<page>.<section>`; how the portal is shown lives in the section
 * kind, and no two pages use the same one (see `ArgusShots`).
 */

/** Centred label, heading and copy. Opens a page and closes most sections. */
interface StatementSection {
  kind: "statement";
  key: string;
  heading?: boolean;
  paragraphs: 1 | 2;
}

/** Centred copy over one wide screen. For a table nothing narrower fits. */
interface ShowcaseSection {
  kind: "showcase";
  key: string;
  shot: string;
}

/** Copy beside two frames, one behind the other: a queue and what you opened. */
interface StackSection {
  kind: "stack";
  key: string;
  front: string;
  back: string;
}

/** Wide copy with a narrow, tall frame beside it. For a column of messages. */
interface AsideSection {
  kind: "aside";
  key: string;
  shot: string;
  items: readonly string[];
}

/** Copy with a screen that runs off the edge of the page. */
interface BleedSection {
  kind: "bleed";
  key: string;
  shot: string;
}

/** A centred heading over columns of short entries. */
interface GridSection {
  kind: "grid";
  key: string;
  heading?: boolean;
  items: readonly string[];
}

/**
 * An ordered walk. `shotAt` puts a frame inside one of the steps rather than
 * beside the list, for the page where the screen *is* a step.
 */
interface StepsSection {
  kind: "steps";
  key: string;
  heading?: boolean;
  items: readonly string[];
  shot?: string;
  shotAt?: string;
}

/** Questions people actually ask, answered underneath. */
interface QaSection {
  kind: "qa";
  key: string;
  items: readonly string[];
}

/** Three frames, for the section that ends in three places. */
interface TriptychSection {
  kind: "triptych";
  key: string;
  heading?: boolean;
  shots: readonly string[];
  items: readonly string[];
}

/** Where the feature sits against the alternatives. */
interface TableSection {
  kind: "table";
  key: string;
  columns: readonly string[];
  rows: readonly string[];
}

export type ArgusSection =
  | StatementSection
  | ShowcaseSection
  | StackSection
  | AsideSection
  | BleedSection
  | GridSection
  | StepsSection
  | QaSection
  | TriptychSection
  | TableSection;

export interface ArgusFeature {
  key: string;
  pageKey: string;
  path: string;
  secondaryCta: boolean;
  sections: readonly ArgusSection[];
  related: readonly string[];
}

export const ARGUS_FEATURES: readonly ArgusFeature[] = [
  {
    /* The calendar problem. One wide screen, shown full width under the copy. */
    key: "scanning",
    pageKey: "argusScanning",
    path: "/argus/continuous-scanning",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 2 },
      {
        kind: "grid",
        key: "fails",
        heading: true,
        items: ["scanners", "pentests", "bounty"],
      },
      { kind: "showcase", key: "solution", shot: "pass" },
      {
        kind: "steps",
        key: "process",
        heading: true,
        items: ["scope", "discover", "test", "validate", "publish"],
      },
      { kind: "grid", key: "outcome", items: ["window", "queue", "evidence"] },
      {
        kind: "table",
        key: "comparison",
        columns: ["ours", "pentest", "scanner"],
        rows: ["window", "scope", "noise", "logic"],
      },
    ],
    related: [
      "/argus/insights",
      "/argus/retesting",
      "/services/web-app-pentesting",
    ],
  },
  {
    /* The latency of knowing. Two frames: the queue, and the one you opened. */
    key: "insights",
    pageKey: "argusInsights",
    path: "/argus/insights",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 2 },
      {
        kind: "grid",
        key: "fails",
        heading: true,
        items: ["pdf", "spreadsheet", "dashboard"],
      },
      { kind: "stack", key: "solution", front: "finding", back: "queue" },
      {
        kind: "grid",
        key: "anatomy",
        heading: true,
        items: ["reproduction", "radius", "rank", "recommendation", "state"],
      },
      { kind: "statement", key: "changes", paragraphs: 1 },
    ],
    related: ["/argus/retesting", "/argus/expert-chat", "/argus/compliance"],
  },
  {
    /* Human access. A conversation is narrow, so it sits in a narrow column. */
    key: "expertChat",
    pageKey: "argusExpertChat",
    path: "/argus/expert-chat",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 2 },
      {
        kind: "aside",
        key: "asked",
        shot: "thread",
        items: ["waf", "patch", "reproduce", "environment"],
      },
      {
        kind: "grid",
        key: "howItWorks",
        heading: true,
        items: ["thread", "named", "kept", "escalation"],
      },
      { kind: "statement", key: "straight", heading: true, paragraphs: 1 },
      { kind: "statement", key: "changes", paragraphs: 1 },
    ],
    related: [
      "/argus/insights",
      "/argus/retesting",
      "/services/api-pentesting",
    ],
  },
  {
    /* Evidence. The matrix is wider than the page, so it leaves the page. */
    key: "compliance",
    pageKey: "argusCompliance",
    path: "/argus/compliance",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 2 },
      {
        kind: "grid",
        key: "fails",
        heading: true,
        items: ["grc", "report", "spreadsheet"],
      },
      { kind: "bleed", key: "solution", shot: "coverage" },
      {
        kind: "grid",
        key: "capabilities",
        heading: true,
        items: ["mapping", "trail", "coverage", "export"],
      },
      {
        kind: "steps",
        key: "year",
        heading: true,
        items: ["scoping", "monthly", "midCycle", "audit"],
      },
      { kind: "statement", key: "limits", heading: true, paragraphs: 1 },
    ],
    related: [
      "/argus/insights",
      "/argus/continuous-scanning",
      "/argus/integrations",
    ],
  },
  {
    /*
     * One finding, from discovery to closure. The screen is a state change
     * inside that sequence, so it appears inside the sequence: no image section
     * on this page at all.
     */
    key: "retesting",
    pageKey: "argusRetesting",
    path: "/argus/retesting",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 1 },
      {
        kind: "steps",
        key: "life",
        heading: true,
        items: ["found", "fixed", "requested", "attacked", "closed"],
        shot: "status",
        shotAt: "closed",
      },
      { kind: "statement", key: "byHand", heading: true, paragraphs: 1 },
      {
        kind: "grid",
        key: "fails",
        heading: true,
        items: ["rerun", "attestation", "followUp"],
      },
      {
        kind: "grid",
        key: "capabilities",
        items: ["onDemand", "original", "verdict", "regression"],
      },
      { kind: "statement", key: "outcome", heading: true, paragraphs: 1 },
    ],
    related: [
      "/argus/insights",
      "/argus/continuous-scanning",
      "/argus/expert-chat",
    ],
  },
  {
    /* Three destinations, so three frames. */
    key: "integrations",
    pageKey: "argusIntegrations",
    path: "/argus/integrations",
    secondaryCta: true,
    sections: [
      { kind: "statement", key: "problem", heading: true, paragraphs: 1 },
      {
        kind: "triptych",
        key: "destinations",
        heading: true,
        shots: ["siem", "ticket", "pipeline"],
        items: ["siem", "backlog", "pipeline", "own"],
      },
      {
        kind: "steps",
        key: "setup",
        heading: true,
        items: ["connect", "map", "route"],
      },
      { kind: "statement", key: "boundary", heading: true, paragraphs: 1 },
      { kind: "statement", key: "changes", paragraphs: 1 },
    ],
    related: [
      "/argus/insights",
      "/argus/compliance",
      "/argus/continuous-scanning",
    ],
  },
];

/** One feature by its route, for the route files to hand to the page. */
export function argusFeature(path: string): ArgusFeature {
  const feature = ARGUS_FEATURES.find((item) => item.path === path);
  if (!feature) throw new Error(`No ARGUS feature configured for ${path}`);
  return feature;
}
