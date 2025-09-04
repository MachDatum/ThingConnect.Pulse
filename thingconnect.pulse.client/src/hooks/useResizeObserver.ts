import { useEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

export function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size }; // { ref: MutableRefObject<T | null>, width, height }
}