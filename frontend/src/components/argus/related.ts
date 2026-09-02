import { NAV_ITEMS, type NavLeaf } from "@/config/nav";

/**
 * The pages a feature page hands the reader on to, resolved out of the nav
 * tree so the label, blurb and icon are the ones the header already shows.
 *
 * Shared by every ARGUS page; each old page carried its own copy of this
 * lookup, which is how three of them ended up linking to a page that had been
 * renamed.
 */
export function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );

  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}
