import "server-only";

type PasswordSession = { access_token: string; refresh_token: string };

/** Exchange an email and password for a Supabase session through the service key, which the project's sign-in captcha does not apply to; return `undefined` when the credentials are wrong. */
export async function requestPasswordSession(options: {
  email: string;
  password: string;
}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const response = await fetch(
    `${process.env.SUPABASE_DB_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: options.email,
        password: options.password,
      }),
      cache: "no-store",
    }
  );
  if (!response.ok) return undefined;
  const session: PasswordSession = await response.json();
  return session;
}
