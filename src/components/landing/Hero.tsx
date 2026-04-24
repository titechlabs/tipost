import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="container pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
      <span className="pill mx-auto fade-up">✦ Built for Pakistani Professionals</span>
      <h1
        className="font-display font-extrabold mt-6 leading-[1.05] fade-up"
        style={{ fontSize: "clamp(42px, 7vw, 72px)", animationDelay: "60ms" }}
      >
        LinkedIn Posts That
        <br />
        <span className="gradient-text">Actually Get Noticed</span>
      </h1>
      <p
        className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto fade-up"
        style={{ animationDelay: "120ms" }}
      >
        TiPost researches your topic, writes compelling posts, and generates matching
        visuals — all in under 60 seconds.
      </p>
      <div
        className="mt-8 flex flex-col sm:flex-row gap-3 justify-center fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <Button asChild className="btn-gradient h-12 px-7 text-base">
          <Link to="/app">Start Free — No Card Needed →</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 px-7 text-base rounded-full border-border bg-transparent hover:bg-secondary"
        >
          <a href="#how">See how it works</a>
        </Button>
      </div>

      <div className="mt-16 fade-up" style={{ animationDelay: "260ms" }}>
        <BrowserMockup />
      </div>
    </section>
  );
}

function BrowserMockup() {
  return (
    <div className="ti-card ti-card-glow max-w-5xl mx-auto overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-muted-foreground">tipost.titechlabs.dev/app</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-surface/40">
        <FakePost
          tone="primary"
          title="AI in Pakistan: 5 ways founders are winning"
          body="Pakistan's AI ecosystem is exploding. Local startups now ship LLM features in days, not months. Here are 5 patterns I've seen working in 2025…"
          tags="#AI #Pakistan #Startups"
        />
        <FakePost
          tone="teal"
          title="The freelancer's hook formula"
          body="Your first line decides whether anyone reads the second. The 3-line pattern that made my posts get 10x more saves last month…"
          tags="#Freelancing #LinkedIn #Growth"
        />
      </div>
    </div>
  );
}

function FakePost({
  tone,
  title,
  body,
  tags,
}: {
  tone: "primary" | "teal";
  title: string;
  body: string;
  tags: string;
}) {
  const grad =
    tone === "primary"
      ? "linear-gradient(135deg, hsl(var(--accent)/0.7), hsl(var(--violet)/0.7))"
      : "linear-gradient(135deg, hsl(var(--accent-2)/0.7), hsl(var(--accent)/0.5))";
  return (
    <div className="ti-card overflow-hidden text-left">
      <div className="h-32 sm:h-40" style={{ background: grad }} />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary" />
          <div>
            <p className="text-xs font-medium">Your Name</p>
            <p className="text-[10px] text-muted-foreground">Founder · 1h</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{body}</p>
        <p className="mt-3 text-xs" style={{ color: "hsl(var(--accent))" }}>{tags}</p>
      </div>
    </div>
  );
}