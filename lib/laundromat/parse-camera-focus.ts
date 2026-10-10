import type { FocusTarget } from "./scene-config";

export type CameraFocus = "room" | FocusTarget;

/** Return the camera focus named by a `?focus=` value, falling back to `"room"` for anything else. */
export function parseCameraFocus(
  value: string | null | undefined
): CameraFocus {
  switch (value) {
    case "shelf":
    case "notebook":
      return value;
    default:
      return "room";
  }
}
