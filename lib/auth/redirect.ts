const DEFAULT_REDIRECT = "/dashboard";
const TRUSTED_ORIGIN = "https://bellaos.local";

export function getSafeRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  const target = new URL(value, TRUSTED_ORIGIN);

  if (target.origin !== TRUSTED_ORIGIN) {
    return DEFAULT_REDIRECT;
  }

  return `${target.pathname}${target.search}${target.hash}`;
}
