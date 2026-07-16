import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "./redirect";

describe("getSafeRedirect", () => {
  it("keeps an internal route", () => {
    expect(getSafeRedirect("/dashboard?view=week")).toBe(
      "/dashboard?view=week",
    );
  });

  it.each([
    undefined,
    null,
    "",
    "https://example.com",
    "//example.com",
    "/\\\\example.com",
  ])(
    "falls back for unsafe input %s",
    (value) => {
      expect(getSafeRedirect(value)).toBe("/dashboard");
    },
  );
});
