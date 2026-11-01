import "server-only";

import { redirect } from "next/navigation";

import { getCcOwner } from "./get-cc-owner";

/** Return the owner user, or redirect to the login page when the request is not the owner's. */
export async function requireCcOwner() {
  const owner = await getCcOwner();
  if (owner === undefined) redirect("/login");
  return owner;
}
