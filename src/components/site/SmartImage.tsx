import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ImageOff, RotateCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Image with a loading skeleton, one silent auto-retry (helps flaky mobile
 * networks) and a manual retry button when it still fails.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  loading = "lazy",
  width,
  height,
  wrapperStyle,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  wrapperStyle?: CSSProperties;
}) {
  const t = useT();
  const imageRef = useRef<HTMLImageElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setAttempt(0);
    setStatus("loading");
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  }, [src, attempt]);

  function onError() {
    if (attempt < 1) {
      setAttempt((value) => value + 1);
      setStatus("loading");
      return;
    }
    setStatus("error");
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-secondary", wrapperClassName)}
      style={wrapperStyle}
    >
      {status !== "error" ? (
        <img
          ref={imageRef}
          key={attempt}
          src={attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`}
          alt={alt}
          loading={loading}
          width={width}
          height={height}
          onLoad={() => setStatus("loaded")}
          onError={onError}
          className={cn(
            "transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 text-center",
            className,
          )}
        >
          <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">{t("Image could not be loaded.")}</p>
          <button
            type="button"
            onClick={() => {
              setAttempt((value) => value + 1);
              setStatus("loading");
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium hover:bg-secondary"
          >
            <RotateCw className="size-3.5" aria-hidden="true" /> {t("Retry")}
          </button>
        </div>
      )}
      {status === "loading" ? (
        <Skeleton className="absolute inset-0 size-full" aria-hidden="true" />
      ) : null}
    </div>
  );
}
