"use client";
import { useActionState } from "react";
import { completeOnboardingAction } from "@/app/actions/onboarding";
import { Checkbox, Field, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import type { Dictionary } from "@/lib/i18n/types";

export function OnboardingForm({ t }: { t: Pick<Dictionary, "onboarding" | "common"> }) {
  const [state, action] = useActionState(completeOnboardingAction, initialState);
  const goals = Object.entries(t.onboarding.goalOptions);
  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />
      <Field label={t.onboarding.level} htmlFor="experienceLevel">
        <Select id="experienceLevel" name="experienceLevel" defaultValue="BEGINNER">
          <option value="BEGINNER">{t.common.beginner}</option>
          <option value="INTERMEDIATE">{t.common.intermediate}</option>
          <option value="ADVANCED">{t.common.advanced}</option>
        </Select>
      </Field>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t.onboarding.goals}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {goals.map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-500 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 dark:border-slate-700 dark:has-[:checked]:bg-brand-900/30">
              <input type="checkbox" name="goals" value={value} className="h-4 w-4 accent-brand-700" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t.onboarding.minutes} htmlFor="minutesPerDay">
        <Select id="minutesPerDay" name="minutesPerDay" defaultValue="15">
          {[5, 10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} {t.common.minutes}</option>)}
        </Select>
      </Field>
      <Checkbox id="starterHabits" name="starterHabits" defaultChecked label={t.onboarding.starterHabits} hint={t.onboarding.starterHabitsHint} />
      <SubmitButton className="w-full" pendingText={t.common.saving}>{t.onboarding.finish}</SubmitButton>
    </form>
  );
}
