import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";

import "./index.css";
import { routeTree } from "./routeTree.gen";
import { BASE_PATH } from "./config/locale";
import i18n, { i18nInit } from "./localization/i18n";
import { RouteError } from "./components/common/RouteError";
import { NotFound } from "./components/common/NotFound";

const router = createRouter({
  routeTree,
  // "" for the default language, "/nl" for the rest. Every Link in the app is
  // written without the prefix and the router adds it, so no component needs to
  // know which language build it is running in.
  basepath: BASE_PATH === "" ? undefined : BASE_PATH,
  defaultPreload: "intent",
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

await i18nInit;

i18n.on("languageChanged", () => {
  void router.invalidate();
});

/*
 * Always mount, even when the document already contains markup.
 *
 * The build prerenders each route to static HTML (scripts/prerender.mjs) so
 * crawlers and no-JS readers get the real content. React then takes the page
 * over by replacing that markup — `createRoot`, not `hydrateRoot`, and
 * deliberately so: reveal-on-scroll, viewport media queries and the stored
 * language preference all differ between the snapshot and the visitor, and
 * hydration would treat every one of those as a mismatch.
 *
 * Guarding this on an empty root, as it once did, means React never mounts over
 * prerendered HTML — leaving a page that looks right and does nothing.
 */
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
);
