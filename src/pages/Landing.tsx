import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { WhyNotChatGPT } from "@/components/landing/WhyNotChatGPT";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { UseCases } from "@/components/landing/UseCases";
import { SocialProof } from "@/components/landing/SocialProof";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    document.title =
      "TiPost — AI LinkedIn Post Generator | Viral Posts in 60 Seconds";
    const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "AI LinkedIn post generator. Turn any topic into a viral LinkedIn post and matching image in 60 seconds. Built for creators and professionals in Pakistan.",
    );
  }, []);

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <ProblemSolution />
        <HowItWorks />
        <Features />
        <UseCases />
        <WhyNotChatGPT />
        <SocialProof />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}