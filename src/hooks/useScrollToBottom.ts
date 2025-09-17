import { useEffect, useRef } from "react";

export function useScrollToBottom<T = unknown>(deps: any[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, deps);

  return ref;
}
