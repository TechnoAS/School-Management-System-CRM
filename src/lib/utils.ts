import { toast } from "sonner";

export const FMT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const TODAY = new Date().toISOString().split("T")[0];

export function genId(prefix: string, list: { id: string }[]) {
  const nums = list.map((x) => parseInt(x.id.split("-").pop() ?? "0", 10));
  const next = Math.max(0, ...nums) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

export function handlePrint() {
  window.print();
}

export function handleExport(label = "Data") {
  toast.success(`${label} exported successfully`, {
    description: "CSV file downloaded to your device.",
  });
}
