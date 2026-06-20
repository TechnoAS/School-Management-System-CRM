import { useState, useRef } from "react";
import {
  Menu,
  GraduationCap,
  ChevronRight,
  Search,
  Bell,
  Users,
  LogOut,
  Pencil,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { User, Student } from "@/types";
import { ROLES, canAccess } from "@/constants/roles";
import { NAV } from "@/constants/navigation";
import { AvatarChip, Btn } from "@/components/shared";
import { useAppStore } from "@/store/useAppStore";
import { API_ENABLED } from "@/api/config";
import { pageLayoutService } from "@/api/services/pageLayout.service";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/defaultDashboardLayout";
import { ApiError } from "@/api/client";

interface AppHeaderProps {
  user: User;
  current: string;
  unreadCount: number;
  students: Student[];
  onNavigate: (id: string) => void;
  onOpenSidebar: () => void;
  onShowProfile: () => void;
  onShowLogout: () => void;
}

export function AppHeader({
  user,
  current,
  unreadCount,
  students,
  onNavigate,
  onOpenSidebar,
  onShowProfile,
  onShowLogout,
}: AppHeaderProps) {
  const instituteName = useAppStore((s) => s.settings.name);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const editMode = useAppStore((s) => s.editMode);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const layoutDirty = useAppStore((s) => s.layoutDirty);
  const dashboardLayoutDraft = useAppStore((s) => s.dashboardLayoutDraft);
  const dashboardLayoutSaved = useAppStore((s) => s.dashboardLayoutSaved);
  const setDashboardLayoutDraft = useAppStore((s) => s.setDashboardLayoutDraft);
  const setDashboardLayoutSaved = useAppStore((s) => s.setDashboardLayoutSaved);
  const setLayoutDirty = useAppStore((s) => s.setLayoutDirty);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const runGlobalSearch = () => {
    const q = searchQuery.trim();
    if (q.length < 2) return;

    const studentHit = students.find(
      s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.id.toLowerCase().includes(q.toLowerCase())
    );
    if (studentHit && canAccess(user.role, "students")) {
      onNavigate(`students?search=${encodeURIComponent(q)}`);
      return;
    }

    const moduleHit = NAV.find(
      n => n.label.toLowerCase().includes(q.toLowerCase()) && canAccess(user.role, n.id)
    );
    if (moduleHit) onNavigate(moduleHit.id);
  };

  const handleSaveLayout = async () => {
    if (!dashboardLayoutDraft) return;
    try {
      if (API_ENABLED) {
        const saved = await pageLayoutService.save("dashboard", dashboardLayoutDraft);
        setDashboardLayoutSaved(saved);
        setDashboardLayoutDraft(JSON.parse(JSON.stringify(saved)));
      } else {
        updateSettings({ pageLayouts: { dashboard: dashboardLayoutDraft } });
        setDashboardLayoutSaved(JSON.parse(JSON.stringify(dashboardLayoutDraft)));
      }
      setLayoutDirty(false);
      toast.success("Dashboard layout saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save layout");
    }
  };

  const handleDiscardLayout = () => {
    const base = dashboardLayoutSaved ?? DEFAULT_DASHBOARD_LAYOUT;
    setDashboardLayoutDraft(JSON.parse(JSON.stringify(base)));
    setLayoutDirty(false);
    toast.message("Changes discarded.");
  };

  const handleResetLayout = () => {
    setDashboardLayoutDraft(JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT)));
    setLayoutDirty(true);
    toast.message("Reset to default layout. Save to apply for everyone.");
  };

  const isSuperAdmin = user.role === "super_admin";
  const onDashboard = current === "dashboard";

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
          <span className="hidden sm:block truncate max-w-[140px]">{instituteName || "Institute"}</span>
          <ChevronRight size={12} className="hidden sm:block" />
          <span className="text-foreground font-semibold capitalize">
            {NAV.find((n) => n.id === current)?.label ?? current}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSuperAdmin && onDashboard && (
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <Btn
              variant={editMode ? "primary" : "secondary"}
              size="sm"
              onClick={toggleEditMode}
            >
              <Pencil size={13} />
              {editMode ? "Editing" : "Edit"}
            </Btn>
            {editMode && layoutDirty && (
              <>
                <Btn variant="secondary" size="sm" onClick={handleDiscardLayout}>
                  <RotateCcw size={13} />
                  Discard
                </Btn>
                <Btn size="sm" onClick={handleSaveLayout}>
                  <Save size={13} />
                  Save
                </Btn>
              </>
            )}
            {editMode && (
              <Btn variant="ghost" size="sm" onClick={handleResetLayout}>
                Reset
              </Btn>
            )}
          </div>
        )}
        <div className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={searchRef}
            placeholder="Search students or modules…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") runGlobalSearch();
            }}
            className="pl-8 pr-3 py-1.5 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 w-52"
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
