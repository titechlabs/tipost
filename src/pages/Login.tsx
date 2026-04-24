import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthShell, AuthHeader, AuthField, BackToHome, GoogleIcon } from "@/components/auth/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    document.title = "Sign in — TiPost";
  }, []);

  useEffect(() => {
    if (!sessionLoading && session) navigate("/app", { replace: true });
  }, [session, sessionLoading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Sign-in failed.");
    } else {
      navigate("/app", { replace: true });
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

  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app`,
    });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message || "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate("/app", { replace: true });
  };

  return (
    <AuthShell>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to keep generating LinkedIn posts."
      />

      {forgotOpen ? (
        <form onSubmit={sendReset} className="space-y-4 mt-8">
          <AuthField id="fp-email" label="Email" type="email" value={forgotEmail} onChange={setForgotEmail} />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
          >
            {loading ? "Sending..." : "Send reset link"}
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
        <form onSubmit={signIn} className="space-y-4 mt-8">
          <AuthField id="si-email" label="Email" type="email" value={email} onChange={setEmail} />
          <AuthField id="si-password" label="Password" type="password" value={password} onChange={setPassword} />
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
            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            variant="outline"
            className="w-full h-11 rounded-full font-medium"
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            New here?{" "}
            <Link to="/signup" className="text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      )}

      <BackToHome />
    </AuthShell>
  );
}