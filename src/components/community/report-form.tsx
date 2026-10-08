"use client";
import { useActionState } from "react";
import { Flag } from "lucide-react";
import { reportPostAction } from "@/app/actions/community";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

export function ReportForm({ postId, labels }: { postId: string; labels: { report: string; reason: string; submit: string } }) {
  const [state, action] = useActionState(reportPostAction, initialState);
  return (
    <details className="text-xs">
      <summary className="inline-flex cursor-pointer items-center gap-1 text-slate-500 hover:text-red-600"><Flag className="h-3.5 w-3.5" aria-hidden />{labels.report}</summary>
      {state.ok ? (
        <div className="mt-2"><FormMessage state={state} /></div>
      ) : (
        <form action={action} className="mt-2 flex flex-wrap items-end gap-2">
          <input type="hidden" name="postId" value={postId} />
          <label htmlFor={`r-${postId}`} className="sr-only">{labels.reason}</label>
          <Input id={`r-${postId}`} name="reason" required minLength={3} maxLength={300} placeholder={labels.reason} className="h-9 max-w-xs" />
          <SubmitButton size="sm" variant="outline">{labels.submit}</SubmitButton>
          <FormMessage state={state} />
        </form>
      )}
    </details>
  );
}
