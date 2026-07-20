import { useRef, type RefObject } from "react";
import {
  BookOpen,
  Camera,
  Crop,
  ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { Btn, Card } from "@/components/shared";

const BANNER_ASPECT = 3 / 1;
const LOGO_SIZE = 96;

export function CourseBrandingPanel({
  name,
  banner,
  logo,
  saving,
  onPickBanner,
  onPickLogo,
  onAdjustBanner,
  onAdjustLogo,
  onRemoveBanner,
  onRemoveLogo,
}: {
  name: string;
  banner: string;
  logo: string;
  saving?: boolean;
  onPickBanner: () => void;
  onPickLogo: () => void;
  onAdjustBanner: () => void;
  onAdjustLogo: () => void;
  onRemoveBanner: () => void;
  onRemoveLogo: () => void;
}) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Branding preview
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5 truncate">
          {name || "How your course will appear"}
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Banner */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">Cover banner</label>
            <span className="text-[10px] text-muted-foreground">3:1 · 1200×400 recommended</span>
          </div>
          <div
            className="relative w-full rounded-xl overflow-hidden border border-border bg-muted/30 group"
            style={{ aspectRatio: `${BANNER_ASPECT}` }}
          >
            {banner ? (
              <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <ImageIcon size={28} strokeWidth={1.5} />
                <span className="text-xs">No banner yet</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {banner && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onAdjustBanner}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white/95 text-foreground shadow-sm hover:bg-white disabled:opacity-50"
                  >
                    <Crop size={12} /> Adjust
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onRemoveBanner}
                    className="p-1.5 rounded-lg bg-white/95 text-destructive shadow-sm hover:bg-white disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Btn
              variant="secondary"
              size="sm"
              className="flex-1 justify-center text-xs"
              disabled={saving}
              onClick={onPickBanner}
            >
              <Upload size={12} /> {banner ? "Replace" : "Upload banner"}
            </Btn>
            {banner && (
              <Btn
                variant="secondary"
                size="sm"
                className="justify-center text-xs"
                disabled={saving}
                onClick={onAdjustBanner}
              >
                <Crop size={12} /> Crop & move
              </Btn>
            )}
          </div>
        </div>

        {/* Logo + mini card preview */}
        <div>
          <label className="text-xs font-medium text-foreground mb-2 block">Course logo</label>
          <div className="flex gap-4 items-start">
            <div className="relative shrink-0 group">
              <div
                className="rounded-2xl border-2 border-border bg-muted/40 overflow-hidden shadow-md flex items-center justify-center"
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              >
                {logo ? (
                  <img src={logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={32} className="text-primary/50" />
                )}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={onPickLogo}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <p className="text-[11px] text-muted-foreground mb-1">Card preview</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {logo ? (
                      <img src={logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={14} className="text-primary/60" />
                    )}
                  </div>
                  <p className="text-xs font-semibold truncate">{name || "Course name"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Btn variant="secondary" size="sm" className="text-xs h-8" disabled={saving} onClick={onPickLogo}>
                  <Upload size={11} /> Upload
                </Btn>
                {logo && (
                  <>
                    <Btn variant="secondary" size="sm" className="text-xs h-8" disabled={saving} onClick={onAdjustLogo}>
                      <Crop size={11} /> Crop
                    </Btn>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={onRemoveLogo}
                      className="text-xs h-8 px-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Square · 400×400 · JPG or PNG</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function HiddenImageInput({
  inputRef,
  onFile,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={e => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) onFile(file);
      }}
    />
  );
}

export default CourseBrandingPanel;
