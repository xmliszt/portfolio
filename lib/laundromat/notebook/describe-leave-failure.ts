import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { AppendEntryRejection } from "@/lib/laundromat/supabase/notebook-types";

export type LeaveEntryFailure =
  | { kind: "rejected"; reason: AppendEntryRejection }
  | { kind: "offline" };

export type LeaveEntryFailureReason =
  | "offline"
  | "rate_limited"
  | "contains_link"
  | "too_long"
  | "sign_off_too_long"
  | "empty_body"
  | "unknown";

/** Return the quiet hint shown under the book when a note could not be left. */
export function describeLeaveFailure(options: {
  failure: LeaveEntryFailure;
  copy: LaundromatCopy;
}) {
  const hints = options.copy.notebook.leaveFailures;
  const { failure } = options;
  if (failure.kind === "offline") return hints.offline;
  switch (failure.reason) {
    case "rate_limited":
    case "contains_link":
    case "sign_off_too_long":
    case "empty_body":
      return hints[failure.reason];
    case "body_too_long":
    case "invalid_line_count":
      return hints.too_long;
    case "missing_visitor":
    case "invalid_script":
      return hints.unknown;
    default: {
      const unhandled: never = failure.reason;
      return unhandled;
    }
  }
}
