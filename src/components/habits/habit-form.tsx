"use client";
import { useActionState } from "react";
import { createHabitAction } from "@/app/actions/habits";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

export function HabitForm({ labels, categories }: { labels: { name: string; category: string; target: string; add: string; saving: string }; categories: Record<string, string> }) {
  const [state, action] = useActionState(createHabitAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label={labels.name} htmlFor="h-title"><Input id="h-title" name="title" required maxLength={80} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={labels.category} htmlFor="h-cat">
          <Select id="h-cat" name="category" defaultValue="MOVEMENT">{Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        </Field>
        <Field label={labels.target} htmlFor="h-target">
          <Select id="h-target" name="targetPerWeek" defaultValue="5">{[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
        </Field>
      </div>
      <SubmitButton pendingText={labels.saving}>{labels.add}</SubmitButton>
    </form>
  );
}
