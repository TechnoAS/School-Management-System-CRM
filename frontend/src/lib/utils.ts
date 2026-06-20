import { toast } from "sonner";
import { downloadCsv, slugFilename, type CsvRow } from "./csv";

export const FMT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const TODAY = new Date().toISOString().split("T")[0];

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

export function formatCurrentDateTime(date: Date = new Date()): string {
  const datePart = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

export function genId(prefix: string, list: { id: string }[]) {
  const nums = list.map((x) => parseInt(x.id.split("-").pop() ?? "0", 10));
  const next = Math.max(0, ...nums) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

export function handlePrint() {
  window.print();
}

export function handleExport(label = "Data", rows: CsvRow[] = [], filename?: string) {
  if (!rows.length) {
    toast.error("Nothing to export", { description: "No rows match the current view." });
    return;
  }
  const file = filename ?? `${slugFilename(label)}-${new Date().toISOString().slice(0, 10)}`;
  downloadCsv(file, rows);
  toast.success(`${label} exported successfully`, {
    description: "CSV file downloaded to your device.",
  });
}
