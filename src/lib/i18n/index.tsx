import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fr } from "./fr";

export type Lang = "en" | "fr";

const STORAGE_KEY = "ccgms-lang";

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate an English source string. Falls back to the English text. */
  t: (source: string) => string;
};

const I18nContext = createContext<I18nValue>({
  lang: "en",
  setLang: () => {},
  t: (source) => source,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start on "en" so SSR markup and first client render match.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") setLangState(stored);
    else if (navigator.language?.toLowerCase().startsWith("fr")) setLangState("fr");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }, []);

  const t = useCallback(
    (source: string) => (lang === "fr" ? (fr[source] ?? source) : source),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Shorthand for components that only need the translate function. */
export function useT() {
  return useContext(I18nContext).t;
}

/** Locale tag for Intl formatting (dates, currency). */
export function localeTag(lang: Lang) {
  return lang === "fr" ? "fr-FR" : "en-GB";
}