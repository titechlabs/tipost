import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const KEYS = [
  { key: "n8n_webhook_url", label: "n8n webhook URL", placeholder: "https://…", type: "input" },
  { key: "price_starter_pkr", label: "Starter price (PKR)", placeholder: "999", type: "input" },
  { key: "price_pro_pkr", label: "Pro price (PKR)", placeholder: "2499", type: "input" },
  { key: "announcement", label: "Announcement banner", placeholder: "Welcome to TiPost!", type: "textarea" },
] as const;

export default function Settings() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("key, value");
      const m: Record<string, string> = {};
      (data ?? []).forEach((r: any) => (m[r.key] = r.value));
      setVals(m);
      setLoading(false);
    })();
  }, []);

  const save = async (key: string) => {
    setSaving(true);
    const value = vals[key] ?? "";
    const { error } = await supabase.from("app_settings").upsert({ key, value }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Configure pricing, webhook and announcements" />
      {loading ? (
        <div className="ti-card p-6 text-center text-muted-foreground">Loading…</div>
      ) : (
        KEYS.map((field) => (
          <div key={field.key} className="ti-card p-5 space-y-3">
            <label className="text-sm font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <Textarea
                value={vals[field.key] ?? ""}
                onChange={(e) => setVals({ ...vals, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={3}
              />
            ) : (
              <Input
                value={vals[field.key] ?? ""}
                onChange={(e) => setVals({ ...vals, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            )}
            <div className="flex justify-end">
              <Button onClick={() => save(field.key)} disabled={saving} className="btn-gradient h-10 px-5">
                Save
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}