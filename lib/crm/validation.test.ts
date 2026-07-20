import { describe, expect, it } from "vitest";
import { parseClientInput, parseClientUpdateInput, parseEventInput } from "./validation";

describe("parseClientInput", () => {
  it("normalizes a valid client", () => {
    const formData = new FormData();
    formData.set("firstName", "  Ashley ");
    formData.set("email", "ashley@example.com");
    formData.set("preferredLanguage", "es");

    expect(parseClientInput(formData)).toEqual({
      success: true,
      data: {
        firstName: "Ashley",
        lastName: null,
        email: "ashley@example.com",
        phone: null,
        address: null,
        city: null,
        preferredLanguage: "es",
        referredBy: null,
        notes: null,
      },
    });
  });

  it("validates an editable client status", () => {
    const formData = new FormData();
    formData.set("firstName", "Ashley");
    formData.set("status", "active");

    expect(parseClientUpdateInput(formData)).toMatchObject({
      success: true,
      data: { firstName: "Ashley", status: "active" },
    });
  });

  it("rejects an invalid email", () => {
    const formData = new FormData();
    formData.set("firstName", "Ashley");
    formData.set("email", "not-an-email");

    expect(parseClientInput(formData)).toEqual({
      success: false,
      message: "El correo electrónico no es válido.",
    });
  });
});

describe("parseEventInput", () => {
  it("requires the minimum event fields", () => {
    const formData = new FormData();

    expect(parseEventInput(formData)).toEqual({
      success: false,
      message: "Cliente, tipo de evento y fecha son obligatorios.",
    });
  });

  it("normalizes a valid event", () => {
    const formData = new FormData();
    formData.set("clientId", "b6f1a5b2-0a8c-4fe0-a544-30a93595ae76");
    formData.set("eventType", "Quinceañera");
    formData.set("eventDate", "2026-08-22");
    formData.set("status", "confirmed");

    expect(parseEventInput(formData)).toEqual({
      success: true,
      data: {
        clientId: "b6f1a5b2-0a8c-4fe0-a544-30a93595ae76",
        eventType: "Quinceañera",
        title: null,
        eventDate: "2026-08-22",
        startTime: null,
        venue: null,
        city: null,
        packageName: null,
        status: "confirmed",
        notes: null,
      },
    });
  });
});
