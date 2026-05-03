const features = [
  {
    icon: "✍️",
    title: "AI-generated LinkedIn posts",
    body: "Never stare at a blank page again.",
  },
  {
    icon: "🖼️",
    title: "Auto-generated images",
    body: "Stop the scroll with a matching visual every time.",
  },
  {
    icon: "🚀",
    title: "Optimized for engagement",
    body: "Hooks, structure, and CTAs that earn likes and comments.",
  },
  {
    icon: "⚡",
    title: "Under 60 seconds",
    body: "Post in the time it takes to make chai.",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "hsl(var(--accent))" }}>
          Why TiPost
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Everything you need to win on LinkedIn
        </h2>
        <p className="text-muted-foreground mt-4">
          Not just a text generator — TiPost researches, writes, and visualizes your content end to end.
        </p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="ti-card ti-card-glow p-6 fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 font-display text-xl">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}