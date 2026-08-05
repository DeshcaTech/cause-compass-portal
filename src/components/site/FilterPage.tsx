import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { value: string; label: string; meta?: string | null };

/**
 * Shared page shell for the public listing pages: a row of dropdown filters
 * above a full-width content panel.
 */
export function FilterPage({ filters, children }: { filters: ReactNode; children: ReactNode }) {
  return (
    <section className="container-page py-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filters}</div>
      <div className="mt-8">{children}</div>
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
