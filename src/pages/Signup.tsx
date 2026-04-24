import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthShell, AuthHeader, AuthField, BackToHome, GoogleIcon } from "@/components/auth/AuthShell";

export default function Signup() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuthSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Create account — TiPost";
  }, []);

  useEffect(() => {
    if (!sessionLoading && session) navigate("/app", { replace: true });
  }, [session, sessionLoading, navigate]);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Sign-up failed.");
      return;
    }
    if (data.session) {
      toast.success("Account created! Enjoy your free post.");
      navigate("/app", { replace: true });
    } else {
      toast.success("Account created. Check your email to confirm.");
    }
  };

  const signUpWithGoogle = async () => {
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
        title="Create your account"
        subtitle="Start free — generate your first LinkedIn post in 60 seconds."
      />

      <form onSubmit={signUp} className="space-y-4 mt-8">
        <AuthField id="su-name" label="Name" type="text" value={name} onChange={setName} autoComplete="name" placeholder="Your full name" />
        <AuthField id="su-email" label="Email" type="email" value={email} onChange={setEmail} />
        <AuthField id="su-password" label="Password (min 6 chars)" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
        >
          {loading ? "Creating account..." : "Create account"}
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
          onClick={signUpWithGoogle}
          disabled={loading}
          variant="outline"
          className="w-full h-11 rounded-full font-medium"
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <BackToHome />
    </AuthShell>
  );
}