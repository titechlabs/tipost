import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    document.title = "TiPost — LinkedIn Posts That Actually Get Noticed";
    const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "AI LinkedIn post generator built for Pakistani professionals. Researches, writes & visualizes posts in under 60 seconds. Pay in PKR.",
    );
  }, []);

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}