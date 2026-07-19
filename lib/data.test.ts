import { describe, expect, it } from "vitest";

import { formatDate } from "./data";

describe("formatDate", () => {
  it("formats media dates consistently across server and browser time zones", () => {
    expect(formatDate("2024-04-05T00:00:00Z")).toBe("April 5, 2024");
  });
});
