import { useEffect, useState } from "react";

export type DevicePlatform = "android" | "ios";

/**
 * Detects whether the visitor is on an Apple (iOS/iPadOS/macOS) device.
 * Defaults to "android" everywhere else, including during SSR.
 */
export function useDevicePlatform(): DevicePlatform {
  const [platform, setPlatform] = useState<DevicePlatform>("android");

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const uaPlatform = (navigator as Navigator & { platform?: string }).platform || "";
    const isApple =
      /iPhone|iPad|iPod|Macintosh/i.test(ua) ||
      /Mac|iPhone|iPad|iPod/i.test(uaPlatform) ||
      (/Mac/i.test(uaPlatform) && (navigator.maxTouchPoints ?? 0) > 1);
    setPlatform(isApple ? "ios" : "android");
  }, []);

  return platform;
}
