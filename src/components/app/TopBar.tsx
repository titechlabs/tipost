import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut, KeyRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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
  const [hasPassword, setHasPassword] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const identities = data.user?.identities ?? [];
      setHasPassword(identities.some((i) => i.provider === "email"));
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const planColor: Record<Plan, string> = {
    free: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    starter: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    pro: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  };

  const initials = email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
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
          {plan !== "pro" && (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex btn-gradient h-9 px-4 text-xs"
            >
              <Link to="/pricing">Upgrade</Link>
            </Button>
          )}
          <Button
            onClick={() => supabase.auth.signOut()}
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-9 w-9 rounded-full"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </Button>
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
                <KeyRound size={14} className="mr-2" />
                {hasPassword ? "Change password" : "Set password"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                <LogOut size={14} className="mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="md:hidden container pb-3 flex flex-wrap items-center gap-2 text-xs">
        <NavLink to="/" end className="text-muted-foreground hover:text-foreground px-2 py-1">Home</NavLink>
        <NavLink to="/pricing" className="text-muted-foreground hover:text-foreground px-2 py-1">Pricing</NavLink>
        <NavLink to="/app" className="text-muted-foreground hover:text-foreground px-2 py-1">Dashboard</NavLink>
        {plan && (
          <span className={`ml-auto px-2.5 py-1 rounded-full border ${planColor[plan]}`}>
            {plan.toUpperCase()}
          </span>
        )}
        <span className="text-muted-foreground border border-border rounded-full px-2.5 py-1">
          {used}/{limit} today
        </span>
      </div>
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} email={email} />
    </header>
  );
}