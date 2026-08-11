import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export type CropSpec = {
  /** Width / height ratio of the final picture. */
  aspect: number;
  /** Pixel width the cropped picture is resized to before upload. */
  outputWidth: number;
};

async function cropToBlob(
  src: string,
  area: Area,
  spec: CropSpec,
  mimeType: string,
  whole: boolean,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that picture."));
    img.src = src;
  });

  const width = whole
    ? Math.min(spec.outputWidth, Math.max(image.naturalWidth, Math.round(image.naturalHeight * spec.aspect)))
    : Math.min(spec.outputWidth, Math.round(area.width));
  const height = Math.round(width / spec.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the picture.");
  ctx.imageSmoothingQuality = "high";
  if (whole) {
    // Letterbox: the entire picture is kept, padded to the card shape.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  } else {
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);
  }

  const type = mimeType === "image/png" ? "image/png" : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not save the cropped picture."))),
      type,
      0.9,
    );
  });
}

export function ImageCropper({
  open,
  src,
  mimeType,
  spec,
  onCancel,
  onCropped,
}: {
  open: boolean;
  src: string;
  mimeType: string;
  spec: CropSpec;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);
  const [whole, setWhole] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function confirm() {
    if (!area && !whole) return;
    setWorking(true);
    try {
      onCropped(await cropToBlob(src, area ?? { x: 0, y: 0, width: 0, height: 0 }, spec, mimeType, whole));
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onCancel()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop the picture</DialogTitle>
          <DialogDescription>
            Drag to reposition and zoom so the important part fits the frame. It will be saved at{" "}
            {spec.outputWidth}px wide.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
          {whole ? (
            <img
              src={src}
              alt="Whole picture preview"
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={spec.aspect}
            cropShape={spec.aspect === 1 ? "round" : "rect"}
            showGrid={spec.aspect !== 1}
            minZoom={0.5}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch id="whole-picture" checked={whole} onCheckedChange={setWhole} />
          <label htmlFor="whole-picture" className="text-sm">
            Keep the whole picture (no cropping — padded to fit the card shape)
          </label>
        </div>
        <div className="space-y-2" hidden={whole}>
          <p className="text-xs text-muted-foreground">Zoom</p>
          <Slider
            min={0.5}
            max={4}
            step={0.01}
            value={[zoom]}
            onValueChange={([next]) => setZoom(next ?? 1)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="hero" onClick={confirm} disabled={working || (!area && !whole)}>
            {working ? "Preparing…" : whole ? "Use whole picture" : "Use this crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
