import type { Payment } from "@/types";

/** Generate the next sequential receipt number from settings prefix + payment history. */
export function nextReceiptNumber(
  prefix: string,
  startingNumber: string,
  payments: Payment[]
): string {
  const nums = payments
    .filter(p => p.receipt.startsWith(prefix))
    .map(p => parseInt(p.receipt.slice(prefix.length), 10))
    .filter(n => !Number.isNaN(n));
  const start = parseInt(startingNumber, 10) || 1;
  const next = Math.max(start - 1, 0, ...nums) + 1;
  const padLen = Math.max(startingNumber.length, 4);
  return `${prefix}${String(next).padStart(padLen, "0")}`;
}
