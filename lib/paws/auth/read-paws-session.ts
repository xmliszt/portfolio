import type { PawsSession } from "@/lib/paws/session-types";

type AuthSession = {
  access_token: string;
  user: { id: string; email?: string; is_anonymous?: boolean };
};

/** Return the paws session for a Supabase auth session: `loading` without one, `member` for a user with an email who is not anonymous, `guest` otherwise. */
export function readPawsSession(session: AuthSession | null): PawsSession {
  if (session === null) return { kind: "loading" };
  const { user } = session;
  if (
    user.is_anonymous !== true &&
    user.email !== undefined &&
    user.email !== ""
  ) {
    return {
      kind: "member",
      userId: user.id,
      email: user.email,
      accessToken: session.access_token,
    };
  }
  return { kind: "guest", userId: user.id, accessToken: session.access_token };
}
