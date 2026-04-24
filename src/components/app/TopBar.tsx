import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/app/ChangePasswordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Plan = "free" | "starter" | "pro";

export function TopBar({
  email,
  plan,
  used,
  limit,
  avatarUrl,
}: {
  email: string;
  plan: Plan | null;
  used: number;
  limit: number;
  avatarUrl?: string | null;
}) {
  const [pwOpen, setPwOpen] = useState(false);
  const planColor: Record<Plan, string> = {
    free: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    starter: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    pro: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  };

  const initials = email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <div className="flex items-center gap-3">
          {plan && (
            <span
              className={`hidden sm:inline-flex text-xs font-medium px-3 py-1 rounded-full border ${planColor[plan]}`}
            >
              {plan.toUpperCase()}
            </span>
          )}
          <span className="hidden sm:inline-flex text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
            {used}/{limit} posts today
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center text-sm font-medium">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPwOpen(true)}>
                <KeyRound size={14} className="mr-2" /> Change password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                <LogOut size={14} className="mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="sm:hidden container pb-3 flex gap-2 text-xs">
        {plan && (
          <span className={`px-2.5 py-1 rounded-full border ${planColor[plan]}`}>
            {plan.toUpperCase()}
          </span>
        )}
        <span className="text-muted-foreground border border-border rounded-full px-2.5 py-1">
          {used}/{limit} posts today
        </span>
      </div>
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} email={email} />
    </header>
  );
}