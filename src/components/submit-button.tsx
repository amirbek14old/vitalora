"use client";
import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant, type ButtonSize } from "./ui/button";

export function SubmitButton({ children, pendingText, variant, size, className, name, value }: { children: React.ReactNode; pendingText?: string; variant?: ButtonVariant; size?: ButtonSize; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending} aria-busy={pending} name={name} value={value}>
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
