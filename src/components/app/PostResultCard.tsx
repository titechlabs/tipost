import { Button } from "@/components/ui/button";
import { Check, Copy, Download, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PostResultCard({
  index,
  text,
  imageBase64,
  delay,
}: {
  index: number;
  text: string;
  imageBase64?: string;
  delay: number;
}) {
  const [copied, setCopied] = useState(false);

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
    a.download = `post-${index}-image.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const postOnLinkedIn = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Text copied — paste into LinkedIn");
    window.open("https://www.linkedin.com/feed/", "_blank");
  };

  return (
    <div className="ti-card ti-card-glow p-5 fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="grid gap-5 md:grid-cols-[1fr,260px]">
        <div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "hsl(var(--accent))" }}>
            Post {index}
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 max-h-80 overflow-auto pr-2">
            {text}
          </pre>
        </div>
        {imageBase64 && (
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt={`Post ${index} visual`}
            className="w-full rounded-xl border border-border object-cover"
          />
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={copyText} className="rounded-full border-border bg-transparent">
          {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
          {copied ? "Copied!" : "Copy Text"}
        </Button>
        {imageBase64 && (
          <Button variant="outline" size="sm" onClick={saveImage} className="rounded-full border-border bg-transparent">
            <Download size={14} className="mr-1.5" /> Save Image
          </Button>
        )}
        <Button size="sm" onClick={postOnLinkedIn} className="btn-gradient h-9 px-4 text-xs">
          <Linkedin size={14} className="mr-1.5" /> Post on LinkedIn
        </Button>
      </div>
    </div>
  );
}