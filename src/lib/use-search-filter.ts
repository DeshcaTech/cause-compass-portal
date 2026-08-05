import { useNavigate, useSearch } from "@tanstack/react-router";

/**
 * Keeps a listing-page filter in the URL query string so a selection can be
 * shared and survives a reload. The default value is omitted from the URL.
 */
export function useSearchFilter(key: string, fallbackValue: string) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const raw = search[key];
  const value = typeof raw === "string" && raw.length > 0 ? raw : fallbackValue;

  const setValue = (next: string) =>
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        [key]: next === fallbackValue ? undefined : next,
      }),
      replace: true,
    } as never);

  return [value, setValue] as const;
}

/** Reads optional string search params without failing on unknown routes. */
export function searchString(search: Record<string, unknown>, key: string) {
  const raw = search[key];
  return typeof raw === "string" ? raw : undefined;
}
