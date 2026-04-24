import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I get access after paying?",
    a: "Send us a screenshot on WhatsApp. We'll send your access code within a few hours. Manual process for now — we're a small team!",
  },
  {
    q: "Are the posts really unique?",
    a: "Yes. Each post is freshly generated using real-time web research. No two posts are identical.",
  },
  {
    q: "What language are posts written in?",
    a: "English by default. Roman Urdu and Urdu support coming soon.",
  },
  {
    q: "How do I pay in PKR?",
    a: "Bank transfer, JazzCash, or EasyPaisa. Send us a WhatsApp message and we'll guide you.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no auto-renewals. Manual process — just message us on WhatsApp.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "hsl(var(--accent))" }}>
          FAQ
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-4">Common questions</h2>
      </div>
      <div className="mt-12 max-w-3xl mx-auto ti-card p-2 sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline px-3">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground px-3">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}