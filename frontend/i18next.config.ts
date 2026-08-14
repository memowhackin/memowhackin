export default {
  locales: ["en", "nl"],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/locales/{{language}}/{{namespace}}.json",
  },
  types: {
    input: "src/locales/en/translation.json",
    resourcesFile: "src/@types/resources.d.ts",
  },
  functions: ["t", "*.t", "i18next.t"],
  transComponents: ["Trans", "Translation"],
};
