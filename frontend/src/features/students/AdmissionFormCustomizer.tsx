import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  FormInput,
  FileText,
  ChevronUp,
  ChevronDown,
  Sparkles,
  GripVertical,
} from "lucide-react";
import type { AdmissionFormConfig, AdmissionCustomField, AdmissionDocumentSlot } from "@/types/admissionForm";
import { Btn, Card, FormField, inputCls, selectCls } from "@/components/shared";
import { API_ENABLED } from "@/api/config";
import { settingsService } from "@/api/services/settings.service";
import { ApiError } from "@/api/client";
import { AdmissionFormPreview } from "./AdmissionFormPreview";

function newFieldId() {
  return `fld-${Date.now().toString(36)}`;
}

function newSlotId() {
  return `doc-${Date.now().toString(36)}`;
}

const FIELD_TEMPLATES: Omit<AdmissionCustomField, "id">[] = [
  { label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], required: false },
  { label: "Nationality", type: "text", placeholder: "e.g. Indian", required: false },
  { label: "Religion", type: "text", placeholder: "Optional", required: false },
  { label: "Emergency Contact", type: "text", placeholder: "Name & phone", required: false },
  { label: "Previous School", type: "text", placeholder: "School / college name", required: false },
];

const DOC_TEMPLATES: Omit<AdmissionDocumentSlot, "id">[] = [
  { label: "Aadhaar Card", description: "Government ID proof", required: true, accept: "image/*,application/pdf" },
  { label: "Previous Marksheet", description: "Latest academic record", required: false, accept: "image/*,application/pdf" },
  { label: "Transfer Certificate", description: "If applicable", required: false, accept: "image/*,application/pdf" },
  { label: "Birth Certificate", description: "Date of birth proof", required: false, accept: "image/*,application/pdf" },
];

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function AdmissionFormCustomizer({
  config,
  onSave,
  onCancel,
}: {
  config: AdmissionFormConfig;
  onSave: (config: AdmissionFormConfig) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<AdmissionFormConfig>(structuredClone(config));
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"fields" | "documents">("fields");
  const [newFieldName, setNewFieldName] = useState("");
  const [newDocName, setNewDocName] = useState("");

  const updateField = (id: string, patch: Partial<AdmissionCustomField>) => {
    setDraft(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const updateSlot = (id: string, patch: Partial<AdmissionDocumentSlot>) => {
    setDraft(prev => ({
      ...prev,
      documentSlots: prev.documentSlots.map(s => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const addField = (template?: Omit<AdmissionCustomField, "id">, customName?: string) => {
    const label = (customName ?? template?.label ?? "").trim();
    if (!label && !template) {
      toast.error("Enter a field name first");
      return;
    }
    const field: AdmissionCustomField = {
      id: newFieldId(),
      label: label || template?.label || "New Field",
      placeholder: template?.placeholder ?? "",
      type: template?.type ?? "text",
      required: template?.required ?? false,
      options: template?.options,
    };
    if (draft.customFields.some(f => f.label.toLowerCase() === field.label.toLowerCase())) {
      toast.error(`A field named "${field.label}" already exists`);
      return;
    }
    setDraft(prev => ({ ...prev, customFields: [...prev.customFields, field] }));
    setNewFieldName("");
  };

  const addSlot = (template?: Omit<AdmissionDocumentSlot, "id">, customName?: string) => {
    const label = (customName ?? template?.label ?? "").trim();
    if (!label && !template) {
      toast.error("Enter a document name first");
      return;
    }
    const slot: AdmissionDocumentSlot = {
      id: newSlotId(),
      label: label || template?.label || "New Document",
      description: template?.description ?? "",
      required: template?.required ?? false,
      accept: template?.accept ?? "image/*,application/pdf",
    };
    if (draft.documentSlots.some(s => s.label.toLowerCase() === slot.label.toLowerCase())) {
      toast.error(`A document named "${slot.label}" already exists`);
      return;
    }
    setDraft(prev => ({ ...prev, documentSlots: [...prev.documentSlots, slot] }));
    setNewDocName("");
  };

  const handleAddNamedField = () => addField(undefined, newFieldName);
  const handleAddNamedDoc = () => addSlot(undefined, newDocName);

  const handleSave = async () => {
    const duplicateField = draft.customFields.filter(
      (f, i, arr) => arr.findIndex(x => x.label.toLowerCase() === f.label.toLowerCase()) !== i
    );
    if (duplicateField.length) {
      toast.error("Each custom field needs a unique name");
      return;
    }
    const emptyLabel =
      draft.customFields.find(f => !f.label.trim()) ||
      draft.documentSlots.find(s => !s.label.trim());
    if (emptyLabel) {
      toast.error("Every field and document needs a label");
      return;
    }
    setSaving(true);
    try {
      if (API_ENABLED) {
        const saved = await settingsService.updateAdmissionForm(draft);
        onSave(saved);
      } else {
        onSave(draft);
      }
      toast.success("Admission form saved for all staff");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const sectionTabCls = (active: boolean) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-card border border-border text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Form builder</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add extra questions and document uploads — changes apply institute-wide
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-background border border-border text-muted-foreground">
                  {draft.customFields.length} custom field{draft.customFields.length !== 1 ? "s" : ""}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-background border border-border text-muted-foreground">
                  {draft.documentSlots.length} document{draft.documentSlots.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="px-5 py-3 border-b border-border flex flex-wrap gap-2">
              <button type="button" className={sectionTabCls(section === "fields")} onClick={() => setSection("fields")}>
                <span className="inline-flex items-center gap-1.5">
                  <FormInput size={14} /> Custom fields
                </span>
              </button>
              <button type="button" className={sectionTabCls(section === "documents")} onClick={() => setSection("documents")}>
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={14} /> Document uploads
                </span>
              </button>
            </div>

            <div className="p-5">
              {section === "fields" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
                    <p className="text-sm font-semibold text-foreground mb-1">Add your own field</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Type any name you want — it will appear on the admission form
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        className={inputCls}
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddNamedField(); } }}
                        placeholder="e.g. Caste, Mother tongue, Referral source…"
                      />
                      <Btn onClick={handleAddNamedField} className="shrink-0 sm:min-w-[120px]">
                        <Plus size={14} /> Add field
                      </Btn>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-3 bg-muted/20">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-primary" /> Or quick add a preset
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {FIELD_TEMPLATES.map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => addField(t)}
                          className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors"
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {draft.customFields.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                      <FormInput size={28} className="mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground">No custom fields yet</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Type a field name above and click Add field
                      </p>
                      <Btn size="sm" variant="secondary" onClick={() => newFieldName.trim() ? handleAddNamedField() : toast.error("Enter a field name first")}>
                        <Plus size={13} /> Add first field
                      </Btn>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draft.customFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="rounded-xl border border-border bg-background overflow-hidden"
                        >
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                            <GripVertical size={14} className="text-muted-foreground/50 shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                              {field.label.trim() || <span className="text-muted-foreground italic">Unnamed field</span>}
                            </span>
                            <div className="ml-auto flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => setDraft(p => ({ ...p, customFields: moveItem(p.customFields, index, -1) }))}
                                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 text-muted-foreground"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={index === draft.customFields.length - 1}
                                onClick={() => setDraft(p => ({ ...p, customFields: moveItem(p.customFields, index, 1) }))}
                                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 text-muted-foreground"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraft(p => ({
                                  ...p,
                                  customFields: p.customFields.filter(f => f.id !== field.id),
                                }))}
                                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 ml-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Field name *">
                              <input
                                className={inputCls}
                                value={field.label}
                                onChange={e => updateField(field.id, { label: e.target.value })}
                                placeholder="Name shown on the admission form"
                              />
                            </FormField>
                            <FormField label="Input type">
                              <select
                                className={selectCls}
                                value={field.type}
                                onChange={e => updateField(field.id, { type: e.target.value as AdmissionCustomField["type"] })}
                              >
                                <option value="text">Short text</option>
                                <option value="textarea">Long text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="select">Dropdown list</option>
                              </select>
                            </FormField>
                            <FormField label="Placeholder hint">
                              <input
                                className={inputCls}
                                value={field.placeholder ?? ""}
                                onChange={e => updateField(field.id, { placeholder: e.target.value })}
                                placeholder="Shown inside the empty field"
                              />
                            </FormField>
                            <FormField label="Required?">
                              <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/20 text-sm">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={e => updateField(field.id, { required: e.target.checked })}
                                  className="rounded border-border"
                                />
                                Staff must fill this before enrolling
                              </label>
                            </FormField>
                            {field.type === "select" && (
                              <div className="sm:col-span-2">
                                <FormField label="Dropdown options (comma-separated)">
                                  <input
                                    className={inputCls}
                                    value={(field.options ?? []).join(", ")}
                                    onChange={e => updateField(field.id, {
                                      options: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                                    })}
                                    placeholder="Option A, Option B, Option C"
                                  />
                                </FormField>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => newFieldName.trim() ? handleAddNamedField() : toast.info("Type a field name in the box above")}
                        className="w-full border border-dashed border-border"
                      >
                        <Plus size={13} /> Add another field
                      </Btn>
                    </div>
                  )}
                </div>
              )}

              {section === "documents" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
                    <p className="text-sm font-semibold text-foreground mb-1">Add your own document</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Name the document students must upload during admission
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        className={inputCls}
                        value={newDocName}
                        onChange={e => setNewDocName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddNamedDoc(); } }}
                        placeholder="e.g. Income certificate, Passport copy…"
                      />
                      <Btn onClick={handleAddNamedDoc} className="shrink-0 sm:min-w-[140px]">
                        <Plus size={14} /> Add document
                      </Btn>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-3 bg-muted/20">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-primary" /> Or quick add a preset
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DOC_TEMPLATES.map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => addSlot(t)}
                          className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors"
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {draft.documentSlots.map((slot, index) => (
                      <div key={slot.id} className="rounded-xl border border-border bg-background overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                          <GripVertical size={14} className="text-muted-foreground/50 shrink-0" />
                          <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                            {slot.label.trim() || <span className="text-muted-foreground italic">Unnamed document</span>}
                          </span>
                          <div className="ml-auto flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => setDraft(p => ({ ...p, documentSlots: moveItem(p.documentSlots, index, -1) }))}
                              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 text-muted-foreground"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={index === draft.documentSlots.length - 1}
                              onClick={() => setDraft(p => ({ ...p, documentSlots: moveItem(p.documentSlots, index, 1) }))}
                              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 text-muted-foreground"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft(p => ({
                                ...p,
                                documentSlots: p.documentSlots.filter(s => s.id !== slot.id),
                              }))}
                              className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 ml-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField label="Document name *">
                            <input
                              className={inputCls}
                              value={slot.label}
                              onChange={e => updateSlot(slot.id, { label: e.target.value })}
                              placeholder="Name shown on the upload form"
                            />
                          </FormField>
                          <FormField label="Required at admission?">
                            <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/20 text-sm">
                              <input
                                type="checkbox"
                                checked={slot.required}
                                onChange={e => updateSlot(slot.id, { required: e.target.checked })}
                                className="rounded border-border"
                              />
                              Cannot enroll without this file
                            </label>
                          </FormField>
                          <div className="sm:col-span-2">
                            <FormField label="Help text for staff">
                              <input
                                className={inputCls}
                                value={slot.description ?? ""}
                                onChange={e => updateSlot(slot.id, { description: e.target.value })}
                                placeholder="e.g. Government ID proof — PDF or photo"
                              />
                            </FormField>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => newDocName.trim() ? handleAddNamedDoc() : toast.info("Type a document name in the box above")}
                      className="w-full border border-dashed border-border"
                    >
                      <Plus size={13} /> Add document slot
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3 py-2 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
            <p className="text-xs text-muted-foreground">
              Saved layout is used by all admin & staff when admitting students
            </p>
            <div className="flex gap-2 shrink-0">
              <Btn variant="secondary" onClick={onCancel} disabled={saving}>Discard</Btn>
              <Btn onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save form layout"}
              </Btn>
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <AdmissionFormPreview config={draft} />
        </div>
      </div>
    </div>
  );
}

export default AdmissionFormCustomizer;
