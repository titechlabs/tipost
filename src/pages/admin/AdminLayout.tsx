import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LoginGate } from "@/components/app/LoginGate";

export default function AdminLayout() {
  const { isAdmin, session, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }
  if (!session) return <LoginGate />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-3 gap-3 bg-background/60 backdrop-blur sticky top-0 z-20">
            <SidebarTrigger />
            <div className="font-display text-sm text-muted-foreground">Admin Console</div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}