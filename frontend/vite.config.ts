import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    server: {
      /*
       * Same-origin in development too. The app always calls /api/..., so the
       * dev server has to forward it exactly as nginx does in production —
       * otherwise dev is the one environment making a cross-origin request.
       */
      proxy: {
        "/api": {
          target: process.env.CMS_API_URL ?? "http://localhost:8001",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": "/src",
        localization: "/src/localization",
      },
    },
    build: {
      sourcemap: false,
      // Vite 8 no longer ships `esbuild` as a hard dependency (oxc is the
      // default transform/minify pipeline), so asking for "esbuild" here means
      // installing it separately for no gain.
      minify: "oxc",
      target: "baseline-widely-available",
      modulePreload: { polyfill: true },
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Rollup's types no longer accept the object-map form, only a
          // function. Same grouping as before, expressed as one — and matching
          // on the resolved id rather than the bare package name, which is what
          // left the previous `react` group emitting an empty chunk.
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("/react/") || id.includes("/react-dom/")) {
              return "react";
            }
            if (id.includes("/@tanstack/react-router/")) return "tanstack";
            if (id.includes("/i18next/") || id.includes("/react-i18next/")) {
              return "i18n";
            }
            return undefined;
          },
        },
      },
    },
    // NOTE: this used to also set `esbuild: { drop: ["console", "debugger"] }`.
    // Vite 8's oxc pipeline ignores `esbuild.drop`, and its `ESBuildOptions`
    // type no longer declares the field at all, so it was a compile error
    // rather than a no-op. Removed rather than left broken.
  };
});
