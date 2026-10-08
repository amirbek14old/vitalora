"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const PHASES = ["inhale", "hold", "exhale", "hold"] as const;

export function BoxBreathing({ labels }: { labels: { start: string; stop: string; inhale: string; hold: string; exhale: string } }) {
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const phaseIndex = Math.floor(tick / 4) % 4;
  const phase = PHASES[phaseIndex];
  const step = (tick % 4) + 1; // 1..4
  const count = 5 - step;
  // inhale: grow 0.6→1, hold: stay big, exhale: shrink 1→0.6, hold: stay small
  const scale = [0.6 + 0.1 * step, 1, 1 - 0.1 * step, 0.6][phaseIndex];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-44 w-44 items-center justify-center">
        <div
          className="flex h-40 w-40 items-center justify-center rounded-3xl bg-brand-100 transition-transform duration-1000 ease-linear dark:bg-brand-900/50"
          style={{ transform: `scale(${running ? scale : 0.8})` }}
        >
          <div className="text-center" aria-live="polite">
            <p className="text-lg font-semibold text-brand-800 dark:text-brand-100">{running ? labels[phase] : "4 · 4 · 4 · 4"}</p>
            {running && <p className="text-3xl font-bold text-brand-700 dark:text-brand-300">{count}</p>}
          </div>
        </div>
      </div>
      <Button variant={running ? "outline" : "primary"} onClick={() => { setRunning((r) => !r); setTick(0); }}>
        {running ? labels.stop : labels.start}
      </Button>
    </div>
  );
}
