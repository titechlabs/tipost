import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { buildWhatsAppLink, getAppSettings } from "@/lib/settings";

export function Pricing() {
  const [starter, setStarter] = useState("500");
  const [pro, setPro] = useState("1000");
  const [whatsapp, setWhatsapp] = useState("923175982953");

  useEffect(() => {
    getAppSettings().then((s) => {
      if (s.starter_price) setStarter(s.starter_price);
      if (s.pro_price) setPro(s.pro_price);
      if (s.whatsapp_number) setWhatsapp(s.whatsapp_number);
    });
  }, []);

  return (
    <section id="pricing" className="container py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "hsl(var(--accent))" }}>
          Pricing
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Simple, honest pricing in Pakistani Rupees
        </h2>
        <p className="text-muted-foreground mt-4">
          No hidden charges. No USD conversions. Cancel anytime.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        <PlanCard
          name="Free"
          price="0"
          features={[
            { ok: true, t: "2 posts per week" },
            { ok: true, t: "AI research included" },
            { ok: true, t: "1 image per post" },
            { ok: false, t: "Bulk generation" },
            { ok: false, t: "Priority support" },
          ]}
          cta={
            <Button asChild variant="outline" className="w-full h-11 rounded-full border-border bg-transparent">
              <Link to="/app">Get Started Free</Link>
            </Button>
          }
        />
        <PlanCard
          highlight
          name="Starter"
          price={starter}
          features={[
            { ok: true, t: "5 posts per day" },
            { ok: true, t: "AI research included" },
            { ok: true, t: "1 image per post" },
            { ok: true, t: "Copy & download" },
            { ok: true, t: "Up to 5 posts per run" },
            { ok: false, t: "Priority support" },
          ]}
          cta={
            <Button asChild className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#1fbb59] text-white">
              <a href={buildWhatsAppLink(whatsapp, "starter", starter)} target="_blank" rel="noreferrer">
                <WhatsAppIcon /> Get Access via WhatsApp
              </a>
            </Button>
          }
        />
        <PlanCard
          name="Pro"
          price={pro}
          features={[
            { ok: true, t: "10 posts per day" },
            { ok: true, t: "AI research included" },
            { ok: true, t: "1 image per post" },
            { ok: true, t: "Copy & download" },
            { ok: true, t: "Up to 10 posts per run" },
            { ok: true, t: "WhatsApp priority support" },
          ]}
          cta={
            <Button asChild className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#1fbb59] text-white">
              <a href={buildWhatsAppLink(whatsapp, "pro", pro)} target="_blank" rel="noreferrer">
                <WhatsAppIcon /> Get Access via WhatsApp
              </a>
            </Button>
          }
        />
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  features,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  features: { ok: boolean; t: string }[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`ti-card ti-card-glow p-7 flex flex-col fade-up relative ${
        highlight ? "ring-2" : ""
      }`}
      style={highlight ? { boxShadow: "var(--shadow-button)", borderColor: "hsl(var(--accent) / 0.5)" } : undefined}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 pill" style={{ background: "var(--gradient-button)", borderColor: "transparent", color: "white" }}>
          ⭐ MOST POPULAR
        </span>
      )}
      <h3 className="font-display text-2xl">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl">{price === "0" ? "Free" : price}</span>
        {price !== "0" && (
          <>
            <span className="text-sm text-muted-foreground">PKR</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </>
        )}
      </div>
      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {f.ok ? (
              <Check size={18} className="mt-0.5 shrink-0" style={{ color: "hsl(var(--accent-2))" }} />
            ) : (
              <X size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <span className={f.ok ? "" : "text-muted-foreground line-through"}>{f.t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">{cta}</div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 21.82c-1.83 0-3.62-.49-5.18-1.42l-.37-.22-3.67.96.98-3.58-.24-.37A9.85 9.85 0 0 1 2.18 12C2.18 6.59 6.59 2.18 12 2.18c2.62 0 5.08 1.02 6.93 2.87a9.78 9.78 0 0 1 2.89 6.95c0 5.41-4.41 9.82-9.82 9.82Zm5.39-7.34c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.51-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.51.07-.78.37-.27.3-1.02 1-1.02 2.43 0 1.43 1.04 2.81 1.18 3.01.15.2 2.05 3.13 4.97 4.39.69.3 1.23.48 1.65.62.69.22 1.32.19 1.82.12.55-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}