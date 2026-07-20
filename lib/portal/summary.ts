type Payment = { amount: number | string };
type Milestone = { is_completed: boolean };

export function calculateBalance(total: number | string, payments: Payment[]) {
  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return {
    paid,
    balance: Math.max(Number(total) - paid, 0),
  };
}

export function calculateProgress(milestones: Milestone[]) {
  if (milestones.length === 0) return 0;

  const completed = milestones.filter((milestone) => milestone.is_completed).length;
  return Math.round((completed / milestones.length) * 100);
}

export function formatPortalDate(date: string, locale = "es-US") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
