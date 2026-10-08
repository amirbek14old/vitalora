"use client";
import { useActionState } from "react";
import { logSleepAction } from "@/app/actions/sleep";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

type Labels = { date: string; bedtime: string; wakeTime: string; quality: string; notes: string; save: string; saving: string };

export function SleepForm({ labels, today }: { labels: Labels; today: string }) {
  const [state, action] = useActionState(logSleepAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label={labels.date} htmlFor="sl-date"><Input id="sl-date" name="date" type="date" required defaultValue={today} max={today} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={labels.bedtime} htmlFor="sl-bed"><Input id="sl-bed" name="bedtime" type="time" required defaultValue="23:00" /></Field>
        <Field label={labels.wakeTime} htmlFor="sl-wake"><Input id="sl-wake" name="wakeTime" type="time" required defaultValue="07:00" /></Field>
      </div>
      <Field label={labels.quality} htmlFor="sl-q">
        <Select id="sl-q" name="quality" defaultValue="3">{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
      </Field>
      <Field label={labels.notes} htmlFor="sl-notes"><Textarea id="sl-notes" name="notes" maxLength={500} className="min-h-16" /></Field>
      <SubmitButton pendingText={labels.saving}>{labels.save}</SubmitButton>
    </form>
  );
}
