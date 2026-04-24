import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const topic = String(body.topic ?? "").trim();
    const posts = Math.max(1, Math.min(10, Number(body.posts) || 1));
    if (!topic) return json({ error: "Topic is required" }, 400);

    // Service-role client for atomic quota / settings reads
    const admin = createClient(SUPABASE_URL, SERVICE);

    // Get webhook URL from app_settings
    const { data: setting } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "webhook_url")
      .maybeSingle();
    const webhookUrl =
      setting?.value || "https://n8n.titechlabs.dev/webhook/post-generator";

    // Consume quota atomically (uses caller context via the user client)
    const { data: quota, error: quotaErr } = await userClient.rpc(
      "consume_daily_quota",
      { _amount: posts },
    );
    if (quotaErr) return json({ error: quotaErr.message }, 400);
    if (!(quota as any)?.ok) {
      return json({ error: (quota as any)?.error ?? "Quota error", quota }, 429);
    }

    // Call n8n
    let n8nData: any;
    try {
      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Topic: topic, Posts: String(posts) }),
      });
      const text = await n8nRes.text();
      try {
        n8nData = JSON.parse(text);
      } catch {
        n8nData = text;
      }
      if (!n8nRes.ok) {
        return json(
          { error: `Webhook failed (${n8nRes.status})`, details: n8nData },
          502,
        );
      }
    } catch (e) {
      return json({ error: `Webhook unreachable: ${(e as Error).message}` }, 502);
    }

    // Get user plan for analytics
    const { data: userRow } = await admin
      .from("users")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    // Log analytics (fire and forget)
    admin
      .from("topic_analytics")
      .insert({
        user_id: userId,
        topic,
        plan: userRow?.plan ?? null,
        posts_count: posts,
      })
      .then(() => {});

    return json({ ok: true, data: n8nData, quota });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}