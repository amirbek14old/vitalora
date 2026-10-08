"use client";
import { useActionState, useEffect, useRef } from "react";
import { createPostAction } from "@/app/actions/community";
import { Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { initialState } from "@/lib/action-state";

export function PostForm({ communityId, parentId, labels, compact }: { communityId: string; parentId?: string; labels: { placeholder: string; submit: string; saving: string }; compact?: boolean }) {
  const [state, action] = useActionState(createPostAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const id = `post-${parentId ?? communityId}`;
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="communityId" value={communityId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <label htmlFor={id} className="sr-only">{labels.placeholder}</label>
      <Textarea id={id} name="body" required minLength={2} maxLength={1000} placeholder={labels.placeholder} className={compact ? "min-h-12" : undefined} />
      <FormMessage state={state} />
      <SubmitButton size="sm" pendingText={labels.saving}>{labels.submit}</SubmitButton>
    </form>
  );
}
