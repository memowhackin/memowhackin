import type { BreachRecord } from "@/config/scanner";

/*
 * The digital footprint relationship graph.
 *
 * Built as plain SVG rather than by adding a graph library. The brief suggests
 * React Flow, and for an editable canvas it would be the right call — but this
 * graph is read-only, has well under fifty nodes, and needs no panning,
 * zooming, dragging or edge routing. Against that, a graph runtime is roughly
 * 45kB gzipped plus its own stylesheet, in a repository whose entire runtime
 * dependency list is seven packages. A deterministic radial layout is a few
 * dozen lines, ships nothing, and — the part that actually decided it — lets
 * every node be a real focusable element with its own label, which is far
 * easier to get right for a keyboard and a screen reader than retrofitting a
 * canvas abstraction. This file is lazy-loaded, so it costs nothing until a
 * report is open.
 *
 * On what the graph may show: every node here is derived from the redacted
 * report, which by construction carries no password material of any fidelity,
 * no session or token data, no exact addresses, no full phone numbers, no
 * locations finer than a country, and nobody else's identity. The subject node
 * does not display the address either; the reader knows their own address, and
 * putting it on screen only helps whoever is standing behind them.
 */

export type NodeKind =
  | "subject"
  | "source"
  | "data_category"
  | "password_indicator"
  | "phone_indicator"
  | "network_indicator"
  | "stealer_log"
  | "action";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  /** Already-safe display label. */
  label: string;
  /*
   * What to call this node's kind in the panel, when the kind's own name is
   * wrong for the model. The kinds are named for the email graph ("Breached
   * service", "Exposed data category"); the website graph reuses them for
   * their shape and colour but means something different by them, so it
   * supplies its own wording rather than mislabelling a finding as a data
   * category.
   */
  kindLabel?: string;
  /** Where the observation came from. */
  provenance: string;
  /** Year and month, when known. */
  observedAt?: string;
  confidence: string;
  sensitivity: "low" | "medium" | "high";
  explanation: string;
  action?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export interface ExposureGraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Turn a redacted report into nodes and edges.
 *
 * Exported and pure so it can be tested without rendering: the rule that no
 * password material reaches a node is worth an assertion, and asserting it
 * against a data structure is more durable than against markup.
 */
export function buildGraph(
  records: readonly BreachRecord[],
  labels: {
    subject: string;
    password: string;
    phone: (suffix: string) => string;
    network: (country: string) => string;
    stealer: string;
    action: string;
    dataType: (type: string) => string;
    relation: {
      appearsIn: string;
      exposed: string;
      indicates: string;
      recommends: string;
    };
    provenance: { report: string; source: (name: string) => string };
    explanation: Record<string, string>;
  },
): ExposureGraphModel {
  const nodes: GraphNode[] = [
    {
      id: "subject",
      kind: "subject",
      label: labels.subject,
      provenance: labels.provenance.report,
      confidence: "confirmed",
      sensitivity: "high",
      explanation: labels.explanation.subject ?? "",
    },
  ];
  const edges: GraphEdge[] = [];

  records.forEach((record, index) => {
    const sourceId = `source-${String(index)}`;

    nodes.push({
      id: sourceId,
      kind: record.stealerLog ? "stealer_log" : "source",
      label: record.source,
      provenance: labels.provenance.source(record.source),
      ...(record.occurredAt === undefined
        ? {}
        : { observedAt: record.occurredAt }),
      confidence: record.confidence,
      sensitivity: record.stealerLog ? "high" : "medium",
      explanation:
        (record.stealerLog
          ? labels.explanation.stealer
          : labels.explanation.source) ?? "",
      ...(record.stealerLog ? { action: labels.stealer } : {}),
    });
    edges.push({
      from: "subject",
      to: sourceId,
      relation: labels.relation.appearsIn,
    });

    if (record.passwordExposed) {
      const id = `${sourceId}-password`;
      nodes.push({
        id,
        kind: "password_indicator",
        // An indicator, never a value. There is no field on `BreachRecord`
        // that could carry one even if this wanted to.
        label: labels.password,
        provenance: labels.provenance.source(record.source),
        confidence: record.confidence,
        sensitivity: "high",
        explanation: labels.explanation.password ?? "",
        action: labels.action,
      });
      edges.push({ from: sourceId, to: id, relation: labels.relation.exposed });
    }

    if (record.phoneSuffix !== undefined) {
      const id = `${sourceId}-phone`;
      nodes.push({
        id,
        kind: "phone_indicator",
        label: labels.phone(record.phoneSuffix),
        provenance: labels.provenance.source(record.source),
        confidence: record.confidence,
        sensitivity: "medium",
        explanation: labels.explanation.phone ?? "",
      });
      edges.push({ from: sourceId, to: id, relation: labels.relation.exposed });
    }

    if (record.countryCode !== undefined) {
      const id = `${sourceId}-network`;
      nodes.push({
        id,
        kind: "network_indicator",
        label: labels.network(record.countryCode),
        provenance: labels.provenance.source(record.source),
        confidence: record.confidence,
        sensitivity: "low",
        explanation: labels.explanation.network ?? "",
      });
      edges.push({
        from: sourceId,
        to: id,
        relation: labels.relation.indicates,
      });
    }

    for (const type of record.dataTypes) {
      // Password is represented by its own indicator node above; listing it
      // again as a plain category would double-count the most serious item.
      if (type === "password" || type === "phone") continue;
      const id = `${sourceId}-type-${type}`;
      nodes.push({
        id,
        kind: "data_category",
        label: labels.dataType(type),
        provenance: labels.provenance.source(record.source),
        confidence: record.confidence,
        sensitivity: "medium",
        explanation: labels.explanation.category ?? "",
      });
      edges.push({ from: sourceId, to: id, relation: labels.relation.exposed });
    }
  });

  return { nodes, edges };
}
