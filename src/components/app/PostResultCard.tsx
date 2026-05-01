import { Button } from "@/components/ui/button";
import { Check, Copy, Download, Linkedin, Eye, Pencil, Globe2, Lock } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LINKEDIN_LIMIT = 3000;

export function PostResultCard({
  index,
  total,
  text: initialText,
  imageBase64,
  delay,
}: {
  index: number;
  total?: number;
  text: string;
  imageBase64?: string;
  delay: number;
}) {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveImage = () => {
    if (!imageBase64) return;
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${imageBase64}`;
    a.download = `tipost-${index}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const postOnLinkedIn = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Text copied — paste into LinkedIn");
    window.open("https://www.linkedin.com/feed/", "_blank");
  };

  const chars = text.length;
  const over = chars > LINKEDIN_LIMIT;

  return (
    <div
      className="ti-card ti-card-glow p-5 sm:p-6 fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header row: numbering + preview toggle */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-xs uppercase tracking-wider inline-flex items-center gap-2"
          style={{ color: "hsl(var(--accent))" }}
        >
          Post {total ? `${index} / ${total}` : index}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing((v) => !v);
              if (!editing) setTimeout(() => ref.current?.focus(), 0);
            }}
            className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border hover:border-accent/60 hover:text-foreground text-muted-foreground"
          >
            {editing ? <Lock size={12} /> : <Pencil size={12} />}
            {editing ? "Done" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border hover:border-accent/60 hover:text-foreground text-muted-foreground"
          >
            <Eye size={12} /> Preview post
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_300px] md:items-start">
        {/* Post text — fixed height matched to image, internal scroll */}
        <div className="min-w-0 flex flex-col">
          {editing ? (
            <textarea
              ref={ref}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck
              className="w-full flex-1 h-[360px] resize-none rounded-xl bg-background/40 border border-accent/40 focus:border-accent/60 focus-visible:outline-none p-4 text-sm leading-relaxed font-sans whitespace-pre-wrap overflow-y-auto"
            />
          ) : (
            <div
              className="w-full flex-1 rounded-xl bg-background/40 border border-border p-4 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[360px]"
            >
              {text}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={
                over
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              }
            >
              {chars.toLocaleString()} / {LINKEDIN_LIMIT.toLocaleString()} characters
              {over && " — over LinkedIn's limit"}
            </span>
            {!over && chars > LINKEDIN_LIMIT * 0.85 && (
              <span className="text-amber-300/90">
                {LINKEDIN_LIMIT - chars} left
              </span>
            )}
          </div>
        </div>

        {/* Visual */}
        {imageBase64 ? (
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt={`Post ${index} visual`}
            className="w-full rounded-xl border border-border object-cover self-start sticky top-0"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 grid place-items-center text-xs text-muted-foreground p-6 h-[360px]">
            No visual generated
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          size="sm"
          onClick={copyText}
          className="btn-gradient h-9 px-4 text-xs"
        >
          {copied ? (
            <Check size={14} className="mr-1.5" />
          ) : (
            <Copy size={14} className="mr-1.5" />
          )}
          {copied ? "Copied!" : "Copy text"}
        </Button>
        {imageBase64 && (
          <Button
            variant="outline"
            size="sm"
            onClick={saveImage}
            className="rounded-full border-border bg-transparent"
          >
            <Download size={14} className="mr-1.5" /> Save image
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={postOnLinkedIn}
          className="rounded-full border-border bg-transparent"
        >
          <Linkedin size={14} className="mr-1.5" /> Open LinkedIn
        </Button>
      </div>

      {/* Centered LinkedIn preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-background border-border">
          <DialogHeader className="px-5 pt-5 pb-2">
            <DialogTitle className="text-sm font-medium text-muted-foreground">
              LinkedIn preview
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            <LinkedInPreviewCard text={text} imageBase64={imageBase64} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** In-app LinkedIn-style preview card — TiTechlabs branded. */
function LinkedInPreviewCard({
  text,
  imageBase64,
}: {
  text: string;
  imageBase64?: string;
}) {
  return (
    <div className="ti-card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-display text-white text-sm shrink-0"
          style={{
            background: "var(--gradient-button)",
            boxShadow: "var(--shadow-button)",
          }}
          aria-label="TiTechlabs"
        >
          Ti
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">TiTechlabs</p>
          <p className="text-xs text-muted-foreground leading-tight truncate">
            Building products for Pakistani founders & creators
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
            now · <Globe2 size={10} />
          </p>
        </div>
      </div>
      <div className="px-4 pb-3 max-h-[45vh] overflow-y-auto">
        <p className="text-[14px] leading-[1.55] whitespace-pre-wrap">{text}</p>
      </div>
      {imageBase64 && (
        <img
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt=""
          className="w-full border-t border-border object-cover max-h-36"
        />
      )}
    </div>
  );
}
