import { describe, expect, it } from "vitest";

import { calculateBalance, calculateProgress, formatPortalDate } from "./summary";

describe("client portal summaries", () => {
  it("calculates paid and outstanding balances without returning negative debt", () => {
    expect(calculateBalance(2500, [{ amount: 500 }, { amount: "750" }])).toEqual({
      paid: 1250,
      balance: 1250,
    });
    expect(calculateBalance(100, [{ amount: 120 }]).balance).toBe(0);
  });

  it("calculates rounded milestone progress", () => {
    expect(calculateProgress([])).toBe(0);
    expect(
      calculateProgress([
        { is_completed: true },
        { is_completed: false },
        { is_completed: false },
      ]),
    ).toBe(33);
  });

  it("formats date-only values consistently", () => {
    expect(formatPortalDate("2026-07-18", "en-US")).toBe("July 18, 2026");
  });
});
