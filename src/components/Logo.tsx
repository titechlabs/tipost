import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withBadge?: boolean;
  to?: string;
}

export function Logo({ size = "md", withBadge = false, to = "/" }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      <span className={`font-display font-extrabold tracking-tight ${sizes[size]}`}>
        <span className="text-foreground">Ti</span>
        <span style={{ color: "hsl(var(--accent))" }}>Post</span>
      </span>
      {withBadge && (
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
          by TiTechLabs
        </span>
      )}
    </Link>
  );
}