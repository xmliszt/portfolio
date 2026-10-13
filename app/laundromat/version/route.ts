export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { buildId: process.env.LAUNDROMAT_BUILD_ID },
    { headers: { "Cache-Control": "no-store" } }
  );
}
