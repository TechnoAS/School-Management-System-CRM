import { useCallback, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { Move, ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";
import { Btn } from "./Btn";
import { getCroppedImageBlob } from "@/lib/imageCrop";

export type ImageCropResult = {
  blob: Blob;
  previewUrl: string;
};

export function ImageCropDialog({
  title,
  imageSrc,
  aspect,
  outputWidth,
  onApply,
  onClose,
}: {
  title: string;
  imageSrc: string;
  aspect: number;
  /** Max width of exported image; height follows aspect ratio */
  outputWidth: number;
  onApply: (result: ImageCropResult) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, outputWidth);
      const previewUrl = URL.createObjectURL(blob);
      onApply({ blob, previewUrl });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Move size={12} /> Drag to move · Scroll or slider to zoom
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative h-[min(52vh,360px)] bg-zinc-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
            showGrid
            style={{
              containerStyle: { background: "#18181b" },
              cropAreaStyle: {
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              },
            }}
          />
        </div>

        <div className="px-5 py-4 space-y-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <ZoomOut size={14} className="text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 accent-primary cursor-pointer"
            />
            <ZoomIn size={14} className="text-muted-foreground shrink-0" />
            <button
              type="button"
              onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground"
              title="Reset zoom & position"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={onClose} disabled={applying}>
              Cancel
            </Btn>
            <Btn onClick={handleApply} disabled={applying || !croppedAreaPixels}>
              <Check size={14} />
              {applying ? "Applying…" : "Apply crop"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropDialog;
