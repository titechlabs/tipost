import { useEffect, useState } from "react";

const messages = [
  "Researching your topic...",
  "Finding latest insights...",
  "Writing posts...",
  "Generating visuals...",
  "Almost there...",
];

export function LoadingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ti-card ti-card-glow p-10 text-center fade-up">
      <div className="flex justify-center gap-2">
        <span className="dot-bounce w-3 h-3 rounded-full" style={{ background: "hsl(var(--accent))" }} />
        <span className="dot-bounce w-3 h-3 rounded-full" style={{ background: "hsl(var(--violet))", animationDelay: "0.16s" }} />
        <span className="dot-bounce w-3 h-3 rounded-full" style={{ background: "hsl(var(--accent-2))", animationDelay: "0.32s" }} />
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{messages[i]}</p>
    </div>
  );
}