"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";
import { PasswordInput } from "./password-input";

export function LoginForm({ labels, next }: { labels: { email: string; password: string; submit: string; pending: string; show: string; hide: string }; next?: string }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={labels.email} htmlFor="email"><Input id="email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" required /></Field>
      <Field label={labels.password} htmlFor="password"><PasswordInput id="password" name="password" autoComplete="current-password" required labels={{ show: labels.show, hide: labels.hide }} /></Field>
      <SubmitButton className="w-full" pendingText={labels.pending}>{labels.submit}</SubmitButton>
    </form>
  );
}
