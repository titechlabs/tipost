import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  { label: "Analyzing your topic", duration: 3500 },
  { label: "Finding engaging angles", duration: 4500 },
  { label: "Writing your post", duration: 9000 },
  { label: "Generating your visual", duration: 9000 },
];

export function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Smoothly animate progress 0 -> 95 over the sum of step durations.
  // Caps at 95% until the actual generation finishes (parent unmounts us).
  useEffect(() => {
    const total = STEPS.reduce((a, s) => a + s.duration, 0);
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, (elapsed / total) * 100);
      setProgress(pct);

      // Determine active step from elapsed
      let acc = 0;
      let step = 0;
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration;
        if (elapsed < acc) {
          step = i;
          break;
        }
        step = i;
      }
      setActiveStep(step);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ti-card ti-card-glow p-6 sm:p-8 fade-up">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Generating your post…</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: "var(--gradient-button)",
            boxShadow: "var(--shadow-button)",
          }}
        />
      </div>

      {/* Steps */}
      <ul className="mt-6 space-y-3">
        {STEPS.map((s, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  done
                    ? "bg-accent/15 border-accent/40"
                    : active
                    ? "border-accent/60"
                    : "border-border bg-secondary/40"
                }`}
              >
                {done ? (
                  <Check size={12} className="text-accent" />
                ) : active ? (
                  <Loader2 size={12} className="animate-spin text-accent" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                )}
              </span>
              <span
                className={
                  done
                    ? "text-muted-foreground line-through"
                    : active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {s.label}
                {active && <span className="ml-1 text-muted-foreground">…</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}