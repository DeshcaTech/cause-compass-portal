import { useRef } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";

/**
 * Keeps an open popup in the URL so it can be shared, while making the close
 * action return the visitor exactly where they were: if we pushed the popup
 * onto the history stack, closing goes back (restoring scroll position and the
 * previous filters); on a deep link we simply drop the param.
 */
export function useDialogParam(key: string) {
  const navigate = useNavigate();
  const router = useRouter();
  const pushedRef = useRef(false);
  const scrollRef = useRef(0);

  const restoreScroll = () => {
    if (typeof window === "undefined") return;
    const y = scrollRef.current;
    // Wait for the dialog's scroll lock to release before restoring.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }));
    });
  };

  return (id: string | null | undefined) => {
    if (id) {
      pushedRef.current = true;
      scrollRef.current = typeof window === "undefined" ? 0 : window.scrollY;
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, [key]: id }),
      } as never);
      return;
    }
    if (pushedRef.current) {
      pushedRef.current = false;
      router.history.back();
      restoreScroll();
      return;
    }
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, [key]: undefined }),
      replace: true,
    } as never);
  };
}
