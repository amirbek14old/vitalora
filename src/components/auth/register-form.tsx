"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import type { Dictionary } from "@/lib/i18n/types";

export function RegisterForm({ t }: { t: Pick<Dictionary, "auth" | "common" | "nav"> }) {
  const [state, action] = useActionState(registerAction, initialState);
  const year = new Date().getFullYear();
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label={t.auth.email} htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
      <Field label={t.auth.password} hint={t.auth.passwordHint} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required aria-describedby="password-hint" />
      </Field>
      <Field label={t.auth.displayName} hint={t.auth.displayNameHint} htmlFor="displayName">
        <Input id="displayName" name="displayName" autoComplete="nickname" minLength={2} maxLength={40} required aria-describedby="displayName-hint" />
      </Field>
      <Field label={t.auth.birthYear} hint={t.auth.birthYearHint} htmlFor="birthYear">
        <Input id="birthYear" name="birthYear" type="number" inputMode="numeric" min={year - 110} max={year} required aria-describedby="birthYear-hint" />
      </Field>
      <div className="flex items-start gap-3">
        <input id="acceptTerms" name="acceptTerms" type="checkbox" required className="mt-0.5 h-5 w-5 accent-brand-700" />
        <label htmlFor="acceptTerms" className="text-sm text-slate-700 dark:text-slate-300">
          {t.auth.acceptTerms} (<Link href="/terms" className="underline">{t.nav.terms}</Link>, <Link href="/privacy" className="underline">{t.nav.privacy}</Link>)
        </label>
      </div>
      <SubmitButton className="w-full" pendingText={t.common.saving}>{t.auth.registerButton}</SubmitButton>
    </form>
  );
}
