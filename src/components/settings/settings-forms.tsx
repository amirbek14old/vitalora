"use client";
import { useActionState } from "react";
import { changePasswordAction, deleteAccountAction, updateSettingsAction } from "@/app/actions/account";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import { locales, localeNames } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";

type Prefs = {
  locale: string; theme: string; aiConsent: boolean; aiPersonalizationConsent: boolean; analyticsConsent: boolean;
  communityVisible: boolean; remindersEnabled: boolean; reminderTime: string | null;
};
type T = Pick<Dictionary, "settings" | "common">;

export function PreferencesForm({ prefs, t }: { prefs: Prefs; t: T }) {
  const [state, action] = useActionState(updateSettingsAction, initialState);
  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label={t.common.language} htmlFor="s-locale">
          <Select id="s-locale" name="locale" defaultValue={prefs.locale}>
            {locales.map((l) => <option key={l} value={l}>{localeNames[l]}</option>)}
          </Select>
        </Field>
        <Field label={t.common.theme} htmlFor="s-theme">
          <Select id="s-theme" name="theme" defaultValue={prefs.theme}>
            <option value="system">{t.common.system}</option>
            <option value="light">{t.common.light}</option>
            <option value="dark">{t.common.dark}</option>
          </Select>
        </Field>
      </section>
      <fieldset className="space-y-4">
        <legend className="mb-2 text-base font-semibold">{t.settings.privacy}</legend>
        <Checkbox id="s-an" name="analyticsConsent" defaultChecked={prefs.analyticsConsent} label={t.settings.analytics} />
        <Checkbox id="s-cv" name="communityVisible" defaultChecked={prefs.communityVisible} label={t.settings.communityVisible} />
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-2 text-base font-semibold">{t.settings.reminders}</legend>
        <Checkbox id="s-rem" name="remindersEnabled" defaultChecked={prefs.remindersEnabled} label={t.settings.remindersEnabled} hint={t.settings.remindersNote} />
        <Field label={t.settings.reminderTime} htmlFor="s-rtime" className="max-w-40"><Input id="s-rtime" name="reminderTime" type="time" defaultValue={prefs.reminderTime ?? ""} /></Field>
      </fieldset>
      <SubmitButton pendingText={t.common.saving}>{t.common.save}</SubmitButton>
    </form>
  );
}

export function PasswordForm({ t, labels }: { t: T; labels: { current: string; next: string; hint: string } }) {
  const [state, action] = useActionState(changePasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label={labels.current} htmlFor="pw-cur"><Input id="pw-cur" name="currentPassword" type="password" autoComplete="current-password" required /></Field>
      <Field label={labels.next} hint={labels.hint} htmlFor="pw-new"><Input id="pw-new" name="newPassword" type="password" autoComplete="new-password" minLength={10} required /></Field>
      <SubmitButton variant="outline" pendingText={t.common.saving}>{t.settings.password}</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm({ t, passwordLabel }: { t: T; passwordLabel: string }) {
  const [state, action] = useActionState(deleteAccountAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-red-800 dark:text-red-200">{t.settings.deleteWarning}</p>
      <FormMessage state={state} />
      <Field label={t.settings.deleteConfirm} htmlFor="del-confirm"><Input id="del-confirm" name="confirm" required autoComplete="off" pattern="DELETE" /></Field>
      <Field label={passwordLabel} htmlFor="del-pw"><Input id="del-pw" name="password" type="password" autoComplete="current-password" required /></Field>
      <SubmitButton variant="danger" pendingText={t.common.saving}>{t.settings.deleteAccount}</SubmitButton>
    </form>
  );
}
