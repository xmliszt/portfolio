import { useLayoutEffect, useRef, useState } from "react";

/** Return a ref for an element and its current border-box height, updated whenever the element resizes. */
export function useMeasuredHeight<Element extends HTMLElement>() {
  const ref = useRef<Element>(null);
  const [heightPx, setHeightPx] = useState<number>();

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeightPx(entry?.borderBoxSize.at(0)?.blockSize);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, heightPx };
}
