import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";

interface Row {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: string;
  created_at: string;
}

export default function Referrals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Referrals" subtitle={`${rows.length} referral records`} />
      <div className="ti-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3">Referrer</th>
                <th className="p-3">Referred user</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No referrals yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.referrer_id.slice(0, 8)}</td>
                  <td className="p-3 font-mono text-xs">{r.referred_user_id.slice(0, 8)}</td>
                  <td className="p-3"><Badge variant="secondary" className="capitalize">{r.status}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}