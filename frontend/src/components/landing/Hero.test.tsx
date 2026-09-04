import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import i18n, { i18nInit } from "@/localization/i18n";
import { Hero } from "@/components/landing/Hero";

await i18nInit;

/*
 * The call to action is a router `Link`, which throws outside a router — so
 * the hero is mounted inside a real memory router rather than having the link
 * stubbed out. Stubbing it would leave the one assertion that matters, where
 * the button actually points, testing a mock.
 */
function renderHero() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Hero,
  });
  const contactRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/contact",
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, contactRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(
    <I18nextProvider i18n={i18n}>
      {/* The generated route tree types this app's router; a throwaway tree
          for one component cannot satisfy them. */}
      <RouterProvider router={router as never} />
    </I18nextProvider>,
  );
}

describe("Hero", () => {
  it("renders the headline and sends the call to action to the contact page", async () => {
    renderHero();

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Where AI meets pentesting.",
    );

    const cta = screen.getByTestId("hero-book-demo");
    expect(cta).toHaveAttribute("href", "/contact");
    // Internal, so it stays in this tab rather than opening a new one.
    expect(cta).not.toHaveAttribute("target");
  });

  it("translates when the language changes", async () => {
    await i18n.changeLanguage("nl");
    renderHero();

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "AI-gedreven pentesting.",
    );

    await i18n.changeLanguage("en");
  });
});
