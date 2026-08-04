import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";

export type LightboxTile = { key: string; src: string; caption: string | null };

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const INTERVALS = [3, 5, 8];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Lightbox({
  tiles,
  index,
  onIndexChange,
  onClose,
  fallbackTitle,
}: {
  tiles: LightboxTile[];
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
  fallbackTitle: string;
}) {
  const t = useT();
  const open = index !== null && tiles.length > 0;
  const current = index !== null ? tiles[index] : undefined;

  const shellRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [swipeX, setSwipeX] = useState(0);
  const swipeXRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [interval, setIntervalSeconds] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSwipeX(0);
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (index === null || tiles.length === 0) return;
      onIndexChange((index + delta + tiles.length) % tiles.length);
    },
    [index, tiles.length, onIndexChange],
  );

  // Keep the latest handlers reachable from native listeners with [] deps.
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    resetView();
  }, [index, resetView]);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      resetView();
    }
  }, [open, resetView]);

  /* ---------------------------------------------------------------- zoom */

  const zoomAt = useCallback((nextZoom: number, px?: number, py?: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    setZoom((currentZoom) => {
      const target = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const anchorX = px ?? (rect ? rect.width / 2 : 0);
      const anchorY = py ?? (rect ? rect.height / 2 : 0);
      const k = target / currentZoom;
      setOffset((currentOffset) =>
        target === MIN_ZOOM
          ? { x: 0, y: 0 }
          : {
              x: anchorX - (anchorX - currentOffset.x) * k,
              y: anchorY - (anchorY - currentOffset.y) * k,
            },
      );
      return target;
    });
  }, []);

  const zoomAtRef = useRef(zoomAt);
  zoomAtRef.current = zoomAt;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Native, non-passive wheel listener (React's onWheel is passive, so
  // preventDefault there is ignored and the page would scroll / page-zoom).
  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const rect = el!.getBoundingClientRect();
      const dy = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      const factor = Math.exp(-dy * 0.0015);
      zoomAtRef.current(
        zoomRef.current * factor,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  /* ------------------------------------------------- pointers: swipe/pan */

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), zoom };
      dragStart.current = null;
    } else if (pointers.current.size === 1) {
      dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const rect = viewportRef.current?.getBoundingClientRect();
      zoomAt(
        (pinchStart.current.zoom * distance) / pinchStart.current.distance,
        rect ? (a!.x + b!.x) / 2 - rect.left : undefined,
        rect ? (a!.y + b!.y) / 2 - rect.top : undefined,
      );
      return;
    }

    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    if (zoom > 1) {
      setOffset({ x: dragStart.current.offsetX + dx, y: dragStart.current.offsetY + dy });
    } else {
      swipeXRef.current = dx;
      setSwipeX(dx);
    }
  }

  function endPointer(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      const dx = swipeXRef.current;
      swipeXRef.current = 0;
      if (zoom === 1 && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      setSwipeX(0);
      dragStart.current = null;
    }
  }

  /* --------------------------------------------------------- fullscreen */

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* fullscreen can be refused (iOS Safari); ignore silently */
    }
  }, []);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!open && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }, [open]);

  /* ---------------------------------------------------------- slideshow */

  useEffect(() => {
    if (!open || !playing || tiles.length < 2) return;
    const id = window.setInterval(() => stepRef.current(1), interval * 1000);
    return () => window.clearInterval(id);
  }, [open, playing, interval, tiles.length]);

  /* ----------------------------------------------------------- keyboard */

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      const onControl = !!target?.closest("button, [role='button'], select");

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          stepRef.current(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          stepRef.current(1);
          break;
        case "+":
        case "=":
          event.preventDefault();
          zoomAtRef.current(zoomRef.current * 1.4);
          break;
        case "-":
        case "_":
          event.preventDefault();
          zoomAtRef.current(zoomRef.current / 1.4);
          break;
        case "0":
          event.preventDefault();
          zoomAtRef.current(1);
          break;
        case "f":
        case "F":
          if (typing) break;
          event.preventDefault();
          void toggleFullscreen();
          break;
        case " ":
        case "Enter":
          if (typing || onControl) break;
          event.preventDefault();
          setPlaying((value) => !value);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleFullscreen]);

  const position = `${(index ?? 0) + 1} ${t("of")} ${tiles.length}`;
  const caption = current?.caption ?? fallbackTitle;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        ref={shellRef}
        aria-label={`${t("Photo viewer")} — ${caption}, ${position}`}
        className="max-h-[92dvh] gap-3 overflow-y-auto bg-background sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-left text-base">{caption}</DialogTitle>
          <DialogDescription className="text-left">
            {`${position} · ${t("Use arrow keys to browse, +/− to zoom, F for full screen, space to play")}`}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDoubleClick={() => zoomAt(zoom > 1 ? 1 : 2)}
          onDragStart={(event) => event.preventDefault()}
          role="group"
          aria-roledescription={t("Photo viewer")}
          aria-label={`${caption}, ${position}`}
          className="relative touch-none select-none overflow-hidden rounded-xl border border-border bg-secondary [&_img]:pointer-events-none"
        >
          {current ? (
            <div
              style={{
                transform: `translate(${offset.x + swipeX}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                transition: pointers.current.size === 0 ? "transform 120ms ease-out" : "none",
              }}
            >
              <SmartImage
                key={current.key}
                src={current.src}
                alt={current.caption ?? fallbackTitle}
                loading="eager"
                wrapperClassName="w-full bg-transparent"
                className="max-h-[60dvh] w-full select-none object-contain"
              />
            </div>
          ) : null}

          {tiles.length > 1 ? (
            <>
              <Button
                variant="soft"
                size="icon"
                aria-label={t("Previous photo")}
                onClick={() => step(-1)}
                className="absolute left-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 shadow-md"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="soft"
                size="icon"
                aria-label={t("Next photo")}
                onClick={() => step(1)}
                className="absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 shadow-md"
              >
                <ChevronRight />
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="soft"
            size="icon"
            aria-label={t("Zoom out")}
            disabled={zoom <= MIN_ZOOM}
            onClick={() => zoomAt(zoom / 1.4)}
            className="min-h-11 min-w-11"
          >
            <ZoomOut />
          </Button>
          <span aria-live="polite" className="w-14 text-center text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="soft"
            size="icon"
            aria-label={t("Zoom in")}
            disabled={zoom >= MAX_ZOOM}
            onClick={() => zoomAt(zoom * 1.4)}
            className="min-h-11 min-w-11"
          >
            <ZoomIn />
          </Button>
          <Button variant="ghost" onClick={() => zoomAt(1)} disabled={zoom === 1} className="min-h-11">
            {t("Reset")}
          </Button>

          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

          <Button
            variant="soft"
            size="icon"
            aria-label={playing ? t("Pause slideshow") : t("Play slideshow")}
            aria-pressed={playing}
            disabled={tiles.length < 2}
            onClick={() => setPlaying((value) => !value)}
            className="min-h-11 min-w-11"
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">{t("Slideshow interval")}</span>
            <select
              value={interval}
              onChange={(event) => setIntervalSeconds(Number(event.target.value))}
              aria-label={t("Slideshow interval")}
              className="min-h-11 rounded-lg border border-border bg-card px-2 text-sm"
            >
              {INTERVALS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds}s
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="soft"
            size="icon"
            aria-label={isFullscreen ? t("Exit full screen") : t("Full screen")}
            aria-pressed={isFullscreen}
            onClick={() => void toggleFullscreen()}
            className="ml-auto min-h-11 min-w-11"
          >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>

        <p aria-live="polite" className="sr-only">
          {`${caption}, ${position}`}
        </p>

        {tiles.length > 1 ? (
          <div
            role="list"
            aria-label={t("Photo thumbnails")}
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {tiles.map((tile, tileIndex) => (
              <button
                key={`thumb-${tile.key}`}
                type="button"
                role="listitem"
                onClick={() => onIndexChange(tileIndex)}
                aria-label={`${t("View photo")} ${tileIndex + 1} ${t("of")} ${tiles.length}`}
                aria-current={tileIndex === index}
                className={`shrink-0 overflow-hidden rounded-lg border transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tileIndex === index
                    ? "border-primary"
                    : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img src={tile.src} alt="" className="h-14 w-20 object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}