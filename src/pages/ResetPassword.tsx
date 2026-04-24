import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { CenteredCard } from "@/components/app/LoginGate";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password — TiPost";
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // If already signed in (recovery token applied), allow update
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Could not update password.");
    } else {
      toast.success("Password updated. Redirecting…");
      setTimeout(() => navigate("/app"), 800);
    }
  };

  return (
    <CenteredCard>
      <div className="text-center">
        <Logo size="lg" />
        <h1 className="font-display text-2xl mt-6">Set a new password</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {ready ? "Choose a new password for your account." : "Verifying reset link…"}
        </p>
      </div>
      {ready && (
        <form onSubmit={onSubmit} className="space-y-4 mt-8">
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <Input
              id="np"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="np2">Confirm new password</Label>
            <Input
              id="np2"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
          >
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </CenteredCard>
  );
}