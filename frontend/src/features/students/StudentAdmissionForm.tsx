import { useState, ChangeEvent, ReactNode } from "react";
import { toast } from "sonner";
import {
  Camera,
  Trash2,
  BadgeCheck,
  Loader2,
  User,
  GraduationCap,
  Users,
  FileUp,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { Student, Course, Batch } from "@/types";
import type { AdmissionFormConfig } from "@/types/admissionForm";
import {
  FormField,
  Btn,
  AvatarChip as Avatar,
  Card,
  inputCls,
  selectCls,
} from "@/components/shared";
import { TODAY } from "@/lib/utils";
import { studentFormSchema } from "@/lib/validation/student";
import { validateForm } from "@/lib/validation/formErrors";

type DocumentFiles = Record<string, File>;

function SectionBlock({
  icon,
  title,
  description,
  children,
  step,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  step: number;
}) {
  return (
    <div className="relative pl-0 sm:pl-4">
      <div className="flex items-start gap-3 mb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold">
          {step}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function StudentAdmissionForm({
  courses,
  batches,
  admissionForm,
  onSave,
  onCancel,
  saving = false,
  initial,
}: {
  courses: Course[];
  batches: Batch[];
  admissionForm: AdmissionFormConfig;
  onSave: (
    data: Omit<Student, "id">,
    photoFile?: File | null,
    documentFiles?: DocumentFiles
  ) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  initial?: Student;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    dob: initial?.dob ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    course: initial?.course ?? "",
    batch: initial?.batch ?? "",
    guardian: initial?.guardian ?? "",
    guardianPhone: initial?.guardianPhone ?? "",
    status: initial?.status ?? "Active",
    grade: initial?.grade ?? "-",
    admissionDate: initial?.admissionDate ?? TODAY,
    feesTotal: initial?.feesTotal ?? 0,
    feesPaid: initial?.feesPaid ?? 0,
    photo: initial?.photo ?? "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, string>>(
    initial?.extraData?.customFields ?? {}
  );
  const [documentFiles, setDocumentFiles] = useState<DocumentFiles>({});

  const up = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setF(prev => ({ ...prev, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleDocument = (slotId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document must be smaller than 5 MB");
      return;
    }
    setDocumentFiles(prev => ({ ...prev, [slotId]: file }));
  };

  const handleSave = async () => {
    for (const field of admissionForm.customFields) {
      if (field.required && !customValues[field.id]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }
    for (const slot of admissionForm.documentSlots) {
      if (slot.required && !documentFiles[slot.id] && !initial) {
        toast.error(`${slot.label} is required`);
        return;
      }
    }

    const payload = {
      ...f,
      feesTotal: initial ? f.feesTotal : (courses.find(c => c.name === f.course)?.fees ?? 0),
      feesPaid: initial ? f.feesPaid : 0,
      extraData: {
        customFields: Object.keys(customValues).length ? customValues : undefined,
      },
    };
    const checked = validateForm(studentFormSchema, payload);
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    onSave({ ...checked.data, extraData: payload.extraData }, photoFile, documentFiles);
  };

  const totalSteps = 3 + (admissionForm.customFields.length > 0 ? 1 : 0) + (admissionForm.documentSlots.length > 0 && !initial ? 1 : 0);
  let stepNum = 0;

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/[0.06] to-transparent">
          <p className="text-xs text-muted-foreground">
            {totalSteps} sections · All fields marked <span className="text-red-500">*</span> are required
          </p>
        </div>

        <div className="p-6 space-y-10">
          <SectionBlock
            step={++stepNum}
            icon={<User size={15} />}
            title="Personal details"
            description="Student identity and contact information"
          >
            <div className="flex flex-col lg:flex-row gap-6 mb-6 p-4 rounded-xl bg-muted/25 border border-border/60">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <Avatar name={f.name || "Student"} size="lg" src={f.photo || undefined} />
                <div className="flex gap-2">
                  <label className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all ${saving ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
                    <Camera size={13} /> {f.photo ? "Change" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={saving} />
                  </label>
                  {f.photo && (
                    <button
                      type="button"
                      onClick={() => { up("photo")(""); setPhotoFile(null); }}
                      disabled={saving}
                      className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground text-center lg:text-left">JPG/PNG, max 2 MB</p>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Full name *">
                  <input className={inputCls} value={f.name} onChange={e => up("name")(e.target.value)} placeholder="As per official records" />
                </FormField>
                <FormField label="Date of birth *">
                  <input className={inputCls} type="date" value={f.dob} onChange={e => up("dob")(e.target.value)} />
                </FormField>
                <FormField label="Phone *">
                  <input className={inputCls} value={f.phone} onChange={e => up("phone")(e.target.value)} placeholder="10-digit mobile" />
                </FormField>
                <FormField label="Email">
                  <input className={inputCls} type="email" value={f.email} onChange={e => up("email")(e.target.value)} placeholder="student@email.com" />
                </FormField>
                <div className="sm:col-span-2 lg:col-span-2">
                  <FormField label="Address *">
                    <input className={inputCls} value={f.address} onChange={e => up("address")(e.target.value)} placeholder="Full residential address" />
                  </FormField>
                </div>
              </div>
            </div>
          </SectionBlock>

          <div className="border-t border-border" />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <SectionBlock
              step={++stepNum}
              icon={<GraduationCap size={15} />}
              title="Course & batch"
              description="Program and enrollment date"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Course *">
                  <select className={selectCls} value={f.course} onChange={e => up("course")(e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Batch *">
                  <select className={selectCls} value={f.batch} onChange={e => up("batch")(e.target.value)}>
                    <option value="">Select batch</option>
                    {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </FormField>
                {!initial && (
                  <FormField label="Admission date *">
                    <input className={inputCls} type="date" value={f.admissionDate} onChange={e => up("admissionDate")(e.target.value)} />
                  </FormField>
                )}
                {initial && (
                  <>
                    <FormField label="Status">
                      <select className={selectCls} value={f.status} onChange={e => up("status")(e.target.value)}>
                        <option>Active</option><option>Completed</option><option>Inactive</option>
                      </select>
                    </FormField>
                    <FormField label="Grade">
                      <select className={selectCls} value={f.grade} onChange={e => up("grade")(e.target.value)}>
                        <option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option><option>-</option>
                      </select>
                    </FormField>
                  </>
                )}
              </div>
            </SectionBlock>

            <SectionBlock
              step={++stepNum}
              icon={<Users size={15} />}
              title="Guardian / parent"
              description="Emergency contact for the student"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Guardian name *">
                  <input className={inputCls} value={f.guardian} onChange={e => up("guardian")(e.target.value)} placeholder="Parent or guardian" />
                </FormField>
                <FormField label="Guardian phone *">
                  <input className={inputCls} value={f.guardianPhone} onChange={e => up("guardianPhone")(e.target.value)} placeholder="Mobile number" />
                </FormField>
              </div>
            </SectionBlock>
          </div>

          {admissionForm.customFields.length > 0 && (
            <>
              <div className="border-t border-border" />
              <SectionBlock
                step={++stepNum}
                icon={<FileUp size={15} />}
                title="Additional information"
                description="Extra details configured by your institute"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {admissionForm.customFields.map(field => (
                    <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}>
                      <FormField label={`${field.label}${field.required ? " *" : ""}`}>
                        {field.type === "textarea" ? (
                          <textarea
                            className={`${inputCls} min-h-[80px] resize-y`}
                            value={customValues[field.id] ?? ""}
                            onChange={e => setCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "select" ? (
                          <select
                            className={selectCls}
                            value={customValues[field.id] ?? ""}
                            onChange={e => setCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          >
                            <option value="">Select…</option>
                            {(field.options ?? []).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={inputCls}
                            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            value={customValues[field.id] ?? ""}
                            onChange={e => setCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                          />
                        )}
                      </FormField>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </>
          )}

          {admissionForm.documentSlots.length > 0 && !initial && (
            <>
              <div className="border-t border-border" />
              <SectionBlock
                step={++stepNum}
                icon={<Paperclip size={15} />}
                title="Upload documents"
                description="PDF or images, max 5 MB each"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {admissionForm.documentSlots.map(slot => {
                    const file = documentFiles[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          file
                            ? "border-emerald-400/60 bg-emerald-50/40"
                            : slot.required
                              ? "border-amber-200/80 bg-amber-50/30 hover:border-primary/40"
                              : "border-dashed border-border hover:border-primary/30 bg-muted/10"
                        }`}
                      >
                        {file && (
                          <CheckCircle2 size={16} className="absolute top-3 right-3 text-emerald-600" />
                        )}
                        <p className="text-sm font-semibold text-foreground pr-5">
                          {slot.label}{slot.required ? " *" : ""}
                        </p>
                        {slot.description && (
                          <p className="text-[11px] text-muted-foreground mt-1 mb-3">{slot.description}</p>
                        )}
                        {file ? (
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <p className="text-xs text-emerald-800 font-medium truncate flex-1">{file.name}</p>
                            <button
                              type="button"
                              onClick={() => setDocumentFiles(prev => {
                                const next = { ...prev };
                                delete next[slot.id];
                                return next;
                              })}
                              className="p-1 text-muted-foreground hover:text-red-500 shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <label className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-background border border-border cursor-pointer hover:bg-muted transition-colors">
                            <FileUp size={13} /> Choose file
                            <input
                              type="file"
                              accept={slot.accept ?? "image/*,application/pdf"}
                              className="hidden"
                              onChange={e => handleDocument(slot.id, e)}
                              disabled={saving}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionBlock>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {initial ? "Updates apply immediately to this student record." : "A student ID is generated automatically on enrollment."}
          </p>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
              {saving ? "Saving…" : initial ? "Save changes" : "Enroll student"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default StudentAdmissionForm;
