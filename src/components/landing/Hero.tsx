import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Globe2 } from "lucide-react";

export function Hero() {
  return (
    <section className="container pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
      <span className="pill mx-auto fade-up">✦ Built for Pakistani Professionals</span>
      <h1
        className="font-display font-extrabold mt-6 leading-[1.05] fade-up"
        style={{ fontSize: "clamp(42px, 7vw, 72px)", animationDelay: "60ms" }}
      >
        Generate Viral LinkedIn Posts in
        <br />
        <span className="gradient-text">60 Seconds with AI</span>
      </h1>
      <p
        className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto fade-up"
        style={{ animationDelay: "120ms" }}
      >
        Just enter your topic — TiPost, the AI LinkedIn post generator, writes your
        post and creates a matching image instantly.
      </p>
      <div
        className="mt-8 flex flex-col sm:flex-row gap-3 justify-center fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <Button asChild className="btn-gradient h-12 px-7 text-base">
          <Link to="/signup">Generate Your First Post Free</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 px-7 text-base rounded-full border-border bg-transparent hover:bg-secondary"
        >
          <a href="#how">See Demo</a>
        </Button>
      </div>
      <p
        className="mt-4 text-xs text-muted-foreground fade-up"
        style={{ animationDelay: "220ms" }}
      >
        Free to start · No credit card required
      </p>

      <div className="mt-16 fade-up" style={{ animationDelay: "260ms" }}>
        <LinkedInPreview />
      </div>
    </section>
  );
}

function LinkedInPreview() {
  const post = `How I got my first international client from Pakistan

Most Pakistani freelancers think landing international clients is hard.

It is not.

The real problem is visibility.

When I started, I did what most people do:
• Tried random platforms
• Sent cold proposals
• Waited for replies

Nothing worked.

Then I realized something:
Clients do not hire the best talent.
They hire the most visible and well-positioned talent.

So I changed my strategy and focused on:
• Clear positioning (what I do + who I help)
• Showing up consistently
• Reaching out where global clients already are

That is when things changed.

Pakistani freelancers do not lack skill.
They lack visibility.

If you are trying to land your first international client:
Stop focusing on where you are.
Start focusing on how you show up.`;

  return (
    <div className="max-w-5xl mx-auto text-left">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-4">
        Live preview — generated in 58 seconds
      </p>
      <div className="grid gap-4 md:grid-cols-[55fr_45fr] md:items-stretch">
        {/* LEFT: LinkedIn-style post card */}
        <div className="ti-card ti-card-glow overflow-hidden flex flex-col">
          {/* Author row */}
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center gap-3">
              <TiTechlabsAvatar />
              <div>
                <p className="text-sm font-semibold leading-tight">TiTechlabs</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Building products for Pakistani founders & creators
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                  1h · <Globe2 size={10} />
                </p>
              </div>
            </div>
            <button aria-label="More" className="text-muted-foreground hover:text-foreground p-1">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Post body — clamped with see more fade */}
          <div className="px-4 pb-2 flex-1 relative">
            <div className="relative max-h-[230px] overflow-hidden">
              <p className="text-[14px] leading-[1.55] whitespace-pre-line">
                {post}
              </p>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, hsl(var(--card)) 85%)",
                }}
              />
            </div>
            <button className="relative -mt-1 text-xs text-muted-foreground hover:text-foreground">
              …see more
            </button>
          </div>

          {/* Reactions */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-4 py-2 border-t border-border mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] border border-card" />
                <span className="w-4 h-4 rounded-full bg-[hsl(var(--accent-2))] border border-card" />
                <span className="w-4 h-4 rounded-full bg-[hsl(var(--violet))] border border-card" />
              </span>
              312
            </span>
            <span>48 comments · 22 reposts</span>
          </div>

          {/* Action bar */}
          <div className="grid grid-cols-4 border-t border-border text-xs">
            {[
              { icon: ThumbsUp, label: "Like" },
              { icon: MessageCircle, label: "Comment" },
              { icon: Repeat2, label: "Repost" },
              { icon: Send, label: "Send" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center justify-center gap-1.5 py-2.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: AI generated visual */}
        <div className="flex flex-col">
          <div
            className="ti-card overflow-hidden flex-1 flex items-center justify-center text-center px-6 min-h-[280px]"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--accent) / 0.85), hsl(var(--violet) / 0.85))",
            }}
          >
            <p className="font-display text-white text-xl sm:text-2xl leading-tight">
              Visibility &gt; Talent.<br />
              <span className="opacity-80 text-base sm:text-lg font-normal">
                How Pakistani freelancers win global clients.
              </span>
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-center mt-2">
            AI generated visual
          </p>
        </div>
      </div>
    </div>
  );
}

function TiTechlabsAvatar() {
  // Simple branded avatar — falls back gracefully if no logo image is provided.
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-display text-white text-base shrink-0"
      style={{
        background: "var(--gradient-button)",
        boxShadow: "var(--shadow-button)",
      }}
      aria-label="TiTechlabs"
    >
      Ti
    </div>
  );
}