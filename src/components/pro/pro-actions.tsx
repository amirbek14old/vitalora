"use client";
import { useActionState } from "react";
import { CreditCard, Gift } from "lucide-react";
import { claimProBonusAction, startProCheckoutAction } from "@/app/actions/pro";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

export function ProCheckout({ providers, labels }: { providers: ("PAYME" | "CLICK")[]; labels: { PAYME: string; CLICK: string; redirecting: string } }) {
  const [state, action] = useActionState(startProCheckoutAction, initialState);
  return (
    <form action={action} className="space-y-2">
      <FormMessage state={state} />
      {providers.map((p) => (
        <SubmitButton key={p} name="provider" value={p} size="lg" pendingText={labels.redirecting} className={p === "PAYME" ? "w-full bg-[#00CCCC] text-slate-950 hover:bg-[#00b8b8]" : "w-full bg-[#0073FF] text-white hover:bg-[#0062d9]"}>
          <CreditCard className="h-4 w-4" aria-hidden />{labels[p]}
        </SubmitButton>
      ))}
    </form>
  );
}

export function ClaimBonus({ label }: { label: string }) {
  const [state, action] = useActionState(claimProBonusAction, initialState);
  return (
    <form action={action} className="space-y-2">
      <FormMessage state={state} />
      <SubmitButton variant="secondary"><Gift className="h-4 w-4" aria-hidden />{label}</SubmitButton>
    </form>
  );
}
