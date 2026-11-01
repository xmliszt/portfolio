import { redirect } from "next/navigation";

import { getCcOwner } from "@/lib/cc/auth/get-cc-owner";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if ((await getCcOwner()) !== undefined) redirect("/");
  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
