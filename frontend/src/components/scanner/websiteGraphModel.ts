import type { LookalikeDomain, WebsiteFinding } from "@/config/scanner";
import type { ExposureGraphModel, GraphNode, NodeKind } from "./graphModel";

/*
 * The website result as a constellation.
 *
 * Everything the scan learned about a domain hangs off one subject: the areas
 * it looked at, the findings in each, every hostname it saw in the public
 * certificate logs, and every domain registered to resemble this one. Plotted
 * together they are a picture of a company's public surface, which is a thing
 * worth seeing whole — the point most reports miss by splitting it into four
 * tables.
 *
 * Hosts and lookalikes are branches in their own right rather than findings,
 * because they are not faults. A subdomain is a fact about the estate and a
 * lookalike is a fact about somebody else's registration; both belong on the
 * map and neither should be counted as a problem.
 */

/** Which node kind carries each branch, for colour and weight. */
const CATEGORY_KIND: Record<string, NodeKind> = {
  transport: "source",
  headers: "source",
  email_authentication: "source",
  dns: "source",
  exposed_surface: "stealer_log",
  software_disclosure: "data_category",
};

function sensitivityOf(severity: string): GraphNode["sensitivity"] {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

export interface WebsiteGraphLabels {
  subject: string;
  category: (key: string) => string;
  finding: (id: string) => string;
  explain: (id: string) => string;
  action: (id: string) => string;
  subjectExplanation: string;
  kindNames: {
    subject: string;
    category: string;
    finding: string;
    host: string;
    lookalike: string;
  };
  categoryExplanation: (key: string) => string;
  provenance: { scan: string; category: (key: string) => string };
  relation: { covers: string; found: string };
  /** Copy for the two branches that are not findings. */
  hosts: { title: string; explanation: string; nodeExplanation: string };
  lookalikes: {
    title: string;
    explanation: string;
    parked: string;
    mail: string;
    action: string;
  };
}

export interface WebsiteGraphInput {
  findings: readonly WebsiteFinding[];
  assets: readonly string[];
  lookalikes: readonly LookalikeDomain[];
}

export function buildWebsiteGraph(
  input: WebsiteGraphInput,
  labels: WebsiteGraphLabels,
): ExposureGraphModel {
  const nodes: GraphNode[] = [
    {
      id: "subject",
      kind: "subject",
      label: labels.subject,
      kindLabel: labels.kindNames.subject,
      provenance: labels.provenance.scan,
      confidence: "confirmed",
      sensitivity: "medium",
      explanation: labels.subjectExplanation,
    },
  ];
  const edges: ExposureGraphModel["edges"] = [];

  const branch = (node: GraphNode) => {
    nodes.push(node);
    edges.push({
      from: "subject",
      to: node.id,
      relation: labels.relation.covers,
    });
  };
  const leaf = (parent: string, node: GraphNode) => {
    nodes.push(node);
    edges.push({ from: parent, to: node.id, relation: labels.relation.found });
  };

  // Findings, grouped by the area they belong to. Order of first appearance,
  // so the same result always draws the same figure.
  const categories: string[] = [];
  for (const item of input.findings) {
    if (!categories.includes(item.category)) categories.push(item.category);
  }

  for (const category of categories) {
    const inCategory = input.findings.filter(
      (item) => item.category === category,
    );
    const id = `category-${category}`;

    // A branch is as serious as its worst finding; averaging would bury one
    // high finding under a pile of low ones.
    const worst = inCategory.some((item) => item.severity === "high")
      ? "high"
      : inCategory.some((item) => item.severity === "medium")
        ? "medium"
        : "low";

    branch({
      id,
      kind: CATEGORY_KIND[category] ?? "data_category",
      label: labels.category(category),
      kindLabel: labels.kindNames.category,
      provenance: labels.provenance.scan,
      confidence: "confirmed",
      sensitivity: sensitivityOf(worst),
      explanation: labels.categoryExplanation(category),
    });

    for (const item of inCategory) {
      leaf(id, {
        id: `finding-${item.id}`,
        kind: "data_category",
        label: labels.finding(item.id),
        kindLabel: labels.kindNames.finding,
        provenance: labels.provenance.category(category),
        confidence: item.confidence,
        sensitivity: sensitivityOf(item.severity),
        explanation: labels.explain(item.id),
        action: labels.action(item.id),
      });
    }
  }

  if (input.lookalikes.length > 0) {
    branch({
      id: "branch-lookalikes",
      kind: "stealer_log",
      label: labels.lookalikes.title,
      kindLabel: labels.kindNames.category,
      provenance: labels.provenance.scan,
      confidence: "possible",
      sensitivity: "medium",
      explanation: labels.lookalikes.explanation,
    });

    for (const entry of input.lookalikes) {
      leaf("branch-lookalikes", {
        id: `lookalike-${entry.domain}`,
        kind: entry.hasMail ? "password_indicator" : "data_category",
        label: entry.domain,
        kindLabel: labels.kindNames.lookalike,
        provenance: labels.provenance.scan,
        confidence: "possible",
        /*
         * Medium at most, never high. Most registered lookalikes belong to
         * the brand itself, and a field where forty defensive registrations
         * all burn warm says "you are under attack" about something that is
         * usually housekeeping. The finding above carries the warning; these
         * marks carry the inventory.
         */
        sensitivity: entry.hasMail ? "medium" : "low",
        explanation: entry.hasMail
          ? labels.lookalikes.mail
          : labels.lookalikes.parked,
        ...(entry.hasMail ? { action: labels.lookalikes.action } : {}),
      });
    }
  }

  if (input.assets.length > 0) {
    branch({
      id: "branch-hosts",
      kind: "source",
      label: labels.hosts.title,
      kindLabel: labels.kindNames.category,
      provenance: labels.provenance.scan,
      confidence: "confirmed",
      sensitivity: "low",
      explanation: labels.hosts.explanation,
    });

    /*
     * The graph is a summary, not the index. A domain can carry hundreds of
     * hosts, and drawing a leaf for each turns the branch into an illegible
     * mat; the Subdomains section below the graph is the authoritative full
     * list, so here the branch is capped to a legible fan.
     */
    for (const host of input.assets.slice(0, 36)) {
      leaf("branch-hosts", {
        id: `host-${host}`,
        kind: "network_indicator",
        label: host,
        kindLabel: labels.kindNames.host,
        provenance: labels.provenance.scan,
        confidence: "confirmed",
        sensitivity: "low",
        explanation: labels.hosts.nodeExplanation,
      });
    }
  }

  return { nodes, edges };
}
