import { Languages } from "lucide-react";

import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string; full: string }[] = [
  { value: "en", label: "EN", full: "English" },
  { value: "fr", label: "FR", full: "Français" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-background/60 p-0.5 ${className}`}
      role="group"
      aria-label="Language / Langue"
    >
      <Languages className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLang(option.value)}
          aria-pressed={lang === option.value}
          title={option.full}
          className={`rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
            lang === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
