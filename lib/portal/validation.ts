const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RELATIONSHIPS = new Set(["primary", "parent", "partner", "guardian", "other"]);

export function parsePortalMembershipInput(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "primary").trim();

  if (!UUID.test(userId) || !UUID.test(clientId) || !RELATIONSHIPS.has(relationship)) {
    return { success: false as const, message: "Selecciona una cuenta, un cliente y una relación válidos." };
  }

  return { success: true as const, data: { userId, clientId, relationship } };
}
