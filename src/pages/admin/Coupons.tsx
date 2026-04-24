import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function Coupons() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [maxUses, setMaxUses] = useState<number | "">("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!code.trim()) return toast.error("Code is required");
    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      max_uses: maxUses === "" ? null : Number(maxUses),
    });
    if (error) return toast.error(error.message);
    toast.success("Coupon created");
    setOpen(false);
    setCode("");
    load();
  };

  const toggle = async (r: Row) => {
    await supabase.from("coupons").update({ active: !r.active }).eq("id", r.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        subtitle={`${rows.length} coupons`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient h-10 px-5"><Plus className="h-4 w-4 mr-1" /> New coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create coupon</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="WELCOME10" value={code} onChange={(e) => setCode(e.target.value)} />
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="flat">Flat (PKR)</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Value" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                <Input type="number" placeholder="Max uses (optional)" value={maxUses} onChange={(e) => setMaxUses(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <DialogFooter>
                <Button onClick={create} className="btn-gradient h-10 px-5">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="ti-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Uses</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No coupons.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono">{r.code}</td>
                  <td className="p-3">{r.discount_type === "percent" ? `${r.discount_value}%` : `PKR ${r.discount_value}`}</td>
                  <td className="p-3">{r.used_count}{r.max_uses ? ` / ${r.max_uses}` : ""}</td>
                  <td className="p-3"><Switch checked={r.active} onCheckedChange={() => toggle(r)} /></td>
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