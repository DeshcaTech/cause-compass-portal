import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";

import { translateContent } from "@/lib/translate.functions";
import { useI18n } from "./index";

type Dyn = (text: string | null | undefined) => string;

const DynContext = createContext<Dyn>((text) => text ?? "");

const MAX_LEN = 4000;
const BATCH = 40;

/**
 * Translates admin-authored content (events, news, businesses, campaigns…) on the fly.
 * Strings are collected while rendering, translated in one batched call and cached in
 * the database, so each phrase is only ever translated once.
 */
export function DynamicTranslationProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const translate = useServerFn(translateContent);
  const [cache, setCache] = useState<Record<string, string>>({});
  const pending = useRef(new Set<string>());
  const requested = useRef(new Set<string>());
  const [tick, setTick] = useState(0);

  // Language switch invalidates everything collected so far.
  useEffect(() => {
    setCache({});
    pending.current.clear();
    requested.current.clear();
  }, [lang]);

  useEffect(() => {
    if (lang === "en" || pending.current.size === 0) return;
    const texts = Array.from(pending.current).slice(0, BATCH);
    pending.current.clear();
    let cancelled = false;
    const id = window.setTimeout(async () => {
      try {
        const data = await translate({ data: { lang: "fr", texts } });
        if (!cancelled) setCache((prev) => ({ ...prev, ...data }));
      } catch {
        /* keep English on failure */
      }
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [tick, lang, translate]);

  const dyn = useCallback<Dyn>(
    (text) => {
      const source = (text ?? "").toString();
      if (lang === "en" || !source.trim() || source.length > MAX_LEN) return source;
      const hit = cache[source];
      if (hit) return hit;
      if (!requested.current.has(source)) {
        requested.current.add(source);
        pending.current.add(source);
        queueMicrotask(() => setTick((n) => n + 1));
      }
      return source;
    },
    [cache, lang],
  );

  const value = useMemo(() => dyn, [dyn]);

  return <DynContext.Provider value={value}>{children}</DynContext.Provider>;
}

/** Returns a function that translates admin-authored text into the active language. */
export function useDyn() {
  return useContext(DynContext);
}
