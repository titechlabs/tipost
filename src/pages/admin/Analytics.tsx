import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function Analytics() {
  const [topics, setTopics] = useState<{ topic: string; posts: number }[]>([]);
  const [byPlan, setByPlan] = useState<{ plan: string; posts: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("topic_analytics").select("topic, plan, posts_count").limit(2000);
      const topicMap: Record<string, number> = {};
      const planMap: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        topicMap[r.topic] = (topicMap[r.topic] ?? 0) + (r.posts_count ?? 1);
        const p = r.plan ?? "unknown";
        planMap[p] = (planMap[p] ?? 0) + (r.posts_count ?? 1);
      });
      setTopics(
        Object.entries(topicMap)
          .map(([topic, posts]) => ({ topic: topic.slice(0, 30), posts }))
          .sort((a, b) => b.posts - a.posts)
          .slice(0, 10)
      );
      setByPlan(Object.entries(planMap).map(([plan, posts]) => ({ plan, posts })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="What people are creating" />
      <div className="ti-card p-5">
        <div className="font-display text-lg mb-4">Top topics</div>
        <div className="h-80">
          {loading ? (
            <div className="h-full grid place-items-center text-muted-foreground">Loading…</div>
          ) : topics.length === 0 ? (
            <div className="h-full grid place-items-center text-muted-foreground">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="topic" stroke="hsl(var(--muted-foreground))" fontSize={12} width={140} />
                <Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="posts" fill="hsl(var(--accent-2))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="ti-card p-5">
        <div className="font-display text-lg mb-4">Posts by plan</div>
        <div className="h-64">
          {loading ? (
            <div className="h-full grid place-items-center text-muted-foreground">Loading…</div>
          ) : byPlan.length === 0 ? (
            <div className="h-full grid place-items-center text-muted-foreground">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="plan" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="posts" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}