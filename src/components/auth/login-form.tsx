"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

export function LoginForm({ labels }: { labels: { email: string; password: string; submit: string; pending: string } }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field label={labels.email} htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
      <Field label={labels.password} htmlFor="password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
      <SubmitButton className="w-full" pendingText={labels.pending}>{labels.submit}</SubmitButton>
    </form>
  );
}
