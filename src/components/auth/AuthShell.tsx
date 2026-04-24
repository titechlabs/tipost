import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Zap, Wand2 } from "lucide-react";

export function AuthShell({
  children,
  side = "default",
}: {
  children: React.ReactNode;
  side?: "default" | "admin";
}) {
  const isAdmin = side === "admin";
  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      {/* Hero panel — desktop only */}
      <aside className="hidden md:flex relative overflow-hidden flex-col justify-between p-12 border-r border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 20%, hsl(var(--accent) / 0.35), transparent 60%), radial-gradient(50% 50% at 85% 80%, hsl(var(--accent-2) / 0.25), transparent 60%), linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--bg)) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--text)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative">
          <Logo size="lg" />
          {isAdmin && (
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-violet-200 align-middle">
              <Sparkles size={10} /> Admin
            </span>
          )}
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-[1.1]">
            {isAdmin ? (
              <>
                Run the <span className="gradient-text">command center</span>.
              </>
            ) : (
              <>
                Scroll-stopping <span className="gradient-text">LinkedIn posts</span> in 60 seconds.
              </>
            )}
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            {isAdmin
              ? "Manage users, codes, revenue and analytics — all in one place."
              : "Turn raw ideas into posts your network will actually read, like, and share."}
          </p>

          <ul className="mt-8 space-y-3">
            {(isAdmin
              ? ["Real-time revenue & analytics", "Manage access codes & users", "Full post-history insights"]
              : ["AI-tuned hooks that earn the scroll", "Your voice — amplified, not replaced", "1 free post on the house"]
            ).map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 border border-accent/30">
                  <Check size={12} className="text-accent" />
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="ti-card p-4 max-w-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap size={12} className="text-accent-2" />
              <span>Used by 2,400+ writers</span>
            </div>
            <p className="mt-2 text-sm leading-snug">
              {isAdmin
                ? "“The dashboard is ridiculously clean. Everything I need, nothing I don't.”"
                : "“My LinkedIn engagement 4x'd in the first week. This is unfair.”"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              — {isAdmin ? "Operations lead, SaaS startup" : "Maya R., Product Marketer"}
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="ti-card ti-card-glow p-8 sm:p-10 w-full max-w-md fade-up relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[20px] opacity-60"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--accent) / 0.25), transparent 40%, hsl(var(--accent-2) / 0.2))",
              filter: "blur(24px)",
              zIndex: -1,
            }}
          />
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthHeader({
  title,
  highlight,
  subtitle,
  pill,
}: {
  title: string;
  highlight?: string;
  subtitle?: string;
  pill?: string;
}) {
  return (
    <div className="text-center">
      <div className="md:hidden flex justify-center">
        <Logo size="md" />
      </div>
      {pill && (
        <span className="pill mt-6 mx-auto">
          <Wand2 size={12} /> {pill}
        </span>
      )}
      <h1 className="font-display text-3xl sm:text-4xl mt-6 leading-tight">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="gradient-text">{highlight}</span>
          </>
        )}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete ?? (type === "password" ? "current-password" : "email")}
        placeholder={placeholder}
      />
    </div>
  );
}

export function BackToHome() {
  return (
    <div className="mt-6 text-center">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={12} /> Back to home
      </Link>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg className="mr-2" width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.9 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.9 28.9 5 24 5 16.3 5 9.6 9.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 34.7 26.6 35.5 24 35.5c-5.2 0-9.6-2.6-11.3-6.7l-6.5 5C9.5 38.6 16.2 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l5.8 4.9C40.7 35.6 43 30.2 43 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}