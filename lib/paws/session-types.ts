export type PawsSession =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "guest"; userId: string; accessToken: string }
  | { kind: "member"; userId: string; email: string; accessToken: string };

export type SendCodeResult =
  | { kind: "sent" }
  | { kind: "tooSoon" }
  | { kind: "failed" };

export type VerifyCodeResult =
  | { kind: "verified" }
  | { kind: "wrongCode" }
  | { kind: "failed" };

export type PawsSessionActions = {
  sendEmailCode: (options: { email: string }) => Promise<SendCodeResult>;
  verifyEmailCode: (options: {
    email: string;
    code: string;
  }) => Promise<VerifyCodeResult>;
  signOut: () => Promise<void>;
};
