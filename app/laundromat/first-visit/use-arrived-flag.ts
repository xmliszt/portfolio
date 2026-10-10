import { useEffect, useState } from "react";

const ARRIVED_STORAGE_KEY = "laundromat:arrived";

/** Return whether this browser has walked into the laundromat before, read once after mount (`undefined` until then), and `markArrived`, which records the walk-in without changing the returned value. */
export function useArrivedFlag() {
  const [hasArrived, setHasArrived] = useState<boolean>();

  useEffect(() => {
    setHasArrived(window.localStorage.getItem(ARRIVED_STORAGE_KEY) !== null);
  }, []);

  function markArrived() {
    window.localStorage.setItem(ARRIVED_STORAGE_KEY, new Date().toISOString());
  }

  return { hasArrived, markArrived };
}
