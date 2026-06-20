export function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="h-4 w-72 bg-muted/70 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/40 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted/30 rounded-xl mt-4" />
    </div>
  );
}
