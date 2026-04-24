import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="ti-card ti-card-glow p-8 w-full max-w-md fade-up">{children}</div>
    </div>
  );
}

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <Logo size="lg" />
      <h1 className="font-display text-2xl mt-6">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
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