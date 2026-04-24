import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const identities = data.user?.identities ?? [];
      // If the user has an "email" identity, they have a password set.
      const emailIdentity = identities.find((i) => i.provider === "email");
      setHasPassword(!!emailIdentity);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);

    if (hasPassword) {
      // Re-authenticate with current password before changing it
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (signInErr) {
        setLoading(false);
        toast.error("Current password is incorrect.");
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Could not save password.");
    } else {
      toast.success(
        hasPassword
          ? "Password updated."
          : "Password set — you can now sign in with email and password.",
      );
      setHasPassword(true);
      reset();
      onOpenChange(false);
    }
  };

  const setMode = hasPassword === false;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{setMode ? "Set a password" : "Change password"}</DialogTitle>
          <DialogDescription>
            {hasPassword === null
              ? "Loading…"
              : setMode
                ? "Your account uses Google sign-in. Set a password to also sign in with email."
                : "Enter your current password and choose a new one."}
          </DialogDescription>
        </DialogHeader>
        {hasPassword !== null && (
          <form onSubmit={onSubmit} className="space-y-4">
            {!setMode && (
              <div className="space-y-2">
                <Label htmlFor="cp-current">Current password</Label>
                <Input
                  id="cp-current"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cp-new">New password (min 6 chars)</Label>
              <Input
                id="cp-new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-confirm">Confirm new password</Label>
              <Input
                id="cp-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading
                  ? setMode
                    ? "Saving…"
                    : "Updating…"
                  : setMode
                    ? "Set password"
                    : "Update password"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}