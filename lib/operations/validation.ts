export type PaymentInput = {
  amount: number;
  paymentDate: string;
  method: "cash" | "card" | "check" | "bank_transfer" | "zelle" | "paypal" | "other";
  reference: string | null;
  notes: string | null;
};

export type ProductionTaskInput = {
  title: string;
  category: "planning" | "capture" | "postproduction" | "delivery";
  dueDate: string | null;
};

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export function parseMoney(value: FormDataEntryValue | null): ParseResult<number> {
  const raw = String(value ?? "").trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return { success: false, message: "Ingresa una cantidad válida con máximo dos decimales." };
  }

  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 9_999_999_999.99) {
    return { success: false, message: "La cantidad está fuera del rango permitido." };
  }

  return { success: true, data: amount };
}

export function parsePaymentInput(formData: FormData): ParseResult<PaymentInput> {
  const amount = parseMoney(formData.get("amount"));
  if (!amount.success || amount.data === 0) {
    return { success: false, message: "El pago debe ser mayor que cero." };
  }

  const paymentDate = String(formData.get("paymentDate") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
    return { success: false, message: "La fecha del pago es obligatoria." };
  }

  const method = String(formData.get("method") ?? "other");
  const methods = ["cash", "card", "check", "bank_transfer", "zelle", "paypal", "other"] as const;
  if (!methods.includes(method as (typeof methods)[number])) {
    return { success: false, message: "El método de pago no es válido." };
  }

  return {
    success: true,
    data: {
      amount: amount.data,
      paymentDate,
      method: method as PaymentInput["method"],
      reference: optionalText(formData, "reference"),
      notes: optionalText(formData, "paymentNotes"),
    },
  };
}

export function parseProductionTaskInput(formData: FormData): ParseResult<ProductionTaskInput> {
  const title = String(formData.get("taskTitle") ?? "").trim();
  if (title.length < 2 || title.length > 160) {
    return { success: false, message: "La tarea debe tener entre 2 y 160 caracteres." };
  }

  const category = String(formData.get("category") ?? "planning");
  const categories = ["planning", "capture", "postproduction", "delivery"] as const;
  if (!categories.includes(category as (typeof categories)[number])) {
    return { success: false, message: "La categoría no es válida." };
  }

  const dueDate = optionalText(formData, "dueDate");
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { success: false, message: "La fecha límite no es válida." };
  }

  return {
    success: true,
    data: { title, category: category as ProductionTaskInput["category"], dueDate },
  };
}
