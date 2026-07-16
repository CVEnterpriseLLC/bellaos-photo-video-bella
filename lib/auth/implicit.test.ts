import { describe, expect, it } from "vitest";
import { getImplicitSessionTokens } from "./implicit";

describe("getImplicitSessionTokens", () => {
  it("extracts the session from a Supabase URL fragment", () => {
    expect(
      getImplicitSessionTokens("#access_token=access-123&refresh_token=refresh-456"),
    ).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-456",
    });
  });

  it.each(["", "#access_token=access-123", "#refresh_token=refresh-456"])(
    "rejects an incomplete fragment: %s",
    (hash) => {
      expect(getImplicitSessionTokens(hash)).toBeNull();
    },
  );
});
