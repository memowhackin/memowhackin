import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ServiceGuarantee } from "@/components/services/ServiceGuarantee";
import { WEB_APP_PENTESTING } from "@/config/services";
import i18n, { i18nInit } from "@/localization/i18n";

await i18nInit;

/*
 * The statement types itself out, and the one thing that must survive every
 * change to how it does that is this: the whole sentence is in the document
 * from the first render, whether or not anything animates.
 *
 * Two readers depend on it. The prerenderer takes its snapshot from a live
 * browser, so a component that built the line by slicing a string would freeze
 * a half-typed promise into the HTML crawlers are served; a screen reader gets
 * a sentence rather than a line growing under it. jsdom has no `matchMedia`,
 * which is the same answer a reader asking for reduced motion gets — so this
 * is also the reduced-motion case.
 */
describe("ServiceGuarantee", () => {
  it("renders the whole statement without waiting for the typing", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ServiceGuarantee service={WEB_APP_PENTESTING} />
      </I18nextProvider>,
    );

    const card = screen.getByTestId("service-comparison-guarantee");
    const question = i18n.t(
      "servicePages.webApp.comparison.guarantee.question",
    );
    const answer = i18n.t("servicePages.webApp.comparison.guarantee.answer");

    expect(card.textContent).toContain(question);
    expect(card.textContent).toContain(answer);

    // Present is not enough — a character left transparent is one a reader
    // never sees, and that is exactly what the snapshot used to capture.
    for (const character of screen.getAllByTestId("typed-character")) {
      expect(character.className).not.toContain("opacity-0");
    }
  });
});
