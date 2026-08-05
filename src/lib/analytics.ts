import { supabase } from "@/integrations/supabase/client";

/** Fire-and-forget analytics event. Never blocks or breaks the UI. */
export async function trackEvent(
  eventName: string,
  details?: Record<string, unknown>,
) {
  try {
    await supabase.from("analytics_events").insert({
      event_name: eventName.slice(0, 80),
      page_path:
        typeof window === "undefined" ? null : window.location.pathname.slice(0, 200),
      details: (details ?? null) as never,
    });
  } catch {
    /* analytics must never surface errors to the visitor */
  }
}
