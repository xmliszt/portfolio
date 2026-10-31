export type PawsAuthError = { code?: string; status?: number };

type PawsAuthResult = Promise<{ error: PawsAuthError | null }>;

/** The part of the Supabase auth client the paws sign-in flows use. */
export type PawsAuth = {
  signInAnonymously: (credentials: {
    options: { captchaToken?: string };
  }) => PawsAuthResult;
  updateUser: (attributes: { email: string }) => PawsAuthResult;
  signInWithOtp: (credentials: {
    email: string;
    options: { shouldCreateUser: boolean; captchaToken?: string };
  }) => PawsAuthResult;
  verifyOtp: (params: {
    email: string;
    token: string;
    type: "email" | "email_change";
  }) => PawsAuthResult;
};
