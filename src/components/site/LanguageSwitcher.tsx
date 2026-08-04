import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string; full: string }[] = [
  { value: "en", label: "EN", full: "English" },
  { value: "fr", label: "FR", full: "Français" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const other = OPTIONS.find((o) => o.value !== lang)!;

  return (
    <button
      type="button"
      onClick={() => setLang(other.value)}
      title={other.full}
      aria-label={`Switch to ${other.full}`}
      className={`inline-flex items-center rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {other.label}
    </button>
  );
}
