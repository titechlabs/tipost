import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthShell, AuthHeader, AuthField, BackToHome, GoogleIcon } from "@/components/auth/AuthShell";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    document.title = "Admin sign in — TiPost";
  }, []);

  useEffect(() => {
    if (sessionLoading || !session) return;
    // Verify admin role; if not admin, sign out and warn
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          navigate("/admin", { replace: true });
        } else {
          await supabase.auth.signOut();
          toast.error("This account isn't an admin.");
        }
      });
  }, [session, sessionLoading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message || "Sign-in failed.");
  };

  const signInGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed.");
    }
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Could not send reset link.");
    } else {
      toast.success("Password reset link sent. Check your email.");
      setForgotOpen(false);
      setForgotEmail("");
    }
  };

  return (
    <AuthShell side="admin">
      <AuthHeader
        title="Admin"
        highlight="console"
        subtitle="Sign in to manage TiPost — users, codes, revenue."
      />

      <div className="mt-8 space-y-4">
        <Button
          type="button"
          onClick={signInGoogle}
          disabled={loading}
          variant="outline"
          className="w-full h-11 rounded-full font-medium hover:-translate-y-0.5 transition-transform"
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          or sign in with email
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {forgotOpen ? (
        <form onSubmit={sendReset} className="space-y-4 mt-6">
          <AuthField id="afp-email" label="Email" type="email" value={forgotEmail} onChange={setForgotEmail} />
          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full h-11"
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" />Sending…</>
            ) : (
              "Send reset link"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setForgotOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form onSubmit={signIn} className="space-y-4 mt-6">
          <AuthField id="ai-email" label="Email" type="email" value={email} onChange={setEmail} />
          <AuthField id="ai-password" label="Password" type="password" value={password} onChange={setPassword} />
          <div className="text-right">
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </button>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full h-11"
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" />Signing in…</>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      )}

      <BackToHome />
    </AuthShell>
  );
}