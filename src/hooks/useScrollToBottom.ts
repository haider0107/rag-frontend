import { useEffect, useRef, type DependencyList } from "react";

export function useScrollToBottom(deps: DependencyList = []) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, deps);

  return ref;
}
