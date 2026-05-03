import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="container py-20 sm:py-24">
      <div
        className="ti-card ti-card-glow max-w-4xl mx-auto p-10 sm:p-14 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--accent) / 0.12), hsl(var(--violet) / 0.12))",
        }}
      >
        <h2 className="font-display text-3xl sm:text-5xl">
          Start creating LinkedIn posts in seconds
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Free for early users. No credit card. Try the AI LinkedIn post generator now.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild className="btn-gradient h-12 px-8 text-base">
            <Link to="/signup">Try TiPost Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}