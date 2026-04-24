import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KeyRound, LogOut } from "lucide-react";
import { ChangePasswordDialog } from "@/components/app/ChangePasswordDialog";

export default function AdminLayout() {
  const { isAdmin, session, loading } = useIsAdmin();
  const [pwOpen, setPwOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const email = session.user.email ?? "";
  const initials = email[0]?.toUpperCase() ?? "A";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-3 gap-3 bg-background/60 backdrop-blur sticky top-0 z-20">
            <SidebarTrigger />
            <div className="font-display text-sm text-muted-foreground">Admin Console</div>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center text-xs font-medium">
                    {initials}
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
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
        <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} email={email} />
      </div>
    </SidebarProvider>
  );
}