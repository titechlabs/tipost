import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string | null;
  plan: string | null;
  referral_code: string;
  referral_count: number;
  created_at: string;
}

const PLAN_LIMITS: Record<string, number> = { free: 1, starter: 5, pro: 10 };
const planLabel = (plan: string | null) => {
  if (!plan) return "No plan";
  const limit = PLAN_LIMITS[plan];
  return limit ? `${plan} · ${limit}/day` : plan;
};

export default function Users() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: roleData }] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    setRows((data ?? []) as UserRow[]);
    setAdmins(new Set((roleData ?? []).map((r: any) => r.user_id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (userId: string) => {
    if (admins.has(userId)) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Granted admin");
    }
    load();
  };

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.referral_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle={`${rows.length} total users`} />
      <div className="ti-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or referral code…" className="pl-9" />
        </div>
      </div>
      <div className="ti-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Referral</th>
                <th className="p-3">Referrals</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No users.</td></tr>
              ) : filtered.map((r) => {
                const isAdmin = admins.has(r.id);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{r.email ?? "—"}</span>
                        {isAdmin && (
                          <Badge className="capitalize" style={{ background: "hsl(var(--accent) / 0.15)", color: "hsl(var(--accent))" }}>
                            Admin
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="capitalize whitespace-nowrap">{planLabel(r.plan)}</Badge></td>
                    <td className="p-3 font-mono text-xs">{r.referral_code}</td>
                    <td className="p-3">{r.referral_count}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant={isAdmin ? "destructive" : "outline"} onClick={() => toggleAdmin(r.id)}>
                        {isAdmin ? <><ShieldOff className="h-4 w-4 mr-1" /> Revoke</> : <><Shield className="h-4 w-4 mr-1" /> Make admin</>}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}