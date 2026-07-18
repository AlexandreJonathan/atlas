/** Gera datas/valores das parcelas a partir da primeira data (calendário local). */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseISODate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y!, month: m!, day: d! };
}

function addMonthsClamped(iso: string, offset: number): string {
  const { year, month, day } = parseISODate(iso);
  const idx = year * 12 + (month - 1) + offset;
  const nextYear = Math.floor(idx / 12);
  const nextMonth = (idx % 12) + 1;
  const lastDay = new Date(nextYear, nextMonth, 0).getDate();
  return toISODate(nextYear, nextMonth, Math.min(day, lastDay));
}

export type ScheduledPayment = {
  sequence: number;
  dueDate: string;
  amount: number;
};

export function buildPaymentSchedule(input: {
  firstDueDate: string;
  installmentCount: number;
  installmentAmount: number;
}): ScheduledPayment[] {
  const out: ScheduledPayment[] = [];
  for (let i = 0; i < input.installmentCount; i += 1) {
    out.push({
      sequence: i + 1,
      dueDate: addMonthsClamped(input.firstDueDate, i),
      amount: input.installmentAmount,
    });
  }
  return out;
}
