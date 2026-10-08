"use client";
import { useActionState } from "react";
import { logWorkoutAction } from "@/app/actions/fitness";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

type Labels = { title: string; duration: string; effort: string; notes: string; submit: string; saving: string };

export function LogWorkoutForm({ labels, defaults, exerciseSlugs = [], compact }: { labels: Labels; defaults?: { title?: string; durationMin?: number }; exerciseSlugs?: string[]; compact?: boolean }) {
  const [state, action] = useActionState(logWorkoutAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      {exerciseSlugs.map((s) => <input key={s} type="hidden" name="exerciseSlugs" value={s} />)}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.title} htmlFor="wk-title"><Input id="wk-title" name="title" required maxLength={120} defaultValue={defaults?.title} /></Field>
        <Field label={labels.duration} htmlFor="wk-duration"><Input id="wk-duration" name="durationMin" type="number" min={1} max={300} required defaultValue={defaults?.durationMin ?? 15} /></Field>
      </div>
      <Field label={labels.effort} htmlFor="wk-effort">
        <Select id="wk-effort" name="effort" defaultValue="2">
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </Select>
      </Field>
      {!compact && <Field label={labels.notes} htmlFor="wk-notes"><Textarea id="wk-notes" name="notes" maxLength={500} /></Field>}
      <SubmitButton pendingText={labels.saving}>{labels.submit}</SubmitButton>
    </form>
  );
}
