import { describe, expect, it } from "vitest";
import { isValidPassword } from "./password";

describe("isValidPassword", () => {
  it("accepts a password with at least eight characters", () => {
    expect(isValidPassword("bellaos1")).toBe(true);
  });

  it("rejects a password shorter than eight characters", () => {
    expect(isValidPassword("short7")).toBe(false);
  });
});
