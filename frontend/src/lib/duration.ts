/** Compute a human-readable duration string from start/end dates (matches backend validation). */
export function computeDurationFromDates(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return "";

  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 365) {
    const years = Math.round((diffDays / 365) * 10) / 10;
    if (years === 1) return "1 Year";
    return `${years} Years`;
  }
  if (diffDays >= 28) {
    const months = Math.round(diffDays / 30);
    if (months === 1) return "1 Month";
    return `${months} Months`;
  }
  if (diffDays >= 7) {
    const weeks = Math.round(diffDays / 7);
    if (weeks === 1) return "1 Week";
    return `${weeks} Weeks`;
  }
  if (diffDays === 1) return "1 Day";
  return `${diffDays} Days`;
}
