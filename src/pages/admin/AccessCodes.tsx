import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Copy, RefreshCw, Search } from "lucide-react";

type Plan = "free" | "starter" | "pro";

interface Code {
  id: string;
  code: string;
  plan: Plan;
  daily_limit: number;
  daily_used: number;
  active: boolean;
  linked_user_id: string | null;
  created_at: string;
}

const planLimits: Record<Plan, number> = { free: 1, starter: 5, pro: 10 };
const planLabels: Record<Plan, string> = {
  free: "Free (1/day)",
  starter: "Starter (5/day)",
  pro: "Pro (10/day)",
};

function randomCode(prefix = "TIPOST") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

export default function AccessCodes() {
  const [rows, setRows] = useState<Code[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // single create
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newPlan, setNewPlan] = useState<Plan>("free");

  // bulk
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPlan, setBulkPlan] = useState<Plan>("free");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const list = (data ?? []) as Code[];
    setRows(list);
    const ids = Array.from(
      new Set(list.map((r) => r.linked_user_id).filter(Boolean) as string[]),
    );
    if (ids.length) {
      const { data: users } = await supabase
        .from("users")
        .select("id,email")
        .in("id", ids);
      const map: Record<string, string> = {};
      (users ?? []).forEach((u: { id: string; email: string | null }) => {
        if (u.email) map[u.id] = u.email;
      });
      setEmails(map);
    } else {
      setEmails({});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const code = newCode.trim() || randomCode();
    const { error } = await supabase
      .from("access_codes")
      .insert({ code, plan: newPlan, daily_limit: planLimits[newPlan] });
    if (error) return toast.error(error.message);
    toast.success("Code created");
    setOpen(false);
    setNewCode("");
    load();
  };

  const bulkCreate = async () => {
    const items = Array.from({ length: bulkCount }, () => ({
      code: randomCode(`TIPOST-${bulkPlan.toUpperCase()}`),
      plan: bulkPlan,
      daily_limit: planLimits[bulkPlan],
    }));
    const { error } = await supabase.from("access_codes").insert(items);
    if (error) return toast.error(error.message);
    toast.success(`Created ${bulkCount} codes`);
    setBulkOpen(false);
    load();
  };

  const toggleActive = async (row: Code) => {
    const { error } = await supabase
      .from("access_codes")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this code? This cannot be undone.")) return;
    const { error } = await supabase.from("access_codes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const resetUsage = async (id: string) => {
    const { error } = await supabase
      .from("access_codes")
      .update({ daily_used: 0, last_reset_date: new Date().toISOString().slice(0, 10) })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Usage reset");
    load();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied");
  };

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.code.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || r.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Codes"
        subtitle={`${rows.length} total · ${rows.filter((r) => r.linked_user_id).length} redeemed`}
        actions={
          <>
            <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full">Bulk generate</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk generate codes</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <label className="text-sm">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                  />
                  <label className="text-sm">Plan</label>
                  <Select value={bulkPlan} onValueChange={(v) => setBulkPlan(v as Plan)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">{planLabels.free}</SelectItem>
                      <SelectItem value="starter">{planLabels.starter}</SelectItem>
                      <SelectItem value="pro">{planLabels.pro}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={bulkCreate} className="btn-gradient h-10 px-5">Generate</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient h-10 px-5"><Plus className="h-4 w-4 mr-1" /> New code</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create access code</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <label className="text-sm">Code (leave blank to auto-generate)</label>
                  <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="TIPOST-XXXXXX" />
                  <label className="text-sm">Plan</label>
                  <Select value={newPlan} onValueChange={(v) => setNewPlan(v as Plan)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">{planLabels.free}</SelectItem>
                      <SelectItem value="starter">{planLabels.starter}</SelectItem>
                      <SelectItem value="pro">{planLabels.pro}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={create} className="btn-gradient h-10 px-5">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="ti-card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code…" className="pl-9" />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ti-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Code</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Status</th>
                <th className="p-3">Linked user</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No codes found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono">{r.code}</td>
                  <td className="p-3"><Badge variant="secondary" className="capitalize">{r.plan}</Badge></td>
                  <td className="p-3">{r.daily_used} / {r.daily_limit}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                      <span className="text-xs text-muted-foreground">{r.active ? "Active" : "Disabled"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.linked_user_id
                      ? emails[r.linked_user_id] ?? (
                          <span className="font-mono">
                            {r.linked_user_id.slice(0, 8)}…
                          </span>
                        )
                      : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => copy(r.code)}><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => resetUsage(r.id)} title="Reset usage"><RefreshCw className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}