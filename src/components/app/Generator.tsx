import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "./LoadingState";
import { PostResultCard } from "./PostResultCard";

export type GeneratedPost = { text: string; image?: string };

export function Generator({
  userId,
  maxPerRun,
  onGenerated,
  presetTopic,
  outOfCredits = false,
}: {
  userId: string;
  maxPerRun: number;
  onGenerated: () => void;
  presetTopic?: string;
  outOfCredits?: boolean;
}) {
  const [topic, setTopic] = useState(presetTopic ?? "");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);

  // sync preset
  if (presetTopic && presetTopic !== topic && results.length === 0 && !loading) {
    // only set initially
  }

  const inc = () => setCount((c) => Math.min(maxPerRun, c + 1));
  const dec = () => setCount((c) => Math.max(1, c - 1));

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: { topic: topic.trim(), posts: count },
      });
      if (error) {
        // Edge function returns 402 with upgrade flag when credits exhausted
        const ctx = (error as unknown as { context?: { body?: string } })?.context;
        let upgrade = false;
        try {
          const parsed = ctx?.body ? JSON.parse(ctx.body) : null;
          upgrade = !!parsed?.upgrade;
          if (parsed?.error) toast.error(parsed.error);
          else toast.error(error.message || "Generation failed");
        } catch {
          toast.error(error.message || "Generation failed");
        }
        if (upgrade) {
          // Surface upgrade banner state implicitly by parent prop on next reload;
          // user can click the visible upgrade CTA above.
        }
        return;
      }
      const payload = (data as { ok: boolean; data: unknown; error?: string }) ?? null;
      if (!payload?.ok) {
        toast.error(payload?.error || "Generation failed");
        return;
      }

      const items: GeneratedPost[] = parseN8nResponse(payload.data);
      if (items.length === 0) {
        toast.error("No posts returned. Try again.");
        return;
      }
      setResults(items);

      // Save to history
      const rows = items.map((p) => ({
        user_id: userId,
        topic: topic.trim(),
        post_text: p.text,
      }));
      await supabase.from("post_history").insert(rows);
      onGenerated();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {outOfCredits && (
        <div className="ti-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 fade-up border-amber-500/30 bg-amber-500/5">
          <Lock size={20} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <h3 className="font-display text-lg">You've used your free post</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to a paid plan to keep generating LinkedIn posts.
            </p>
          </div>
          <Button asChild className="btn-gradient h-11 px-5 shrink-0">
            <Link to="/pricing">Upgrade to continue</Link>
          </Button>
        </div>
      )}
      <div className="ti-card ti-card-glow p-6 sm:p-8 fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Generate LinkedIn Posts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a topic — TiPost researches, writes, and visualizes it.
        </p>
        <div className="mt-6 space-y-3">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI in Pakistan, Instagram Growth, Remote Work..."
            className="h-12 text-base bg-secondary border-border"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-1 border border-border rounded-full px-1 h-12 w-fit">
              <Button
                size="icon"
                variant="ghost"
                onClick={dec}
                disabled={count <= 1}
                className="rounded-full h-9 w-9"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </Button>
              <span className="w-10 text-center font-mono">{count}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={inc}
                disabled={count >= maxPerRun}
                className="rounded-full h-9 w-9"
                aria-label="Increase"
              >
                <Plus size={16} />
              </Button>
            </div>
            <Button
              onClick={generate}
              disabled={loading || !topic.trim() || outOfCredits}
              className="btn-gradient h-12 px-7 flex-1 sm:flex-none"
            >
              <Sparkles size={16} className="mr-2" />
              {loading ? "Generating..." : "Generate →"}
            </Button>
            <p className="text-xs text-muted-foreground sm:ml-auto">
              Up to <span className="text-foreground">{maxPerRun}</span> per run
            </p>
          </div>
        </div>
      </div>

      {loading && <LoadingState />}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl">Generated Posts</h3>
            <span className="pill">{results.length} posts ready</span>
          </div>
          {results.map((r, i) => (
            <PostResultCard
              key={i}
              index={i + 1}
              text={r.text}
              imageBase64={r.image}
              delay={i * 80}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * n8n returns an array; some items have d.formattedText, others have d.result.image.
 * Match by index.
 */
function parseN8nResponse(raw: unknown): GeneratedPost[] {
  const arr = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [];
  const texts: string[] = [];
  const images: string[] = [];
  for (const item of arr as any[]) {
    if (!item || typeof item !== "object") continue;
    if (typeof item.formattedText === "string") texts.push(item.formattedText);
    if (item.result && typeof item.result.image === "string") images.push(item.result.image);
    // also handle nested {data:[{formattedText}]}
    if (Array.isArray(item.data)) {
      for (const inner of item.data) {
        if (typeof inner.formattedText === "string") texts.push(inner.formattedText);
        if (inner.result?.image) images.push(inner.result.image);
      }
    }
  }
  const len = Math.max(texts.length, images.length);
  const out: GeneratedPost[] = [];
  for (let i = 0; i < len; i++) {
    if (texts[i] || images[i]) out.push({ text: texts[i] ?? "", image: images[i] });
  }
  return out;
}