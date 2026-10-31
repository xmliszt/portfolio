import { SIBLING_APPS, type SiblingAppId } from "./sibling-apps";

/** Return every app in `SIBLING_APPS` except `selfId`, in list order. */
export function getSiblingApps(selfId: SiblingAppId) {
  return SIBLING_APPS.filter((app) => app.id !== selfId);
}
