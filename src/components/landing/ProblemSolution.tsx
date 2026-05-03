export function ProblemSolution() {
  const problems = [
    "Don't know what to write?",
    "No time to create posts?",
    "Low engagement on everything you publish?",
  ];
  return (
    <section className="container py-20 sm:py-24">
      <div className="grid gap-10 md:grid-cols-2 items-center max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            The problem
          </p>
          <h2 className="font-display text-3xl sm:text-4xl mt-3">
            Struggling to stay consistent on LinkedIn?
          </h2>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            {problems.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ti-card ti-card-glow p-7">
          <p
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: "hsl(var(--accent-2))" }}
          >
            The fix
          </p>
          <p className="font-display text-2xl sm:text-3xl mt-3 leading-snug">
            TiPost solves this instantly with{" "}
            <span className="gradient-text">AI-powered content + visuals</span>.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            One topic in. A ready-to-publish post and image out. In under a minute.
          </p>
        </div>
      </div>
    </section>
  );
}