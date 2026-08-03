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
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that picture."));
    img.src = src;
  });

  const width = Math.min(spec.outputWidth, Math.round(area.width));
  const height = Math.round(width / spec.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the picture.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

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

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function confirm() {
    if (!area) return;
    setWorking(true);
    try {
      onCropped(await cropToBlob(src, area, spec, mimeType));
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
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={spec.aspect}
            cropShape={spec.aspect === 1 ? "round" : "rect"}
            showGrid={spec.aspect !== 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Zoom</p>
          <Slider
            min={1}
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
          <Button type="button" variant="hero" onClick={confirm} disabled={working || !area}>
            {working ? "Preparing…" : "Use this crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
