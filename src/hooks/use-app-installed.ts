import { useEffect, useState } from "react";

/**
 * True when the site is running as an installed app (PWA standalone mode)
 * or once the browser reports the app has just been installed.
 */
export function useAppInstalled() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia?.("(display-mode: standalone)");
    const check = () => {
      const iosStandalone =
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(Boolean(mql?.matches) || iosStandalone);
    };

    check();
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    mql?.addEventListener?.("change", check);

    return () => {
      window.removeEventListener("appinstalled", onInstalled);
      mql?.removeEventListener?.("change", check);
    };
  }, []);

  return installed;
}