export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-blue-50    text-blue-700    border-blue-200",
    Inactive:  "bg-gray-100   text-gray-500    border-gray-200",
    Ongoing:   "bg-amber-50   text-amber-700   border-amber-200",
    Upcoming:  "bg-violet-50  text-violet-700  border-violet-200",
    Paid:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Due:       "bg-red-50     text-red-700     border-red-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
