import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": "/src",
        localization: "/src/localization",
      },
    },
    build: {
      sourcemap: false,
      minify: "esbuild",
      target: "baseline-widely-available",
      modulePreload: { polyfill: true },
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            tanstack: ["@tanstack/react-router"],
            i18n: ["i18next", "react-i18next"],
          },
        },
      },
    },
    esbuild: {
      drop: isProd ? (["console", "debugger"] as const) : undefined,
    },
  };
});
