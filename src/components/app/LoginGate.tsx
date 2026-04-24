import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Variant = "user" | "admin";

export function LoginGate({ variant = "user" }: { variant?: Variant } = {}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Sign-in failed.");
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${variant === "admin" ? "/admin" : "/app"}` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Sign-up failed.");
    } else {
      toast.success("Account created! You're signed in.");
    }
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
    // If redirected, browser navigates away.
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
    <CenteredCard>
      <div className="text-center">
        <Logo size="lg" />
        <h1 className="font-display text-2xl mt-6">
          {variant === "admin" ? "Admin Console" : "Welcome to TiPost"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {variant === "admin"
            ? "Sign in to manage TiPost."
            : "Your LinkedIn growth starts here."}
        </p>
      </div>

      {variant === "admin" && (
        <div className="mt-8 space-y-4">
          <Button
            type="button"
            onClick={signInGoogle}
            disabled={loading}
            variant="outline"
            className="w-full h-11 rounded-full font-medium"
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            or continue with email
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}

      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          {forgotOpen ? (
            <form onSubmit={sendReset} className="space-y-4 mt-4">
              <Field id="fp-email" label="Email" type="email" value={forgotEmail} onChange={setForgotEmail} />
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
            <form onSubmit={signIn} className="space-y-4 mt-4">
              <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} />
              <Field id="si-password" label="Password" type="password" value={password} onChange={setPassword} />
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
            </form>
          )}
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={signUp} className="space-y-4 mt-4">
            <Field id="su-email" label="Email" type="email" value={email} onChange={setEmail} />
            <Field id="su-password" label="Password (min 6 chars)" type="password" value={password} onChange={setPassword} />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={12} /> Back to home
        </Link>
      </div>
    </CenteredCard>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2" width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.9 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.9 28.9 5 24 5 16.3 5 9.6 9.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 34.7 26.6 35.5 24 35.5c-5.2 0-9.6-2.6-11.3-6.7l-6.5 5C9.5 38.6 16.2 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l5.8 4.9C40.7 35.6 43 30.2 43 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={type === "password" ? "current-password" : "email"}
      />
    </div>
  );
}

export function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="ti-card ti-card-glow p-8 w-full max-w-md fade-up">{children}</div>
    </div>
  );
}
