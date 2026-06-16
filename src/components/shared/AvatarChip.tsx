
export function AvatarChip({ name, size = "md", src }: { name: string; size?: "sm" | "md" | "lg"; src?: string }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const palettes = ["bg-blue-700", "bg-emerald-700", "bg-violet-700", "bg-amber-700", "bg-rose-700", "bg-teal-700"];
  const col = palettes[name.charCodeAt(0) % palettes.length];
  const sz = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  if (src) {
    return <img src={src} alt={name} className={`${sz} rounded-full object-cover shrink-0 border border-border`} />;
  }
  return (
    <div className={`${sz} ${col} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

export default AvatarChip;
