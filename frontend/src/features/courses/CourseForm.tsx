import { useState, useEffect, useMemo, useRef, ReactNode } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileUp,
  IndianRupee,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { Course, CourseMaterial } from "@/types";
import {
  FormField,
  Btn,
  Card,
  inputCls,
  selectCls,
  ImageCropDialog,
} from "@/components/shared";
import { TODAY } from "@/lib/utils";
import { computeDurationFromDates } from "@/lib/duration";
import { courseFormSchema } from "@/lib/validation/course";
import { validateForm } from "@/lib/validation/formErrors";
import { blobToFile, readFileAsDataUrl } from "@/lib/imageCrop";
import { CourseBrandingPanel, HiddenImageInput } from "./CourseBrandingPanel";

type PendingMaterial = { id: string; title: string; file: File };
type CropKind = "banner" | "logo";

const BANNER_OUTPUT_W = 1200;
const LOGO_OUTPUT_W = 400;

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6 border-border/80 shadow-sm">
      <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}

export function CourseForm({
  initial,
  onSave,
  onCancel,
  saving = false,
  onUploadLogo,
  onUploadBanner,
  onUploadMaterial,
  onRemoveMaterial,
}: {
  initial?: Course;
  onSave: (
    data: Omit<Course, "id" | "batches" | "enrolled">,
    files?: { logo?: File | null; banner?: File | null; materials?: PendingMaterial[] }
  ) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  onUploadLogo?: (file: File) => Promise<void>;
  onUploadBanner?: (file: File) => Promise<void>;
  onUploadMaterial?: (file: File, title: string) => Promise<void>;
  onRemoveMaterial?: (materialId: string) => Promise<void>;
}) {
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  }, []);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState({
    name: initial?.name ?? "",
    startDate: initial?.startDate ?? TODAY,
    endDate: initial?.endDate ?? defaultEnd,
    fees: String(initial?.fees ?? ""),
    description: initial?.description ?? "",
    status: initial?.status ?? "Active",
    logo: initial?.logo ?? "",
    banner: initial?.banner ?? "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerRaw, setBannerRaw] = useState(initial?.banner ?? "");
  const [logoRaw, setLogoRaw] = useState(initial?.logo ?? "");
  const [cropKind, setCropKind] = useState<CropKind | null>(null);
  const [cropSource, setCropSource] = useState("");
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");
  const [existingMaterials, setExistingMaterials] = useState<CourseMaterial[]>(
    initial?.extraData?.materials ?? []
  );

  useEffect(() => {
    setExistingMaterials(initial?.extraData?.materials ?? []);
  }, [initial?.extraData?.materials]);

  const up = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const computedDuration = computeDurationFromDates(f.startDate, f.endDate);

  const openCrop = (kind: CropKind, source: string) => {
    setCropKind(kind);
    setCropSource(source);
  };

  const handleRawImage = async (kind: CropKind, file: File, maxMb: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxMb} MB`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    if (kind === "banner") setBannerRaw(dataUrl);
    else setLogoRaw(dataUrl);
    openCrop(kind, dataUrl);
  };

  const applyCrop = async (kind: CropKind, blob: Blob, previewUrl: string) => {
    const file = blobToFile(blob, kind === "banner" ? "course-banner.jpg" : "course-logo.jpg");
    if (kind === "banner") {
      setBannerFile(file);
      setF(prev => ({ ...prev, banner: previewUrl }));
      if (initial && onUploadBanner) {
        try {
          await onUploadBanner(file);
        } catch {
          toast.error("Banner upload failed");
        }
      }
    } else {
      setLogoFile(file);
      setF(prev => ({ ...prev, logo: previewUrl }));
      if (initial && onUploadLogo) {
        try {
          await onUploadLogo(file);
        } catch {
          toast.error("Logo upload failed");
        }
      }
    }
    setCropKind(null);
    setCropSource("");
    toast.success(kind === "banner" ? "Banner updated" : "Logo updated");
  };

  const removeBanner = () => {
    setF(prev => ({ ...prev, banner: "" }));
    setBannerFile(null);
    setBannerRaw("");
  };

  const removeLogo = () => {
    setF(prev => ({ ...prev, logo: "" }));
    setLogoFile(null);
    setLogoRaw("");
  };

  const handleMaterialPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be smaller than 10 MB");
      return;
    }
    const title = materialTitle.trim() || file.name.replace(/\.[^.]+$/, "");
    if (initial && onUploadMaterial) {
      onUploadMaterial(file, title)
        .then(() => {
          toast.success(`"${title}" uploaded`);
          setMaterialTitle("");
        })
        .catch(() => toast.error("Material upload failed"));
      return;
    }
    setPendingMaterials(prev => [...prev, { id: `pending_${Date.now()}`, title, file }]);
    setMaterialTitle("");
  };

  const handleSave = async () => {
    const checked = validateForm(courseFormSchema, {
      name: f.name,
      startDate: f.startDate,
      endDate: f.endDate,
      fees: f.fees,
      description: f.description,
      status: f.status as "Active" | "Inactive",
    });
    if (!checked.ok) {
      toast.error(checked.message);
      return;
    }
    await onSave(
      {
        name: checked.data.name,
        duration: checked.data.duration,
        startDate: checked.data.startDate,
        endDate: checked.data.endDate,
        fees: checked.data.fees,
        description: checked.data.description ?? "",
        status: checked.data.status,
        logo: f.logo || undefined,
        banner: f.banner || undefined,
        extraData: existingMaterials.length ? { materials: existingMaterials } : undefined,
      },
      { logo: logoFile, banner: bannerFile, materials: pendingMaterials }
    );
  };

  return (
    <div className="w-full pb-4">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,340px)_1fr] gap-6 items-start">
        {/* Branding sidebar */}
        <div className="xl:sticky xl:top-4 space-y-3">
          <CourseBrandingPanel
            name={f.name}
            banner={f.banner}
            logo={f.logo}
            saving={saving}
            onPickBanner={() => bannerInputRef.current?.click()}
            onPickLogo={() => logoInputRef.current?.click()}
            onAdjustBanner={() => openCrop("banner", bannerRaw || f.banner)}
            onAdjustLogo={() => openCrop("logo", logoRaw || f.logo)}
            onRemoveBanner={removeBanner}
            onRemoveLogo={removeLogo}
          />
          <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
            Upload images, then use <strong className="font-medium text-foreground">Crop & move</strong> to
            drag, zoom, and frame the perfect shot before saving.
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-5 min-w-0">
          <SectionCard
            icon={<BookOpen size={18} />}
            title="Course details"
            description="Name, fees, description, and status"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Course name *">
                  <input
                    className={inputCls}
                    value={f.name}
                    onChange={e => up("name")(e.target.value)}
                    placeholder="e.g. Full Stack Web Development"
                  />
                </FormField>
              </div>
              <FormField label="Course fees (₹) *">
                <input
                  className={inputCls}
                  type="number"
                  value={f.fees}
                  onChange={e => up("fees")(e.target.value)}
                  placeholder="25000"
                />
              </FormField>
              <FormField label="Status">
                <select className={selectCls} value={f.status} onChange={e => up("status")(e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Description">
                  <textarea
                    rows={4}
                    value={f.description}
                    onChange={e => up("description")(e.target.value)}
                    placeholder="Course description, syllabus overview, and topics covered…"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[100px]"
                  />
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Calendar size={18} />}
            title="Schedule"
            description="Duration is calculated automatically from start and end dates"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Start date *">
                <input
                  className={inputCls}
                  type="date"
                  value={f.startDate}
                  onChange={e => up("startDate")(e.target.value)}
                />
              </FormField>
              <FormField label="End date *">
                <input
                  className={inputCls}
                  type="date"
                  value={f.endDate}
                  onChange={e => up("endDate")(e.target.value)}
                />
              </FormField>
              <FormField label="Duration">
                <div className="flex items-center h-[38px] px-3 rounded-lg bg-primary/5 border border-primary/15 text-sm font-semibold text-primary">
                  {computedDuration || "—"}
                </div>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Paperclip size={18} />}
            title="Study materials"
            description="Syllabus, notes, PDFs — max 10 MB each"
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                className={`${inputCls} flex-1`}
                value={materialTitle}
                onChange={e => setMaterialTitle(e.target.value)}
                placeholder="Document title (e.g. Syllabus, Module 1 Notes)"
              />
              <label
                className={`inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 ${saving ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
              >
                <FileUp size={14} /> Add file
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleMaterialPick}
                  disabled={saving}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {existingMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mat.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{mat.fileName}</p>
                  </div>
                  {onRemoveMaterial && (
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveMaterial(mat.id)
                          .then(() => {
                            setExistingMaterials(prev => prev.filter(m => m.id !== mat.id));
                            toast.success("Material removed");
                          })
                          .catch(() => toast.error("Failed to remove material"))
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/80 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {pendingMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40"
                >
                  <FileUp size={16} className="text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mat.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{mat.file.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingMaterials(prev => prev.filter(m => m.id !== mat.id))}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/80"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {existingMaterials.length === 0 && pendingMaterials.length === 0 && (
                <div className="sm:col-span-2 py-10 text-center rounded-xl border border-dashed border-border/80 bg-muted/15 text-sm text-muted-foreground">
                  No materials yet — add syllabus, notes, or reference documents
                </div>
              )}
            </div>
          </SectionCard>

          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Saving…</>
              ) : (
                <><IndianRupee size={14} /> {initial ? "Save changes" : "Create course"}</>
              )}
            </Btn>
          </div>
        </div>
      </div>

      <HiddenImageInput
        inputRef={bannerInputRef}
        onFile={file => handleRawImage("banner", file, 8)}
      />
      <HiddenImageInput
        inputRef={logoInputRef}
        onFile={file => handleRawImage("logo", file, 4)}
      />

      {cropKind && cropSource && (
        <ImageCropDialog
          title={cropKind === "banner" ? "Crop & position banner" : "Crop course logo"}
          imageSrc={cropSource}
          aspect={cropKind === "banner" ? 3 : 1}
          outputWidth={cropKind === "banner" ? BANNER_OUTPUT_W : LOGO_OUTPUT_W}
          onClose={() => {
            setCropKind(null);
            setCropSource("");
          }}
          onApply={({ blob, previewUrl }) => applyCrop(cropKind, blob, previewUrl)}
        />
      )}
    </div>
  );
}

export default CourseForm;
