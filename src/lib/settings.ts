import { supabase } from "@/integrations/supabase/client";

export async function getAppSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("app_settings").select("key,value");
  const out: Record<string, string> = {};
  for (const row of data ?? []) out[row.key] = row.value;
  return out;
}

export function buildWhatsAppLink(number: string, plan: "starter" | "pro", price: string) {
  const planLabel = plan === "starter" ? "Starter" : "Pro";
  const text = `Hi, I want to get TiPost ${planLabel} plan (${price} PKR/month)`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}