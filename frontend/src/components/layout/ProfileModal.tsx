import React, { useState } from "react";
import { toast } from "sonner";
import { Users, Lock, Settings, Camera, CheckCircle2, X } from "lucide-react";
import { User } from "@/types";
import { ROLES, DEMO_USERS } from "@/constants/roles";
import { API_ENABLED } from "@/api/config";
import { authService } from "@/api/services/auth.service";
import { ApiError } from "@/api/client";
import { changePasswordFormSchema } from "@/lib/validation/auth";
import { profileAccountSchema } from "@/lib/validation/profile";
import { validateForm } from "@/lib/validation/formErrors";
import {
  AvatarChip,
  Btn,
  FormField,
  inputCls,
  selectCls,
} from "@/components/shared";

interface ProfileModalProps {
  user: User;
  setUser: (
    user: User | null | ((prev: User | null) => User | null)
  ) => void;
  onClose: () => void;
}

export function ProfileModal({ user, setUser, onClose }: ProfileModalProps) {
  const [tab, setTab] = useState<"account" | "security" | "preferences">(
    "account"
  );
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    photo: user.photo ?? "",
  });
  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    feeReminders: true,
    admissionAlerts: user.role !== "faculty",
    compactTables: false,
    dateFormat: "DD/MM/YYYY",
  });
  const [security, setSecurity] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const up = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const tint = ROLES[user.role].tint;
  const profileTabs = [
    { id: "account" as const, label: "Account", icon: Users },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "preferences" as const, label: "Preferences", icon: Settings },
  ];

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => up("photo")(String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveAccount = () => {
    const checked = validateForm(profileAccountSchema, form);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    setUser((u) =>
      u
        ? {
            ...u,
            name: checked.data.name,
            email: checked.data.email,
            phone: (checked.data.phone as string | null | undefined) ?? undefined,
            photo: checked.data.photo || undefined,
          }
        : u
    );
    toast.success("Profile updated successfully");
  };

  const saveSecurity = async () => {
    const checked = validateForm(changePasswordFormSchema, {
      currentPassword: security.current,
      newPassword: security.next,
      confirmPassword: security.confirm,
    });
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }

    try {
      if (API_ENABLED) {
        await authService.changePassword(checked.data.currentPassword, checked.data.newPassword);
      } else {
        const demo = DEMO_USERS.find(
          u => u.email.toLowerCase() === user.email.toLowerCase()
        );
        if (!demo || demo.password !== security.current) {
          toast.error("Current password is incorrect");
          return;
        }
      }
      setSecurity({ current: "", next: "", confirm: "" });
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password");
    }
  };

  const savePrefs = () => toast.success("Preferences saved");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden border border-border flex flex-col">
        {/* Header banner */}
        <div
          className="px-6 pt-6 pb-5 border-b border-border shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,58,92,0.08) 0%, rgba(200,125,26,0.05) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
              ) : (
                <AvatarChip name={form.name || user.name} size="lg" />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {form.name || user.name}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {form.email}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: `${tint}1a`, color: tint }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: tint }}
                  />
                  {ROLES[user.role].label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-6 pt-4 pb-0 border-b border-border shrink-0">
            <div className="flex gap-1">
              {profileTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                    tab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {tab === "account" && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Account details
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Update your name, contact info, and profile photo.
                  </p>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/10">
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <AvatarChip name={form.name} size="lg" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Profile photo
                    </p>
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary border border-border cursor-pointer hover:bg-secondary/70">
                        <Camera size={12} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhoto}
                        />
                      </label>
                      {form.photo && (
                        <button
                          type="button"
                          onClick={() => up("photo")("")}
                          className="text-xs text-muted-foreground hover:text-red-500 px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full name">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => up("name")(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Phone">
                    <input
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) => up("phone")(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Email address">
                      <input
                        className={inputCls}
                        type="email"
                        value={form.email}
                        onChange={(e) => up("email")(e.target.value)}
                      />
                    </FormField>
                  </div>
                  <FormField label="Role">
                    <input
                      className={`${inputCls} bg-muted/40 cursor-not-allowed`}
                      value={ROLES[user.role].label}
                      readOnly
                    />
                  </FormField>
                  <FormField label="Access level">
                    <input
                      className={`${inputCls} bg-muted/40 cursor-not-allowed`}
                      value={ROLES[user.role].access}
                      readOnly
                    />
                  </FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <Btn onClick={saveAccount}>
                    <CheckCircle2 size={14} /> Save changes
                  </Btn>
                </div>
              </div>
            )}

            {tab === "security" && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Password & security
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Change your password to keep your account secure.
                  </p>
                </div>
                <FormField label="Current password">
                  <input
                    className={inputCls}
                    type="password"
                    value={security.current}
                    onChange={(e) =>
                      setSecurity((s) => ({ ...s, current: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </FormField>
                <FormField label="New password">
                  <input
                    className={inputCls}
                    type="password"
                    value={security.next}
                    onChange={(e) =>
                      setSecurity((s) => ({ ...s, next: e.target.value }))
                    }
                    placeholder="Min. 6 characters"
                  />
                </FormField>
                <FormField label="Confirm new password">
                  <input
                    className={inputCls}
                    type="password"
                    value={security.confirm}
                    onChange={(e) =>
                      setSecurity((s) => ({ ...s, confirm: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </FormField>
                <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed">
                  Use a strong password with letters and numbers. Demo accounts
                  use fixed credentials for sign-in.
                </div>
                <div className="flex justify-end pt-2">
                  <Btn onClick={saveSecurity}>
                    <Lock size={14} /> Update password
                  </Btn>
                </div>
              </div>
            )}

            {tab === "preferences" && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Notifications & display
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Control alerts and how information appears in the app.
                  </p>
                </div>
                {[
                  {
                    key: "emailNotifs" as const,
                    label: "Email notifications",
                    desc: "Receive updates by email",
                  },
                  {
                    key: "feeReminders" as const,
                    label: "Fee due reminders",
                    desc: "Alerts when student fees are overdue",
                  },
                  {
                    key: "admissionAlerts" as const,
                    label: "New admission alerts",
                    desc: "Notify when a student is enrolled",
                  },
                  {
                    key: "compactTables" as const,
                    label: "Compact table rows",
                    desc: "Show more rows with tighter spacing",
                  },
                ].map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[key]}
                      onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                        prefs[key] ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          prefs[key] ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </label>
                ))}
                <FormField label="Date format">
                  <select
                    className={selectCls}
                    value={prefs.dateFormat}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, dateFormat: e.target.value }))
                    }
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </FormField>
                <div className="flex justify-end pt-2">
                  <Btn onClick={savePrefs}>
                    <CheckCircle2 size={14} /> Save preferences
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
