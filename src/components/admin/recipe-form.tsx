"use client";
import { useActionState } from "react";
import { createRecipeAction } from "@/app/actions/admin";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import type { Dictionary } from "@/lib/i18n/types";

const LANGS = [["uz", "Oʻzbekcha"], ["en", "English"], ["ru", "Русский"]] as const;

export function RecipeForm({ labels, f }: { labels: { submit: string; hint: string; saving: string }; f: Dictionary["admin"]["fields"] }) {
  const [state, action] = useActionState(createRecipeAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <p className="text-xs text-slate-500">{labels.hint}</p>
      <FormMessage state={state} />
      <div className="grid gap-4 md:grid-cols-3">
        {LANGS.map(([code, name]) => (
          <fieldset key={code} className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" lang={code}>
            <legend className="px-1 text-sm font-semibold">{name}</legend>
            <Field label={f.title} htmlFor={`title_${code}`}><Input id={`title_${code}`} name={`title_${code}`} required maxLength={200} /></Field>
            <Field label={f.description} htmlFor={`desc_${code}`}><Textarea id={`desc_${code}`} name={`desc_${code}`} maxLength={500} className="min-h-16" /></Field>
            <Field label={f.ingredients} htmlFor={`ingredients_${code}`}><Textarea id={`ingredients_${code}`} name={`ingredients_${code}`} required /></Field>
            <Field label={f.steps} htmlFor={`steps_${code}`}><Textarea id={`steps_${code}`} name={`steps_${code}`} required /></Field>
          </fieldset>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label={f.prep} htmlFor="prepMin"><Input id="prepMin" name="prepMin" type="number" min={1} max={600} required defaultValue={30} /></Field>
        <Field label={f.servings} htmlFor="servings"><Input id="servings" name="servings" type="number" min={1} max={50} required defaultValue={4} /></Field>
        <Field label={f.foodGroups} htmlFor="foodGroups"><Textarea id="foodGroups" name="foodGroups" className="min-h-11" placeholder="vegetables&#10;grains" /></Field>
      </div>
      <Field label={f.allergens} htmlFor="allergens"><Textarea id="allergens" name="allergens" className="min-h-11" placeholder="milk&#10;egg" /></Field>
      <SubmitButton pendingText={labels.saving}>{labels.submit}</SubmitButton>
    </form>
  );
}
