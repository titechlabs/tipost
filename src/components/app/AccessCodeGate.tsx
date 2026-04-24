import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { CenteredCard } from "./LoginGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AccessCodeGate({
  initialRef = "",
  onUnlocked,
}: {
  initialRef?: string;
  onUnlocked: () => void;
}) {
  const [code, setCode] = useState("");
  const [ref, setRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("redeem_access_code", {
      _code: code.trim(),
      _ref_code: ref.trim() || undefined,
    });
    setLoading(false);
    const result = data as { ok: boolean; error?: string } | null;
    if (error || !result?.ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(result?.error || error?.message || "Invalid or already used code");
      return;
    }
    toast.success("Access unlocked!");
    onUnlocked();
  };

  return (
    <CenteredCard>
      <div className={shake ? "shake" : ""}>
        <div className="text-center">
          <Logo size="lg" />
          <h1 className="font-display text-2xl mt-6">Enter Your Access Code</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Purchase a plan and receive your code via WhatsApp.
          </p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TIPOST-XXXXXX-XXX"
            className="h-12 text-center font-mono tracking-widest bg-secondary border-border"
            autoFocus
          />
          <Button type="submit" disabled={loading || !code} className="btn-gradient w-full h-11">
            {loading ? "Unlocking..." : "Unlock Access →"}
          </Button>
          <div>
            <label className="text-xs text-muted-foreground">Have a referral code? (optional)</label>
            <Input
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              placeholder="REF-XXXXXX"
              className="h-10 mt-1 bg-secondary border-border"
            />
          </div>
        </form>
        <a
          href="https://wa.me/923175982953"
          target="_blank"
          rel="noreferrer"
          className="block mt-5 text-center text-sm hover:underline"
          style={{ color: "hsl(var(--accent-2))" }}
        >
          Get a code via WhatsApp →
        </a>
      </div>
    </CenteredCard>
  );
}