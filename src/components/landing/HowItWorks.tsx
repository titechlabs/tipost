const steps = [
  { n: 1, title: "Enter your topic", body: "Type any idea: AI, freelancing, growth, hiring." },
  { n: 2, title: "AI generates a post", body: "Researched, formatted, and ready for LinkedIn." },
  { n: 3, title: "Get post + image", body: "Copy the text, download the visual, publish in one click." },
];

export function HowItWorks() {
  return (
    <section id="how" className="container py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "hsl(var(--accent-2))" }}>
          How it works
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">From topic to post in 60 seconds</h2>
      </div>
      <div className="relative mt-14 grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
        <div
          aria-hidden
          className="hidden sm:block absolute top-7 left-[16%] right-[16%] border-t border-dashed border-border"
        />
        {steps.map((s, i) => (
          <div key={s.n} className="text-center relative fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div
              className="mx-auto w-14 h-14 rounded-full flex items-center justify-center font-display text-xl text-white"
              style={{ background: "var(--gradient-button)", boxShadow: "var(--shadow-button)" }}
            >
              {s.n}
            </div>
            <h3 className="mt-5 font-display text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}