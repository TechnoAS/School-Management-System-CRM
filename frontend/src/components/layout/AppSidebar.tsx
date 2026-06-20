import { GraduationCap, LogOut } from "lucide-react";
import { User } from "@/types";
import { ROLES, canAccess } from "@/constants/roles";
import { NAV } from "@/constants/navigation";
import { AvatarChip } from "@/components/shared";
import { useAppStore } from "@/store/useAppStore";
import { resolveUploadUrl } from "@/lib/uploads";

interface AppSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  notifCount: number;
  onClose?: () => void;
  onLogout: () => void;
  user: User;
}

export function AppSidebar({
  active,
  onNavigate,
  notifCount,
  onClose,
  onLogout,
  user,
}: AppSidebarProps) {
  const instituteName = useAppStore((s) => s.settings.name);
  const logoUrl = resolveUploadUrl(useAppStore((s) => s.settings.logoUrl));
  const items = NAV.filter((n) => canAccess(user.role, n.id));
  return (
    <aside
      className="w-56 flex flex-col shrink-0 h-full"
      style={{ background: "var(--sidebar)" }}
    >
      <div
        className="px-5 py-5 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: logoUrl ? "transparent" : "var(--sidebar-primary)" }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap size={16} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white leading-tight truncate">
              {instituteName}
            </div>
            <div
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Management System
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-0.5">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => {
                onNavigate(id);
                onClose?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: isActive ? "rgba(200,125,26,0.12)" : undefined,
                color: isActive ? "#c87d1a" : "rgba(255,255,255,0.55)",
                borderLeft: isActive ? "2px solid #c87d1a" : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={14} />
              <span className="flex-1">{label}</span>
              {id === "notifications" && notifCount > 0 && (
                <span
                  className="text-xs font-bold rounded-full px-1.5 py-0.5 text-white leading-none"
                  style={{ background: "#c87d1a" }}
                >
                  {notifCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="px-2.5 py-3 border-t"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2">
          <AvatarChip name={user.name} size="sm" src={user.photo} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user.name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {ROLES[user.role].access}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}
            title="Logout"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
