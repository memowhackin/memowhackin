import { describe, expect, it } from "vitest";
import { gridColumns } from "./gridColumns";

/*
 * The archive grid tracks how many articles there are. A fixed three-column
 * layout left a single post against two empty columns — which is the state a
 * blog is in exactly when someone first visits it.
 */
describe("gridColumns", () => {
  it("uses the full three-column grid once there is enough to fill it", () => {
    for (const count of [3, 4, 9]) {
      expect(gridColumns(count)).toContain("lg:grid-cols-3");
    }
  });

  it("narrows and centres a short archive rather than stretching it", () => {
    expect(gridColumns(2)).toContain("mx-auto");
    expect(gridColumns(2)).toContain("sm:grid-cols-2");
    expect(gridColumns(2)).not.toContain("lg:grid-cols-3");

    // One post keeps a card's width instead of spanning the page.
    expect(gridColumns(1)).toContain("mx-auto");
    expect(gridColumns(1)).not.toContain("grid-cols-2");
  });

  it("does not break on an empty archive", () => {
    // The empty state renders instead of the grid, but the helper is still
    // called with the count and must return something usable.
    expect(typeof gridColumns(0)).toBe("string");
  });
});
