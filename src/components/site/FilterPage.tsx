import type { ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";

export type FilterOption = { value: string; label: string; meta?: string | null };

/**
 * Shared page shell for the public listing pages: a row of dropdown filters
 * above a full-width content panel.
 *
 * On mobile the filters collapse under a single "Filter" button; on desktop
 * they are shown as a grid.
 */
export function FilterPage({ filters, children }: { filters: ReactNode; children: ReactNode }) {
  const t = useT();
  return (
    <section className="container-page py-10">
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">{filters}</div>

      <details className="group/filter sm:hidden">
        <summary className="flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          <span className="flex items-center gap-2">
            <Filter className="size-4" /> {t("Filter")}
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open/filter:rotate-180" />
        </summary>
        <div className="mt-3 space-y-4">{filters}</div>
      </details>

      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
              {option.meta ? (
                <span className="ml-2 text-xs text-muted-foreground">{option.meta}</span>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
