@@ -0,0 +1,16 @@
export type ImplicitSessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getImplicitSessionTokens(
  hash: string,
): ImplicitSessionTokens | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}
