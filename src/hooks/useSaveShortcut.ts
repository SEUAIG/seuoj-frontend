import { useEffect, useRef } from "react";

export function useSaveShortcut(onSave: () => void, enabled = true) {
  const callbackRef = useRef(onSave);
  callbackRef.current = onSave;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        callbackRef.current();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled]);
}
