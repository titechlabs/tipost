import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Row {
  id: string;
  amount_pkr: number;
  plan: string;
  user_id: string | null;
  note: string | null;
  paid_at: string;
}

export default function Revenue() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [plan, setPlan] = useState<"free" | "starter" | "pro">("starter");
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("revenue_entries").select("*").order("paid_at", { ascending: false }).limit(500);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const total = rows.reduce((s, r) => s + r.amount_pkr, 0);
  const monthAgo = Date.now() - 30 * 86400000;
  const monthly = rows.filter((r) => new Date(r.paid_at).getTime() >= monthAgo).reduce((s, r) => s + r.amount_pkr, 0);

  const chartData: { month: string; amount: number }[] = (() => {
    const buckets: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets[d.toISOString().slice(0, 7)] = 0;
    }
    rows.forEach((r) => {
      const k = r.paid_at.slice(0, 7);
      if (k in buckets) buckets[k] += r.amount_pkr;
    });
    return Object.entries(buckets).map(([month, amount]) => ({ month: month.slice(2), amount }));
  })();

  const create = async () => {
    if (amount <= 0) return toast.error("Enter an amount");
    const { error } = await supabase.from("revenue_entries").insert({ amount_pkr: amount, plan, note: note || null });
    if (error) return toast.error(error.message);
    toast.success("Entry added");
    setOpen(false);
    setAmount(0);
    setNote("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete entry?")) return;
    await supabase.from("revenue_entries").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Track manual revenue entries"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient h-10 px-5"><Plus className="h-4 w-4 mr-1" /> Add entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add revenue entry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input type="number" placeholder="Amount (PKR)" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                <Select value={plan} onValueChange={(v) => setPlan(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <DialogFooter>
                <Button onClick={create} className="btn-gradient h-10 px-5">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total revenue" value={`PKR ${total.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Last 30 days" value={`PKR ${monthly.toLocaleString()}`} />
        <StatCard label="Entries" value={rows.length} />
      </div>
      <div className="ti-card p-5">
        <div className="font-display text-lg mb-4">Revenue by month</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="ti-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Date</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Note</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No revenue entries yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(r.paid_at).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{r.plan}</td>
                  <td className="p-3">PKR {r.amount_pkr.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{r.note ?? "—"}</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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