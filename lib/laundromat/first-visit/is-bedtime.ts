import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";

/** `true` if `timeOfDay` is set, `timeOfDay.sun` is `undefined`, `isLampOn` is `false` and `isCurtainOpen` is `false`; `false` when any of them is not. */
export function isBedtime(options: {
  timeOfDay: TimeOfDay | undefined;
  isLampOn: boolean;
  isCurtainOpen: boolean;
}) {
  return (
    options.timeOfDay !== undefined &&
    options.timeOfDay.sun === undefined &&
    !options.isLampOn &&
    !options.isCurtainOpen
  );
}
