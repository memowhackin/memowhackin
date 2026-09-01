import { useTranslation } from "react-i18next";

/*
 * The subset of limitation codes this build has copy for.
 *
 * Lives apart from the section that renders them because the report also
 * needs the filtered list for its contents strip, and a hook exported next to
 * a component breaks fast refresh for the whole file.
 */
export function useKnownLimitations(codes: readonly string[]): string[] {
  const { i18n } = useTranslation();
  return codes.filter((code) => i18n.exists(`scanner.limits.${code}`));
}
