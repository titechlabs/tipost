import { Button } from "@/components/ui/button";
import { Check, Copy, Download, Linkedin, Eye, Pencil, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const [showPreview, setShowPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to content
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 600)}px`;
  }, [text]);

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
          <span className="text-muted-foreground inline-flex items-center gap-1 normal-case tracking-normal">
            <Pencil size={11} /> Click to edit
          </span>
        </p>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <Eye size={13} />
          {showPreview ? "Hide preview" : "LinkedIn preview"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_300px]">
        {/* Editable post text */}
        <div className="min-w-0">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck
            className="w-full resize-none rounded-xl bg-background/40 border border-border focus:border-accent/60 focus-visible:outline-none p-4 text-sm leading-relaxed font-sans whitespace-pre-wrap min-h-[180px]"
          />
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
            className="w-full h-full max-h-[360px] rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 grid place-items-center text-xs text-muted-foreground p-6 min-h-[180px]">
            No visual generated
          </div>
        )}
      </div>

      {/* LinkedIn preview */}
      {showPreview && (
        <div className="mt-5">
          <LinkedInPreviewCard text={text} imageBase64={imageBase64} />
        </div>
      )}

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
    <div className="ti-card overflow-hidden max-w-xl">
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
      <div className="px-4 pb-3">
        <p className="text-[14px] leading-[1.55] whitespace-pre-wrap">{text}</p>
      </div>
      {imageBase64 && (
        <img
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt=""
          className="w-full border-t border-border object-cover max-h-72"
        />
      )}
    </div>
  );
}