interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}
export function StatCard({ label, value, hint, icon }: Props) {
  return (
    <div className="ti-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-3xl mt-2">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        {icon && (
          <div
            className="h-10 w-10 grid place-items-center rounded-xl"
            style={{ background: "hsl(var(--accent) / 0.12)", color: "hsl(var(--accent))" }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}