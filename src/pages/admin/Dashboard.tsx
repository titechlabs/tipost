import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Users, KeyRound, FileText, DollarSign } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Counts {
  users: number;
  codes: number;
  posts: number;
  revenue: number;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({ users: 0, codes: 0, posts: 0, revenue: 0 });
  const [series, setSeries] = useState<{ date: string; posts: number }[]>([]);
  const [planDist, setPlanDist] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [u, c, p, rev, hist, users, recentPosts] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("access_codes").select("id", { count: "exact", head: true }),
        supabase.from("post_history").select("id", { count: "exact", head: true }),
        supabase.from("revenue_entries").select("amount_pkr"),
        supabase
          .from("post_history")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 13 * 86400000).toISOString()),
        supabase.from("users").select("plan"),
        supabase
          .from("post_history")
          .select("id, topic, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const totalRev = (rev.data ?? []).reduce((s, r: any) => s + (r.amount_pkr ?? 0), 0);
      setCounts({
        users: u.count ?? 0,
        codes: c.count ?? 0,
        posts: p.count ?? 0,
        revenue: totalRev,
      });

      // Build daily series for last 14 days
      const days: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        days[d] = 0;
      }
      (hist.data ?? []).forEach((row: any) => {
        const d = row.created_at.slice(0, 10);
        if (d in days) days[d] += 1;
      });
      setSeries(Object.entries(days).map(([date, posts]) => ({ date: date.slice(5), posts })));

      // Plan distribution
      const dist: Record<string, number> = { free: 0, starter: 0, pro: 0, none: 0 };
      (users.data ?? []).forEach((u: any) => {
        const k = u.plan ?? "none";
        dist[k] = (dist[k] ?? 0) + 1;
      });
      setPlanDist(Object.entries(dist).map(([name, value]) => ({ name, value })));

      setRecent(recentPosts.data ?? []);
    })();
  }, []);

  const COLORS = ["hsl(var(--accent))", "hsl(var(--accent-2))", "hsl(var(--violet))", "hsl(var(--muted-c))"];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your TiPost activity" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Users" value={counts.users} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Access Codes" value={counts.codes} icon={<KeyRound className="h-5 w-5" />} />
        <StatCard label="Posts Generated" value={counts.posts} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          label="Revenue"
          value={`PKR ${counts.revenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="ti-card p-5 lg:col-span-2">
          <div className="font-display text-lg mb-4">Posts (last 14 days)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="posts" stroke="hsl(var(--accent))" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ti-card p-5">
          <div className="font-display text-lg mb-4">Users by plan</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {planDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="ti-card p-5">
        <div className="font-display text-lg mb-4">Recent posts</div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <span className="truncate text-sm">{r.topic}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}