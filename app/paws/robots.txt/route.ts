import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

export const dynamic = "force-static";

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${PAWS_ORIGIN}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
