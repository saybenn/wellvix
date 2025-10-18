// /components/ui/useToast.js
import { useCallback, useState } from "react";

export function useToast() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("info");
  const [message, setMessage] = useState("");

  const show = useCallback((msg, type = "info") => {
    setMessage(String(msg || ""));
    setKind(type);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, kind, message, show, close };
}
