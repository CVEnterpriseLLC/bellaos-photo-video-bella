import { describe, expect, it } from "vitest";
import { parseMoney, parsePaymentInput, parseProductionTaskInput } from "./validation";

describe("parseMoney", () => {
  it("accepts currency with two decimals", () => {
    expect(parseMoney("2500.50")).toEqual({ success: true, data: 2500.5 });
  });

  it("rejects excessive decimal precision", () => {
    expect(parseMoney("10.999")).toEqual({
      success: false,
      message: "Ingresa una cantidad válida con máximo dos decimales.",
    });
  });
});

describe("parsePaymentInput", () => {
  it("normalizes a valid payment", () => {
    const formData = new FormData();
    formData.set("amount", "500");
    formData.set("paymentDate", "2026-07-17");
    formData.set("method", "zelle");

    expect(parsePaymentInput(formData)).toEqual({
      success: true,
      data: {
        amount: 500,
        paymentDate: "2026-07-17",
        method: "zelle",
        reference: null,
        notes: null,
      },
    });
  });

  it("rejects a zero payment", () => {
    const formData = new FormData();
    formData.set("amount", "0");
    formData.set("paymentDate", "2026-07-17");

    expect(parsePaymentInput(formData)).toEqual({
      success: false,
      message: "El pago debe ser mayor que cero.",
    });
  });
});

describe("parseProductionTaskInput", () => {
  it("normalizes a production task", () => {
    const formData = new FormData();
    formData.set("taskTitle", "Editar fotografías");
    formData.set("category", "postproduction");

    expect(parseProductionTaskInput(formData)).toEqual({
      success: true,
      data: {
        title: "Editar fotografías",
        category: "postproduction",
        dueDate: null,
      },
    });
  });
});
