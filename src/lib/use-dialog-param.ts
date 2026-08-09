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

  return (id: string | null | undefined) => {
    if (id) {
      pushedRef.current = true;
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, [key]: id }),
      } as never);
      return;
    }
    if (pushedRef.current) {
      pushedRef.current = false;
      router.history.back();
      return;
    }
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, [key]: undefined }),
      replace: true,
    } as never);
  };
}
