import { Check, X } from "lucide-react";

const rows = [
  { feature: "Structured LinkedIn hooks", tipost: true, chatgpt: false },
  { feature: "LinkedIn-optimized formatting", tipost: true, chatgpt: false },
  { feature: "Built-in matching visuals", tipost: true, chatgpt: false },
  { feature: "Generate up to 10 posts in one run", tipost: true, chatgpt: false },
  { feature: "Local pricing in PKR", tipost: true, chatgpt: false },
  { feature: "Generic, prompt-by-prompt writing", tipost: false, chatgpt: true },
];

export function WhyNotChatGPT() {
  return (
    <section className="container py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <p
          className="text-xs uppercase tracking-[0.25em]"
          style={{ color: "hsl(var(--accent))" }}
        >
          Why TiPost
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Not just AI text — a real <span className="gradient-text">LinkedIn workflow</span>
        </h2>
        <p className="text-muted-foreground mt-4">
          ChatGPT writes paragraphs. TiPost ships posts that are formatted, visualized,
          and ready to publish.
        </p>
      </div>

      <div className="mt-12 ti-card ti-card-glow max-w-3xl mx-auto overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1fr_1fr] text-sm">
          <div className="p-4 sm:p-5 text-xs uppercase tracking-wider text-muted-foreground" />
          <div className="p-4 sm:p-5 text-center font-display text-base">
            <span className="gradient-text">TiPost</span>
          </div>
          <div className="p-4 sm:p-5 text-center text-muted-foreground font-medium">
            ChatGPT
          </div>

          {rows.map((r, i) => (
            <Row key={r.feature} {...r} alt={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  feature,
  tipost,
  chatgpt,
  alt,
}: {
  feature: string;
  tipost: boolean;
  chatgpt: boolean;
  alt: boolean;
}) {
  const cell = `p-4 sm:p-5 border-t border-border ${alt ? "bg-surface/40" : ""}`;
  return (
    <>
      <div className={cell}>{feature}</div>
      <div className={`${cell} flex justify-center`}>
        {tipost ? (
          <Check size={18} style={{ color: "hsl(var(--accent-2))" }} />
        ) : (
          <X size={18} className="text-muted-foreground" />
        )}
      </div>
      <div className={`${cell} flex justify-center`}>
        {chatgpt ? (
          <Check size={18} className="text-muted-foreground" />
        ) : (
          <X size={18} className="text-muted-foreground" />
        )}
      </div>
    </>
  );
}