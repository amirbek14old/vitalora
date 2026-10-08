"use client";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/account";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import type { Dictionary } from "@/lib/i18n/types";

type Profile = { displayName: string; bio: string | null; experienceLevel: string; minutesPerDay: number; goals: string[] };

export function ProfileForm({ profile, t }: { profile: Profile; t: Pick<Dictionary, "profile" | "common" | "onboarding"> }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label={t.profile.displayName} htmlFor="p-name"><Input id="p-name" name="displayName" defaultValue={profile.displayName} required minLength={2} maxLength={40} /></Field>
      <Field label={t.profile.bio} htmlFor="p-bio"><Textarea id="p-bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={280} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.profile.level} htmlFor="p-level">
          <Select id="p-level" name="experienceLevel" defaultValue={profile.experienceLevel}>
            <option value="BEGINNER">{t.common.beginner}</option>
            <option value="INTERMEDIATE">{t.common.intermediate}</option>
            <option value="ADVANCED">{t.common.advanced}</option>
          </Select>
        </Field>
        <Field label={t.profile.minutes} htmlFor="p-min"><Input id="p-min" name="minutesPerDay" type="number" min={5} max={180} defaultValue={profile.minutesPerDay} /></Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t.profile.goals}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(t.onboarding.goalOptions).map(([v, label]) => (
            <label key={v} className="flex items-center gap-2 text-sm"><input type="checkbox" name="goals" value={v} defaultChecked={profile.goals.includes(v)} className="h-4 w-4 accent-brand-700" />{label}</label>
          ))}
        </div>
      </fieldset>
      <SubmitButton pendingText={t.common.saving}>{t.common.save}</SubmitButton>
    </form>
  );
}
