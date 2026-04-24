const features = [
  {
    icon: "🔍",
    title: "Real-Time Research",
    body: "Searches the web for the latest insights, stats, and trends before writing.",
  },
  {
    icon: "✍️",
    title: "Professional Writing",
    body: "Strong hook, educational body, source attribution, hashtags, and a clear CTA.",
  },
  {
    icon: "🖼️",
    title: "AI-Generated Visuals",
    body: "LinkedIn-optimized 1200×627 image per post — no Canva needed.",
  },
  {
    icon: "⚡",
    title: "Bulk Generation",
    body: "Up to 10 posts in one run, done in under 2 minutes.",
  },
  {
    icon: "📋",
    title: "One-Click Copy & Post",
    body: "Copy text, download the image, or open LinkedIn directly.",
  },
  {
    icon: "🇵🇰",
    title: "Local Pricing",
    body: "Pay in PKR, no USD conversions, cancel anytime.",
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
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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