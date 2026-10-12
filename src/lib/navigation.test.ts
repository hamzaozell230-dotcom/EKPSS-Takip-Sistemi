import { describe, expect, it } from "vitest";
import { navigationItems, swipeDestination } from "./navigation";

describe("section swipes", () => {
  it("moves left to the next section in the existing order", () => {
    expect(swipeDestination("/", -120, 5, 200)).toBe("/genel");
  });
  it("moves right to the preceding section", () => {
    expect(swipeDestination("/brans", 120, 5, 200)).toBe("/genel");
  });
  it("keeps Hakkında last", () => {
    expect(navigationItems.at(-1)?.to).toBe("/hakkinda");
    expect(swipeDestination("/yapay-zeka", -120, 0, 200)).toBe("/hakkinda");
    expect(swipeDestination("/hakkinda", -120, 0, 200)).toBeUndefined();
  });
  it("does not change pages for vertical scrolling or small movements", () => {
    expect(swipeDestination("/", -90, 120, 200)).toBeUndefined();
    expect(swipeDestination("/", -20, 0, 200)).toBeUndefined();
  });
});