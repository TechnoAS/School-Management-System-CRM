import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Upload, Trash2, CheckCircle2, BadgeCheck, UserCog, Loader2 } from "lucide-react";
import { InstituteSettings } from "@/types";
import { SectionHeader, Tabs, Card, FormField, Btn, inputCls, selectCls } from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { settingsService } from "@/api/services/settings.service";
import { ApiError } from "@/api/client";
import { resolveUploadUrl } from "@/lib/uploads";
import {
  instituteSettingsSchema,
  receiptSettingsSchema,
  certificateSettingsSchema,
} from "@/lib/validation/settings";
import { validateForm } from "@/lib/validation/formErrors";

const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface SettingsPanelProps {
  settings: InstituteSettings;
  updateSettings: (patch: Partial<InstituteSettings>) => void;
}

function buildInstitutePayload(
  settings: InstituteSettings,
  logoUrl?: string
):
  | { ok: true; payload: Parameters<typeof settingsService.updateInstitute>[0] }
  | { ok: false; message: string } {
  const checked = validateForm(instituteSettingsSchema, {
    name: settings.name,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    registrationNo: settings.registrationNo,
    academicYear: settings.academicYear,
    logoUrl: logoUrl ?? settings.logoUrl,
  });
  if (!checked.ok) {
    return { ok: false, message: checked.message };
  }
  return {
    ok: true,
    payload: {
      name: checked.data.name,
      phone: (checked.data.phone as string | null) ?? undefined,
      email: (checked.data.email as string | null) ?? undefined,
      address: (checked.data.address as string | null) ?? undefined,
      registrationNo: (checked.data.registrationNo as string | null) ?? undefined,
      academicYear: checked.data.academicYear ?? undefined,
      logoUrl: logoUrl ?? checked.data.logoUrl ?? "",
    },
  };
}

export function SettingsPanel({ settings, updateSettings }: SettingsPanelProps) {
  const [tab, setTab] = useState("institute");
  const [logoUploading, setLogoUploading] = useState(false);

  const displayLogo = resolveUploadUrl(settings.logoUrl);

  const handleSave = async (section: string) => {
    try {
      if (section === "Institute") {
        const built = buildInstitutePayload(settings);
        if (!built.ok) {
          toast.error(built.message);
          return;
        }
        if (API_ENABLED) {
          const saved = await settingsService.updateInstitute(built.payload);
          updateSettings(saved);
        } else {
          updateSettings({
            name: built.payload.name!,
            phone: built.payload.phone ?? "",
            email: built.payload.email ?? "",
            address: built.payload.address ?? "",
            registrationNo: built.payload.registrationNo ?? "",
            academicYear: built.payload.academicYear ?? settings.academicYear,
            logoUrl: built.payload.logoUrl,
          });
        }
      } else if (section === "Receipt") {
        const checked = validateForm(receiptSettingsSchema, settings.receipt);
        if (!checked.ok) {
          toast.error(checked.message);
          return;
        }
        const receiptPayload = {
          ...settings.receipt,
          ...checked.data,
          footerText: checked.data.footerText ?? "",
        };
        if (API_ENABLED) await settingsService.updateReceipt(receiptPayload);
        updateSettings({ receipt: receiptPayload });
      } else if (section === "Certificate") {
        const checked = validateForm(certificateSettingsSchema, settings.certificate);
        if (!checked.ok) {
          toast.error(checked.message);
          return;
        }
        const certificatePayload = {
          ...settings.certificate,
          ...checked.data,
          bodyText: checked.data.bodyText ?? "",
        };
        if (API_ENABLED) await settingsService.updateCertificate(certificatePayload);
        updateSettings({ certificate: certificatePayload });
      }
      toast.success(`${section} settings saved successfully.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    }
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      toast.error("Use PNG, JPG, or WEBP (SVG is not supported)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2 MB");
      return;
    }

    if (API_ENABLED) {
      const built = buildInstitutePayload(settings);
      if (!built.ok) {
        toast.error(built.message);
        return;
      }
      setLogoUploading(true);
      try {
        const saved = await settingsService.updateInstitute(
          { ...built.payload, logoUrl: undefined },
          file
        );
        updateSettings(saved);
        toast.success("Logo updated");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to upload logo");
      } finally {
        setLogoUploading(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ logoUrl: String(reader.result) });
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (API_ENABLED) {
      const built = buildInstitutePayload(settings, "");
      if (!built.ok) {
        toast.error(built.message);
        return;
      }
      setLogoUploading(true);
      try {
        const saved = await settingsService.updateInstitute(built.payload);
        updateSettings(saved);
        toast.success("Logo removed");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to remove logo");
      } finally {
        setLogoUploading(false);
      }
      return;
    }
    updateSettings({ logoUrl: "" });
    toast.success("Logo removed");
  };

  const { receipt, certificate } = settings;

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Configure institute information and system preferences" />
      <Tabs
        tabs={[
          { id: "institute", label: "Institute" },
          { id: "receipt", label: "Receipt Format" },
          { id: "certificate", label: "Certificate" },
          { id: "roles", label: "User Roles" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "institute" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-3 overflow-hidden">
              {displayLogo ? (
                <img src={displayLogo} alt="Institute logo" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap size={32} className="text-white" />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Institute Logo</p>
            <p className="text-xs text-muted-foreground mb-3">PNG, JPG or WEBP, max 2 MB</p>
            <label
              className={`flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground transition-colors ${
                logoUploading ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-muted/30"
              }`}
            >
              {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {logoUploading ? "Uploading…" : displayLogo ? "Change logo" : "Upload new logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={logoUploading}
                onChange={handleLogo}
              />
            </label>
            {displayLogo && (
              <button
                onClick={handleRemoveLogo}
                disabled={logoUploading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors mt-2 bg-transparent border-0 cursor-pointer"
              >
                <Trash2 size={11} /> Remove logo
              </button>
            )}
          </Card>
          <Card className="lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Institute Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Institute Name">
                  <input
                    className={inputCls}
                    value={settings.name}
                    onChange={e => updateSettings({ name: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Phone">
                <input
                  className={inputCls}
                  value={settings.phone}
                  onChange={e => updateSettings({ phone: e.target.value })}
                />
              </FormField>
              <FormField label="Email">
                <input
                  className={inputCls}
                  type="email"
                  value={settings.email}
                  onChange={e => updateSettings({ email: e.target.value })}
                />
              </FormField>
              <div className="col-span-2">
                <FormField label="Address">
                  <input
                    className={inputCls}
                    value={settings.address}
                    onChange={e => updateSettings({ address: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Registration Number">
                <input
                  className={inputCls}
                  value={settings.registrationNo}
                  onChange={e => updateSettings({ registrationNo: e.target.value })}
                />
              </FormField>
              <FormField label="Academic Year">
                <input
                  className={inputCls}
                  value={settings.academicYear}
                  onChange={e => updateSettings({ academicYear: e.target.value })}
                />
              </FormField>
            </div>
            <div className="flex justify-end mt-4">
              <Btn onClick={() => handleSave("Institute")}>
                <CheckCircle2 size={14} /> Save Changes
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "receipt" && (
        <Card className="p-5 max-w-2xl">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Receipt Format</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Receipt Prefix">
              <input
                className={inputCls}
                value={receipt.prefix}
                onChange={e => updateSettings({ receipt: { ...receipt, prefix: e.target.value } })}
              />
            </FormField>
            <FormField label="Starting Number">
              <input
                className={inputCls}
                type="number"
                value={receipt.startingNumber}
                onChange={e =>
                  updateSettings({ receipt: { ...receipt, startingNumber: e.target.value } })
                }
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Footer Text">
                <input
                  className={inputCls}
                  value={receipt.footerText}
                  onChange={e =>
                    updateSettings({ receipt: { ...receipt, footerText: e.target.value } })
                  }
                />
              </FormField>
            </div>
            <FormField label="Show Logo">
              <select
                className={selectCls}
                value={receipt.showLogo}
                onChange={e =>
                  updateSettings({ receipt: { ...receipt, showLogo: e.target.value } })
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </FormField>
            <FormField label="Print Format">
              <select
                className={selectCls}
                value={receipt.printFormat}
                onChange={e =>
                  updateSettings({ receipt: { ...receipt, printFormat: e.target.value } })
                }
              >
                <option>A4</option>
                <option>Half Page</option>
                <option>Thermal (80mm)</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end mt-4">
            <Btn onClick={() => handleSave("Receipt")}>
              <CheckCircle2 size={14} /> Save
            </Btn>
          </div>
        </Card>
      )}

      {tab === "certificate" && (
        <Card className="p-5 max-w-2xl">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Certificate Format</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Certificate Prefix">
              <input
                className={inputCls}
                value={certificate.prefix}
                onChange={e =>
                  updateSettings({ certificate: { ...certificate, prefix: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Authorised By">
              <input
                className={inputCls}
                value={certificate.authorisedBy}
                onChange={e =>
                  updateSettings({ certificate: { ...certificate, authorisedBy: e.target.value } })
                }
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Certificate Body">
                <textarea
                  rows={3}
                  value={certificate.bodyText}
                  onChange={e =>
                    updateSettings({ certificate: { ...certificate, bodyText: e.target.value } })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground bg-transparent"
                />
              </FormField>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Btn onClick={() => handleSave("Certificate")}>
              <CheckCircle2 size={14} /> Save
            </Btn>
          </div>
        </Card>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: "Admin",
              color: "bg-primary",
              icon: BadgeCheck,
              desc: "Full system access",
              permissions: [
                "Full system access",
                "User & role management",
                "Settings configuration",
                "All reports & exports",
                "Financial data access",
                "Certificate issuance",
              ],
            },
            {
              role: "Staff",
              color: "bg-amber-600",
              icon: UserCog,
              desc: "Student & Fee Management",
              permissions: [
                "Student management",
                "Fee collection",
                "Batch management",
                "Attendance marking",
                "Basic report access",
              ],
            },
            {
              role: "Faculty",
              color: "bg-emerald-600",
              icon: GraduationCap,
              desc: "Attendance & Marks Entry",
              permissions: [
                "Attendance entry",
                "Marks entry",
                "View assigned batches",
                "View student profiles",
                "Limited report access",
              ],
            },
          ].map(({ role, color, icon: Icon, desc, permissions }) => (
            <Card key={role} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{role}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {permissions.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={11} className="text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
