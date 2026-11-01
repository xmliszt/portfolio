export const dynamic = "force-static";

export function GET() {
  return new Response("User-agent: *\nDisallow: /\n", {
    headers: { "Content-Type": "text/plain" },
  });
}
