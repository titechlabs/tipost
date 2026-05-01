import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  user_id: string;
  topic: string;
  post_text: string;
  is_favorite: boolean;
  style: string | null;
  created_at: string;
}

export default function PostHistoryAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("post_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const list = (data ?? []) as Row[];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length) {
      const { data: u } = await supabase.from("users").select("id, email").in("id", ids);
      const map: Record<string, string> = {};
      (u ?? []).forEach((row: any) => {
        if (row.email) map[row.id] = row.email;
      });
      setEmails(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("post_history").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = rows.filter(
    (r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.topic.toLowerCase().includes(q) ||
        r.post_text.toLowerCase().includes(q) ||
        (emails[r.user_id] ?? "").toLowerCase().includes(q)
      );
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Post History" subtitle={`${rows.length} posts across all users`} />
      <div className="ti-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topic, content, or user email…" className="pl-9" />
        </div>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="ti-card p-6 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="ti-card p-6 text-center text-muted-foreground">No posts.</div>
        ) : filtered.map((r) => {
          const isOpen = expanded.has(r.id);
          const userLabel = emails[r.user_id] ?? `user ${r.user_id.slice(0, 8)}`;
          return (
            <div key={r.id} className="ti-card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.topic}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.created_at).toLocaleString()} · {userLabel}
                    {r.style && ` · ${r.style}`} · {r.post_text.length} chars
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.is_favorite && <Star className="h-4 w-4" style={{ color: "hsl(var(--accent-2))" }} />}
                  <Button size="icon" variant="ghost" onClick={() => toggle(r.id)} title={isOpen ? "Collapse" : "Expand"}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${isOpen ? "" : "line-clamp-3"}`}>
                {r.post_text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}