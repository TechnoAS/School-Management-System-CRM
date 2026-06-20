import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Users,
  ClipboardCheck,
  GraduationCap,
  Mail,
  Lock,
  EyeOff,
  Eye,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { User, Role } from "@/types";
import { ROLES, DEMO_USERS } from "@/constants/roles";
import { FormField, inputCls } from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { authService } from "@/api/services/auth.service";
import { getLoginErrorMessage } from "@/lib/loginErrors";
import { loginFormSchema } from "@/lib/validation/auth";
import { validateForm } from "@/lib/validation/formErrors";
import { useAppStore } from "@/store/useAppStore";
import { settingsService } from "@/api/services/settings.service";
import { resolveUploadUrl } from "@/lib/uploads";

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const storeInstituteName = useAppStore((s) => s.settings.name);
  const storeLogoUrl = useAppStore((s) => s.settings.logoUrl);
  const [instituteName, setInstituteName] = useState(storeInstituteName);
  const [logoUrl, setLogoUrl] = useState(() => resolveUploadUrl(storeLogoUrl));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_ENABLED) {
      setInstituteName(storeInstituteName);
      setLogoUrl(resolveUploadUrl(storeLogoUrl));
      return;
    }
    let cancelled = false;
    settingsService
      .getBranding()
      .then((branding) => {
        if (!cancelled) {
          setInstituteName(branding.name);
          setLogoUrl(resolveUploadUrl(branding.logoUrl));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInstituteName(storeInstituteName);
          setLogoUrl(resolveUploadUrl(storeLogoUrl));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storeInstituteName, storeLogoUrl]);

  const fillDemo = (role: Role) => {
    const demo = DEMO_USERS.find(u => u.role === role)!;
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const checked = validateForm(loginFormSchema, { email: email.trim(), password });
    if (!checked.ok) {
      setError(checked.message);
      return;
    }
    setLoading(true);
    try {
      if (API_ENABLED) {
        const user = await authService.login(checked.data.email, checked.data.password);
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`, {
          description: `Signed in as ${ROLES[user.role].label}`,
        });
        onLogin(user);
        return;
      }

      const match = DEMO_USERS.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!match) {
        setError("Invalid email or password. Try a demo account below.");
        return;
      }
      const { password: _pw, ...user } = match;
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`, {
        description: `Signed in as ${ROLES[user.role].label}`,
      });
      onLogin(user);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const roleIcon: Record<Role, React.ElementType> = {
    super_admin: ShieldCheck,
    admin: ShieldCheck,
    staff: Users,
    faculty: ClipboardCheck,
  };

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden" style={{ background: "var(--sidebar)" }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: "rgba(200,125,26,0.12)" }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full" style={{ background: "rgba(26,58,92,0.4)" }} />
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: logoUrl ? "transparent" : "var(--sidebar-primary)" }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap size={20} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold leading-tight truncate">{instituteName}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Management System</div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-3xl font-semibold leading-snug mb-4">Run your institute<br />from a single dashboard.</h1>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.6)" }}>
            Manage admissions, courses, batches, attendance, fees, exams and certificates — with role-based access for your entire team.
          </p>
          <div className="flex gap-6 mt-8">
            {[["12", "Modules"], ["3", "User Roles"], ["100%", "Web-based"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold" style={{ color: "var(--sidebar-primary)" }}>{n}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} {instituteName} · Software Requirements · Confidential
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: logoUrl ? "transparent" : "var(--primary)" }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap size={18} className="text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground leading-tight truncate">{instituteName}</div>
              <div className="text-xs text-muted-foreground">Management System</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Enter your credentials to access the dashboard.</p>

          <form onSubmit={submit} className="space-y-4">
            <FormField label="Email Address">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={API_ENABLED ? "you@yourinstitute.com" : "you@techacademy.com"} autoComplete="username"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </FormField>
            <FormField label="Password">
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className={`${inputCls} pl-9 pr-9`}
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FormField>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg px-4 py-2.5 text-sm transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          {API_ENABLED ? (
            <div className="mt-7 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sign in with the administrator account from your institute setup.
                If you cannot sign in, ask your system administrator to reset your password.
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
                API not running? From the project root run{" "}
                <span className="font-mono text-foreground/70">npm run dev:all</span>.
              </p>
            </div>
          ) : (
            <div className="mt-7">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Quick demo sign-in
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ROLES) as Role[]).map(role => {
                  const Icon = roleIcon[role];
                  const tint = ROLES[role].tint;
                  return (
                    <button
                      key={role} type="button" onClick={() => fillDemo(role)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-all text-center"
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${tint}1a`, color: tint }}>
                        <Icon size={15} />
                      </span>
                      <span className="text-xs font-semibold text-foreground">{ROLES[role].label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                Tap a role to auto-fill demo credentials, then press Sign In.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
