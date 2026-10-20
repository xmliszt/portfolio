import { createStripeClient } from "@/lib/laundromat/stripe/create-stripe-client";
import { fulfillCheckoutSession } from "@/lib/laundromat/stripe/fulfill-checkout-session";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const client = createLaundromatServiceClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (stripe === undefined || client === undefined || !webhookSecret) {
    return new Response("Tips are not configured", { status: 503 });
  }
  if (signature === null) {
    return new Response("Missing signature", { status: 400 });
  }
  const event = await (async () => {
    try {
      return await stripe.webhooks.constructEventAsync(
        await request.text(),
        signature,
        webhookSecret
      );
    } catch {
      return undefined;
    }
  })();
  if (event === undefined) {
    return new Response("Invalid signature", { status: 400 });
  }
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await fulfillCheckoutSession({ client, session: event.data.object });
  }
  return Response.json({ received: true });
}
