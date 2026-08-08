import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nInit } from "@/localization/i18n";
import { Hero } from "@/components/landing/Hero";
import { site } from "@/config/site";

await i18nInit;

function renderHero() {
  return render(
    <I18nextProvider i18n={i18n}>
      <Hero />
    </I18nextProvider>,
  );
}

describe("Hero", () => {
  it("renders the headline and the demo call to action", () => {
    renderHero();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Cybersecurity with AI-assisted pentesting.",
    );

    const cta = screen.getByTestId("hero-book-demo");
    expect(cta).toHaveAttribute("href", site.bookDemoUrl);
    expect(cta).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("translates when the language changes", async () => {
    await i18n.changeLanguage("nl");
    renderHero();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Cyberveiligheid met AI-assisted pentesting.",
    );

    await i18n.changeLanguage("en");
  });
});
