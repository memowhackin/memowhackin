import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nInit } from "@/localization/i18n";
import { Limitations } from "@/components/scanner/Limitations";
import { useKnownLimitations } from "@/components/scanner/useKnownLimitations";

await i18nInit;

/*
 * The section and its filter are exercised together, the way the report uses
 * them: the hook decides which codes this build can phrase, the section shows
 * exactly those. Testing them apart would let a code slip through one and not
 * the other.
 */
function Harness({ codes }: { codes: readonly string[] }) {
  const known = useKnownLimitations(codes);
  return <Limitations codes={known} />;
}

function renderLimitations(codes: readonly string[]) {
  return render(
    <I18nextProvider i18n={i18n}>
      <Harness codes={codes} />
    </I18nextProvider>,
  );
}

describe("Limitations", () => {
  it("phrases the codes it has copy for and drops the ones it does not", () => {
    renderLimitations(["point_in_time", "not_a_real_code", "no_ct_records"]);

    const section = screen.getByTestId("scan-limits");
    expect(section).toHaveTextContent("What this report does not cover");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("as of the moment the scan ran");
    expect(items[1]).toHaveTextContent("Certificate Transparency");

    // An unknown code must never surface as its raw key.
    expect(section).not.toHaveTextContent("not_a_real_code");
    expect(section).not.toHaveTextContent("scanner.limits");
  });

  it("renders nothing at all when no code has copy", () => {
    renderLimitations(["not_a_real_code"]);
    expect(screen.queryByTestId("scan-limits")).toBeNull();
  });

  it("renders nothing for an empty list", () => {
    renderLimitations([]);
    expect(screen.queryByTestId("scan-limits")).toBeNull();
  });
});
