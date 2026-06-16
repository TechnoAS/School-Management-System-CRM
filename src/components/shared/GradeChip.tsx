export function GradeChip({ grade }: { grade: string }) {
  const map: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700", "A": "bg-blue-100 text-blue-700",
    "B+": "bg-cyan-100 text-cyan-700",       "B": "bg-amber-100 text-amber-700",
    "C":  "bg-orange-100 text-orange-700",   "F": "bg-red-100   text-red-700",
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[grade] ?? "bg-gray-100 text-gray-700"}`}>{grade}</span>;
}

export default GradeChip;
