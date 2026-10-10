import type { AppendEntryRejection } from "@/lib/laundromat/supabase/notebook-types";

export type LeaveEntryFailure =
  | { kind: "rejected"; reason: AppendEntryRejection }
  | { kind: "offline" };

/** Return the quiet hint shown under the book when a note could not be left. */
export function describeLeaveFailure(failure: LeaveEntryFailure) {
  if (failure.kind === "offline") {
    return "the notebook can't be reached · your note stays here";
  }
  switch (failure.reason) {
    case "rate_limited":
      return "one note every two minutes · try again soon";
    case "daily_limit_reached":
      return "that's enough notes for today · come back tomorrow";
    case "contains_link":
      return "no links in the notebook";
    case "body_too_long":
    case "invalid_line_count":
      return "too long for the notebook · shorten it a little";
    case "sign_off_too_long":
      return "the sign-off is too long";
    case "empty_body":
      return "write something first";
    case "missing_visitor":
    case "invalid_script":
      return "something went wrong · try again";
    default: {
      const unhandled: never = failure.reason;
      return unhandled;
    }
  }
}
