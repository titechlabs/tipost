const testimonials = [
  {
    quote:
      "I went from posting once a month to three times a week. Engagement on my profile finally moved.",
    name: "Hira A.",
    role: "Freelance designer, Lahore",
  },
  {
    quote:
      "The image + post combo is the killer feature. Saves me hours every week.",
    name: "Bilal R.",
    role: "Founder, Karachi",
  },
  {
    quote:
      "Writing in English used to take me forever. TiPost handles structure and hooks for me.",
    name: "Sana M.",
    role: "Marketing lead, Islamabad",
  },
];

export function SocialProof() {
  return (
    <section className="container py-20 sm:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p
          className="text-xs uppercase tracking-[0.25em]"
          style={{ color: "hsl(var(--accent))" }}
        >
          Trusted in Pakistan
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Used by creators across Pakistan
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Built by{" "}
          <a
            href="https://tahaislam.me"
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:underline"
          >
            Taha Islam
          </a>{" "}
          —{" "}
          <a
            href="https://titechlabs.dev"
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:underline"
          >
            TiTechLabs
          </a>
          .
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <figure key={t.name} className="ti-card p-6 flex flex-col">
            <blockquote className="text-sm leading-relaxed flex-1">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-4 text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{t.name}</span> · {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}