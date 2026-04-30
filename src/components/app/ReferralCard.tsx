import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Gift, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function ReferralCard({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [count, setCount] = useState(0);
  const [rewarded, setRewarded] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.from("users").select("referral_code").eq("id", userId).maybeSingle();
      if (u?.referral_code) setCode(u.referral_code);
      const { count: total } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", userId);
      const { count: r } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", userId)
        .eq("status", "rewarded");
      setCount(total ?? 0);
      setRewarded(r ?? 0);
    })();
  }, [userId]);

  const link = `${window.location.origin}/app?ref=${code}`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied");
  };

  return (
    <section className="ti-card p-5 fade-up">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2 font-display text-lg">
          <Gift size={18} style={{ color: "hsl(var(--accent-2))" }} /> Refer & Earn
        </span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <div className="text-sm space-y-1.5">
            <p>
              <span className="text-foreground font-medium">Earn 1 free month</span>{" "}
              <span className="text-muted-foreground">
                for every friend who subscribes.
              </span>
            </p>
            <p className="text-muted-foreground">
              They get <span className="text-foreground font-medium">10% off</span> their first month.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 h-10 px-3 rounded-full bg-secondary border border-border text-sm font-mono"
            />
            <Button onClick={copyLink} className="btn-gradient h-10 px-5">
              <Copy size={14} className="mr-1.5" /> Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{count}</span>{" "}
            {count === 1 ? "referral" : "referrals"} ·{" "}
            <span className="text-foreground font-medium">{rewarded}</span>{" "}
            {rewarded === 1 ? "reward" : "rewards"} earned
          </p>
        </div>
      )}
    </section>
  );
}