import { sceneConfig } from "@/lib/laundromat/scene-config";

/** Return `true` if `machineId` names a washer or dryer in `sceneConfig`; `false` when it names anything else. */
export function isChargeableMachineId(machineId: string) {
  return sceneConfig.objects.some(
    ({ id, kind }) =>
      id === machineId && (kind === "washer" || kind === "dryer")
  );
}
