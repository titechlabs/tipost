import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function LoginGate() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Sign-up failed.");
    } else {
      toast.success("Account created! You're signed in.");
    }
  };

  return (
    <CenteredCard>
      <div className="text-center">
        <Logo size="lg" />
        <h1 className="font-display text-2xl mt-6">Welcome to TiPost</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your LinkedIn growth starts here.
        </p>
      </div>

      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={signIn} className="space-y-4 mt-4">
            <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} />
            <Field id="si-password" label="Password" type="password" value={password} onChange={setPassword} />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-full font-medium"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
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
    </CenteredCard>
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
