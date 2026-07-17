export type ClientInput = {
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  preferredLanguage: "es" | "en";
  referredBy: string | null;
  notes: string | null;
};

export type ClientUpdateInput = ClientInput & {
  status: "lead" | "active" | "past" | "archived";
};

export type EventInput = {
  clientId: string;
  eventType: string;
  title: string | null;
  eventDate: string;
  startTime: string | null;
  venue: string | null;
  city: string | null;
  packageName: string | null;
  status: "lead" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
};

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export function parseClientInput(formData: FormData): ParseResult<ClientInput> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const email = optionalText(formData, "email");
  const preferredLanguage = String(formData.get("preferredLanguage") ?? "es");

  if (!firstName) {
    return { success: false, message: "El nombre es obligatorio." };
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, message: "El correo electrónico no es válido." };
  }

  if (preferredLanguage !== "es" && preferredLanguage !== "en") {
    return { success: false, message: "El idioma seleccionado no es válido." };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName: optionalText(formData, "lastName"),
      email,
      phone: optionalText(formData, "phone"),
      address: optionalText(formData, "address"),
      city: optionalText(formData, "city"),
      preferredLanguage,
      referredBy: optionalText(formData, "referredBy"),
      notes: optionalText(formData, "notes"),
    },
  };
}

export function parseClientUpdateInput(formData: FormData): ParseResult<ClientUpdateInput> {
  const client = parseClientInput(formData);
  if (!client.success) return client;

  const status = String(formData.get("status") ?? "lead");
  const validStatuses = ["lead", "active", "past", "archived"] as const;
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    return { success: false, message: "El estado seleccionado no es válido." };
  }

  return {
    success: true,
    data: { ...client.data, status: status as ClientUpdateInput["status"] },
  };
}

export function parseEventInput(formData: FormData): ParseResult<EventInput> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const status = String(formData.get("status") ?? "lead");
  const validStatuses = ["lead", "confirmed", "completed", "cancelled"] as const;

  if (!clientId || !eventType || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return {
      success: false,
      message: "Cliente, tipo de evento y fecha son obligatorios.",
    };
  }

  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    return { success: false, message: "El estado seleccionado no es válido." };
  }

  return {
    success: true,
    data: {
      clientId,
      eventType,
      title: optionalText(formData, "title"),
      eventDate,
      startTime: optionalText(formData, "startTime"),
      venue: optionalText(formData, "venue"),
      city: optionalText(formData, "city"),
      packageName: optionalText(formData, "packageName"),
      status: status as EventInput["status"],
      notes: optionalText(formData, "notes"),
    },
  };
}
