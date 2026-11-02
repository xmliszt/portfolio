import {
  REPOST_PUBLISH_MODES,
  type RepostPublishMode,
} from "./repost-publish-modes";

/** `true` if `value` is one of `REPOST_PUBLISH_MODES`; `false` otherwise. */
export function isRepostPublishMode(value: string): value is RepostPublishMode {
  return REPOST_PUBLISH_MODES.some((mode) => mode === value);
}
