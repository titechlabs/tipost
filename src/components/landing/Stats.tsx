const stats = [
  { value: "<60s", label: "From topic to ready-to-post" },
  { value: "10/day", label: "Posts on the Pro plan" },
  { value: "100%", label: "AI-researched content" },
  { value: "PKR", label: "Local pricing, no USD needed" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="container grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`py-8 px-4 text-center ${
              i < stats.length - 1 ? "md:border-r border-border" : ""
            } ${i % 2 === 0 ? "border-r md:border-r" : ""} ${
              i < 2 ? "border-b md:border-b-0 border-border" : ""
            }`}
          >
            <p className="font-display text-3xl sm:text-4xl gradient-text">{s.value}</p>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}