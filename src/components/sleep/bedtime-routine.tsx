"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { saveBedtimeRoutineAction } from "@/app/actions/sleep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

type Step = { id: string; label: string; done: boolean };

export function BedtimeRoutine({ initial, labels }: { initial: Step[]; labels: { add: string; placeholder: string; remove: string } }) {
  const [steps, setSteps] = useState<Step[]>(initial);
  const [draft, setDraft] = useState("");
  const [, start] = useTransition();

  function update(next: Step[]) {
    setSteps(next);
    start(async () => {
      await saveBedtimeRoutineAction(next);
    });
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.id} className="flex items-center gap-3">
            <input id={`step-${s.id}`} type="checkbox" checked={s.done} onChange={() => update(steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))} className="h-5 w-5 accent-brand-700" />
            <label htmlFor={`step-${s.id}`} className={s.done ? "flex-1 text-slate-500 line-through" : "flex-1"}>{s.label}</label>
            <button type="button" onClick={() => update(steps.filter((x) => x.id !== s.id))} className="rounded p-1 text-slate-400 hover:text-red-600" aria-label={`${labels.remove}: ${s.label}`}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const label = draft.trim();
          if (!label || steps.length >= 15) return;
          update([...steps, { id: Math.random().toString(36).slice(2, 10), label, done: false }]);
          setDraft("");
        }}
      >
        <label htmlFor="new-step" className="sr-only">{labels.add}</label>
        <Input id="new-step" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={labels.placeholder} maxLength={80} />
        <Button type="submit" variant="secondary" aria-label={labels.add}><Plus className="h-4 w-4" aria-hidden /></Button>
      </form>
    </div>
  );
}
