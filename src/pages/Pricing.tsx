import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Pricing as PricingSection } from "@/components/landing/Pricing";
import { AccessCodeGate } from "@/components/app/AccessCodeGate";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PricingPage() {
  const navigate = useNavigate();
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    document.title = "Pricing — TiPost";
  }, []);

  return (
    <div>
      <Navbar />
      <main>
        <PricingSection />
        <section className="container pb-24">
          <div className="ti-card max-w-2xl mx-auto p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setCodeOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="font-display text-lg">Have an access code?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Already purchased a plan? Redeem your code here.
                </p>
              </div>
              {codeOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {codeOpen && (
              <div className="mt-6 border-t border-border pt-6">
                <AccessCodeGate
                  embedded
                  onUnlocked={() => navigate("/app", { replace: true })}
                />
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="rounded-full border-border bg-transparent"
              onClick={() => navigate("/app")}
            >
              ← Back to app
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}