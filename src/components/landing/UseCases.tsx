const cases = [
  { icon: "💼", who: "Freelancers", benefit: "Grow your personal brand and attract clients." },
  { icon: "🚀", who: "Founders", benefit: "Share insights without spending hours writing." },
  { icon: "🎯", who: "Job seekers", benefit: "Stand out to recruiters with consistent posts." },
  { icon: "📈", who: "Marketers", benefit: "Scale content production without burning out." },
];

export function UseCases() {
  return (
    <section className="container py-20 sm:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p
          className="text-xs uppercase tracking-[0.25em]"
          style={{ color: "hsl(var(--accent-2))" }}
        >
          Who it's for
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Built for everyone who needs to show up on LinkedIn
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
        {cases.map((c) => (
          <div key={c.who} className="ti-card ti-card-glow p-6">
            <div className="text-2xl">{c.icon}</div>
            <h3 className="mt-3 font-display text-lg">{c.who}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c.benefit}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}