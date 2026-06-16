import { useState } from "react";
import {
  Menu,
  GraduationCap,
  ChevronRight,
  Search,
  Bell,
  Users,
  LogOut,
} from "lucide-react";
import { User } from "@/types";
import { ROLES, canAccess } from "@/constants/roles";
import { NAV } from "@/constants/navigation";
import { AvatarChip } from "@/components/shared";

interface AppHeaderProps {
  user: User;
  current: string;
  unreadCount: number;
  onNavigate: (id: string) => void;
  onOpenSidebar: () => void;
  onShowProfile: () => void;
  onShowLogout: () => void;
}

export function AppHeader({
  user,
  current,
  unreadCount,
  onNavigate,
  onOpenSidebar,
  onShowProfile,
  onShowLogout,
}: AppHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          className="p-1.5 hover:bg-muted rounded-lg transition-colors md:hidden"
          onClick={onOpenSidebar}
        >
          <Menu size={18} className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap size={14} className="hidden sm:block" />
          <span className="hidden sm:block">TechAcademy</span>
          <ChevronRight size={12} className="hidden sm:block" />
          <span className="text-foreground font-semibold capitalize">
            {NAV.find((n) => n.id === current)?.label ?? current}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            placeholder="Quick search…"
            className="pl-8 pr-3 py-1.5 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 w-44"
            onChange={(e) => {
              const q = e.target.value.trim();
              if (q.length > 1) {
                const match = NAV.find(
                  (n) =>
                    n.label.toLowerCase().includes(q.toLowerCase()) &&
                    canAccess(user.role, n.id)
                );
                if (match) onNavigate(match.id);
              }
            }}
          />
        </div>
        {canAccess(user.role, "notifications") && (
          <button
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => onNavigate("notifications")}
          >
            <Bell size={16} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <AvatarChip name={user.name} size="sm" src={user.photo} />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold leading-none px-1.5 py-0.5 rounded-full mt-0.5"
                style={{
                  background: `${ROLES[user.role].tint}1a`,
                  color: ROLES[user.role].tint,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ROLES[user.role].tint }}
                />
                {ROLES[user.role].label}
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 border-b border-border"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(26,58,92,0.05) 0%, transparent 100%)",
                  }}
                >
                  <AvatarChip name={user.name} size="md" src={user.photo} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      onShowProfile();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Users size={15} className="text-primary" /> My Profile
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      onShowLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors text-left"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
