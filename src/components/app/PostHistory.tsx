import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Copy, RefreshCw, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Row = {
  id: string;
  topic: string;
  post_text: string;
  is_favorite: boolean;
  created_at: string;
};

export function PostHistory({
  userId,
  refreshKey,
  onRegenerate,
}: {
  userId: string;
  refreshKey: number;
  onRegenerate: (topic: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("post_history")
      .select("id,topic,post_text,is_favorite,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId, refreshKey]);

  const toggleFav = async (row: Row) => {
    const next = !row.is_favorite;
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, is_favorite: next } : x)));
    await supabase.from("post_history").update({ is_favorite: next }).eq("id", row.id);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const clearAll = async () => {
    await supabase.from("post_history").delete().eq("user_id", userId);
    setRows([]);
    toast.success("History cleared");
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (favOnly && !r.is_favorite) return false;
      if (search && !r.topic.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, favOnly]);

  // Compute per-batch numbering: posts created within ~10s of each other on the
  // same topic are treated as one batch. Each item gets {n,total} for that batch.
  const enriched = useMemo(() => {
    // Sort ascending so the first generated post in a batch is #1.
    const asc = [...filtered].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const batchKey = (r: Row, prevTime: number | null) => {
      const t = new Date(r.created_at).getTime();
      if (prevTime !== null && Math.abs(t - prevTime) < 10_000) return null;
      return r.id;
    };
    const groups: Record<string, Row[]> = {};
    let currentKey = "";
    let lastTime: number | null = null;
    let lastTopic = "";
    for (const r of asc) {
      const t = new Date(r.created_at).getTime();
      const sameBatch =
        lastTime !== null &&
        r.topic === lastTopic &&
        Math.abs(t - lastTime) < 10_000;
      if (!sameBatch) currentKey = `${r.topic}::${r.id}`;
      (groups[currentKey] ||= []).push(r);
      lastTime = t;
      lastTopic = r.topic;
    }
    const meta = new Map<string, { n: number; total: number }>();
    for (const items of Object.values(groups)) {
      items.forEach((it, idx) => {
        meta.set(it.id, { n: idx + 1, total: items.length });
      });
    }
    // Return rows back in descending (newest first) order with their batch meta.
    return filtered.map((r) => ({ row: r, meta: meta.get(r.id) }));
  }, [filtered]);

  // Show first non-topic line as the preview snippet so siblings look distinct.
  const previewLine = (row: Row) => {
    const lines = row.post_text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const topicLower = row.topic.trim().toLowerCase();
    const distinct = lines.find((l) => l.toLowerCase() !== topicLower) ?? lines[0] ?? "";
    return distinct;
  };

  return (
    <section className="ti-card p-6 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl">Your post history</h3>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="h-9 w-40 sm:w-56 bg-secondary border-border text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFavOnly((v) => !v)}
            className={`rounded-full border-border bg-transparent ${favOnly ? "text-yellow-400" : ""}`}
            aria-label="Show favorites only"
            title="Show favorites only"
          >
            <Star size={14} className={favOnly ? "fill-yellow-400" : ""} />
          </Button>
          {rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-border bg-transparent"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={13} className="mr-2" /> Clear history…
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes all your saved posts. Generated content
                        can be re-created but not recovered.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAll}>
                        Delete all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No posts yet. Generate your first one above! ✨
          </div>
        )}
        {enriched.map(({ row: r, meta }) => (
          <div key={r.id} className="border border-border rounded-2xl p-4 bg-surface/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {r.topic}
                  {meta && meta.total > 1 && (
                    <span className="ml-1.5 text-muted-foreground font-normal">
                      ({meta.n}/{meta.total})
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(r.created_at)}</p>
              </div>
              <button onClick={() => toggleFav(r)} aria-label="Toggle favorite">
                <Star
                  size={18}
                  className={r.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                />
              </button>
            </div>
            <button
              className="text-left w-full mt-2 text-sm text-muted-foreground"
              onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
            >
              {expanded[r.id] ? (
                <p className="whitespace-pre-wrap">{r.post_text}</p>
              ) : (
                <p className="line-clamp-2">{previewLine(r)}</p>
              )}
            </button>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => copy(r.post_text)} className="rounded-full border-border bg-transparent">
                <Copy size={13} className="mr-1.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => onRegenerate(r.topic)} className="rounded-full border-border bg-transparent">
                <RefreshCw size={13} className="mr-1.5" /> Regenerate similar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}