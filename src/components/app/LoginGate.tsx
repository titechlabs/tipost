import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useState } from "react";

export function LoginGate() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if ("error" in res && res.error) {
        toast.error("Sign-in failed. Please try again.");
      }
    } catch {
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredCard>
      <div className="text-center">
        <Logo size="lg" />
        <h1 className="font-display text-2xl mt-6">Sign in to continue</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your LinkedIn growth starts here.
        </p>
      </div>
      <Button
        onClick={signIn}
        disabled={loading}
        className="w-full h-11 mt-8 bg-white text-black hover:bg-white/90 rounded-full font-medium"
      >
        <GoogleIcon /> {loading ? "Redirecting..." : "Continue with Google"}
      </Button>
    </CenteredCard>
  );
}

export function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="ti-card ti-card-glow p-8 w-full max-w-md fade-up">{children}</div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.46-.81 5.95-2.18l-2.9-2.26c-.81.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.45 15.98 5.48 18 9 18Z"/>
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33Z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/>
    </svg>
  );
}