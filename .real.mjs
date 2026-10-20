import { createClient } from "@supabase/supabase-js";
const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: "laundro_cafe" } });
const hash = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
const attempt = crypto.randomUUID();
const f = await svc.rpc("fulfill_tip", { p_amount_cents: 100, p_session_id: "cs_test_verify_" + attempt.slice(0, 8), p_token_hash: hash });
console.log("fulfill", f.data?.number, f.error?.message);
const s = await svc.rpc("spend_tip", { p_token_hash: hash, p_attempt: attempt, p_machine_id: "washer-2" });
console.log("spend", JSON.stringify(s.data), s.error?.message);
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const sessionId = crypto.randomUUID();
const ch = c.channel("laundromat:room", { config: { presence: { key: sessionId } } });
ch.subscribe(async (st) => {
  if (st !== "SUBSCRIBED") return;
  console.log("track", await ch.track({ sessionId, visitorId: "real-" + sessionId.slice(0, 6),
    goldenCharges: [
      { machineId: "washer-2", attempt, startedAt: Date.now() },
      { machineId: "washer-3", attempt, startedAt: Date.now() },
    ] }));
});
setTimeout(() => process.exit(0), 90_000);
