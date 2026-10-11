import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

export const dynamic = "force-static";

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${LAUNDROMAT_ORIGIN}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
