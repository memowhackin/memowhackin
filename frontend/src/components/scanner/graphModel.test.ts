import { describe, expect, it } from "vitest";
import { buildGraph } from "./graphModel";
import type { BreachRecord } from "@/config/scanner";

/*
 * The graph model, tested for what it must never contain.
 *
 * The type system already prevents most of this — `BreachRecord` has no field
 * that could carry a password — so these assertions are the second line: they
 * fail if a future change adds one and quietly threads it through.
 */

const labels = {
  subject: "Your address",
  password: "Password exposure detected",
  phone: (suffix: string) => `Phone indicator ending in ${suffix}`,
  network: (country: string) => `Network activity associated with ${country}`,
  stealer: "Treat accounts as compromised.",
  action: "Change this password everywhere.",
  dataType: (type: string) => `type:${type}`,
  relation: {
    appearsIn: "appears in",
    exposed: "exposed",
    indicates: "indicates",
    recommends: "recommends",
  },
  provenance: {
    report: "The address you submitted",
    source: (name: string) => `Observed in the ${name} record`,
  },
  explanation: {
    subject: "s",
    source: "src",
    stealer: "st",
    password: "p",
    phone: "ph",
    network: "n",
    category: "c",
  },
};

const record: BreachRecord = {
  source: "Forum Dump 2021",
  occurredAt: "2021-07",
  dataTypes: ["email", "password", "phone", "name"],
  passwordExposed: true,
  phoneSuffix: "42",
  countryCode: "NL",
  stealerLog: false,
  confidence: "confirmed",
};

describe("buildGraph", () => {
  it("puts the subject at the centre without naming the address", () => {
    const graph = buildGraph([record], labels);
    const subject = graph.nodes.find((node) => node.kind === "subject");

    expect(subject?.label).toBe("Your address");
    // The reader knows their own address; showing it only helps whoever is
    // standing behind them.
    expect(JSON.stringify(graph)).not.toContain("@");
  });

  it("represents a password as an indicator and never a value", () => {
    const graph = buildGraph([record], labels);
    const node = graph.nodes.find(
      (entry) => entry.kind === "password_indicator",
    );

    expect(node?.label).toBe("Password exposure detected");
    expect(node?.action).toBe("Change this password everywhere.");
    // The category node for "password" is deliberately not also emitted, or
    // the most serious item would be counted twice.
    expect(
      graph.nodes.filter((entry) => entry.label === "type:password"),
    ).toHaveLength(0);
  });

  it("shows only the last two digits of a phone number", () => {
    const graph = buildGraph([record], labels);
    const node = graph.nodes.find((entry) => entry.kind === "phone_indicator");

    expect(node?.label).toBe("Phone indicator ending in 42");
    expect(JSON.stringify(graph)).not.toContain("12345");
  });

  it("gives every node provenance, confidence and sensitivity", () => {
    const graph = buildGraph([record], labels);

    for (const node of graph.nodes) {
      expect(node.provenance.length, node.id).toBeGreaterThan(0);
      expect(node.confidence.length, node.id).toBeGreaterThan(0);
      expect(["low", "medium", "high"], node.id).toContain(node.sensitivity);
      expect(node.explanation.length, node.id).toBeGreaterThan(0);
    }
  });

  it("marks a stealer log as its own kind and attaches an action", () => {
    const graph = buildGraph([{ ...record, stealerLog: true }], labels);
    const node = graph.nodes.find((entry) => entry.kind === "stealer_log");

    expect(node).toBeDefined();
    expect(node?.sensitivity).toBe("high");
    expect(node?.action).toBe("Treat accounts as compromised.");
  });

  it("connects every node to something", () => {
    const graph = buildGraph([record, { ...record, source: "Other" }], labels);
    const connected = new Set(
      graph.edges.flatMap((edge) => [edge.from, edge.to]),
    );

    for (const node of graph.nodes) {
      if (node.id === "subject") continue;
      expect(connected.has(node.id), node.id).toBe(true);
    }
  });

  it("produces just the subject when there is no exposure", () => {
    const graph = buildGraph([], labels);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toHaveLength(0);
  });
});
