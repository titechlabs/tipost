import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container py-12 grid gap-8 md:grid-cols-2 items-start">
        <div>
          <Logo />
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            LinkedIn Posts That Actually Get Noticed
          </p>
        </div>
        <div className="flex flex-wrap gap-6 md:justify-end text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
          <a href="/app" className="text-muted-foreground hover:text-foreground">App</a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <p>
            Built by{" "}
            <a href="https://tahaislam.me" target="_blank" rel="noreferrer" className="text-foreground hover:underline">
              Taha Islam
            </a>
            {" — "}
            <a href="https://tahaislam.me" target="_blank" rel="noreferrer" className="hover:text-foreground">tahaislam.me</a>
            {" | "}
            <a href="https://titechlabs.dev" target="_blank" rel="noreferrer" className="hover:text-foreground">TiTechLabs — titechlabs.dev</a>
          </p>
          <p>© 2025 TiTechLabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}