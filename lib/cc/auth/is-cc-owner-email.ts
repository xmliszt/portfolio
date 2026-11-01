/** `true` if `email` is the one address allowed into the command center (`CC_OWNER_EMAIL`); `false` when it differs or either is unset. */
export function isCcOwnerEmail(email: string | undefined) {
  const ownerEmail = process.env.CC_OWNER_EMAIL?.trim().toLowerCase();
  if (ownerEmail === undefined || ownerEmail === "") return false;
  return email?.trim().toLowerCase() === ownerEmail;
}
