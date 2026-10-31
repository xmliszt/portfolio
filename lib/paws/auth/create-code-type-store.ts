import type { EmailCodeType } from "./send-email-code";

const STORAGE_KEY = "paws-email-code-types";

type CodeTypeStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function isCodeType(value: unknown): value is EmailCodeType {
  return value === "email" || value === "email_change";
}

/** Return a store of which `verifyOtp` type each email's last code was sent for, kept in `storage` so it outlives a reload; a store that cannot be read or written behaves as empty. */
export function createCodeTypeStore(options: {
  storage: () => CodeTypeStorage;
}) {
  function readAll(): { [email: string]: EmailCodeType } {
    try {
      const parsed: unknown = JSON.parse(
        options.storage().getItem(STORAGE_KEY) ?? "{}"
      );
      if (typeof parsed !== "object" || parsed === null) return {};
      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, EmailCodeType] => isCodeType(entry[1])
        )
      );
    } catch {
      return {};
    }
  }
  return {
    get(email: string) {
      return readAll()[email];
    },
    set(entry: { email: string; codeType: EmailCodeType }) {
      try {
        options
          .storage()
          .setItem(
            STORAGE_KEY,
            JSON.stringify({ ...readAll(), [entry.email]: entry.codeType })
          );
      } catch {
        return;
      }
    },
  };
}
