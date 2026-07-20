import { describe, expect, it } from "vitest";

import { parsePortalMembershipInput } from "./validation";

const userId = "123e4567-e89b-42d3-a456-426614174000";
const clientId = "123e4567-e89b-42d3-a456-426614174001";

describe("portal membership validation", () => {
  it("accepts a valid membership", () => {
    const form = new FormData();
    form.set("userId", userId);
    form.set("clientId", clientId);
    form.set("relationship", "parent");

    expect(parsePortalMembershipInput(form)).toEqual({
      success: true,
      data: { userId, clientId, relationship: "parent" },
    });
  });

  it("rejects invalid identifiers and relationships", () => {
    const form = new FormData();
    form.set("userId", "not-a-user");
    form.set("clientId", clientId);
    form.set("relationship", "staff");

    expect(parsePortalMembershipInput(form).success).toBe(false);
  });
});
