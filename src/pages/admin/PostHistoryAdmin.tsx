import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Star } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("post_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data ?? []) as Row[]);
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

  const filtered = rows.filter(
    (r) => !search || r.topic.toLowerCase().includes(search.toLowerCase()) || r.post_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Post History" subtitle={`${rows.length} posts across all users`} />
      <div className="ti-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topic or content…" className="pl-9" />
        </div>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="ti-card p-6 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="ti-card p-6 text-center text-muted-foreground">No posts.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className="ti-card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-medium">{r.topic}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(r.created_at).toLocaleString()} · user {r.user_id.slice(0, 8)}
                  {r.style && ` · ${r.style}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.is_favorite && <Star className="h-4 w-4" style={{ color: "hsl(var(--accent-2))" }} />}
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{r.post_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}