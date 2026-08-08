import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";

import "./index.css";
import { routeTree } from "./routeTree.gen";
import i18n, { i18nInit } from "./localization/i18n";
import { RouteError } from "./components/common/RouteError";
import { NotFound } from "./components/common/NotFound";

const router = createRouter({
  routeTree,
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

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </StrictMode>,
  );
}
