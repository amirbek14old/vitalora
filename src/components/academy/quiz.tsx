"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { submitQuizAction, type QuizResult } from "@/app/actions/academy";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type QuizQuestionView = { id: string; prompt: string; options: string[] };

export function Quiz({ lessonId, questions, labels }: { lessonId: string; questions: QuizQuestionView[]; labels: { check: string; score: string; error: string } }) {
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, startTransition] = useTransition();
  const graded = result && !("error" in result) ? result : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => setResult(await submitQuizAction({ lessonId, answers })));
      }}
      className="space-y-5"
    >
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="mb-2 font-medium">{qi + 1}. {q.prompt}</legend>
          {q.options.map((opt, oi) => {
            const isCorrect = graded?.correct[qi] === oi;
            const isWrongPick = graded && answers[qi] === oi && !isCorrect;
            return (
              <label
                key={oi}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm",
                  graded && isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : isWrongPick ? "border-red-400 bg-red-50 dark:bg-red-950/40" : "border-slate-200 dark:border-slate-700",
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={oi}
                  checked={answers[qi] === oi}
                  disabled={!!graded}
                  onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                  className="h-4 w-4 accent-brand-700"
                />
                <span className="flex-1">{opt}</span>
                {graded && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />}
                {isWrongPick && <XCircle className="h-4 w-4 text-red-600" aria-hidden />}
              </label>
            );
          })}
          {graded && <p className="text-sm text-slate-600 dark:text-slate-300">{graded.explanations[qi]}</p>}
        </fieldset>
      ))}
      <div aria-live="polite">
        {graded && <Alert tone="success">{labels.score.replace("{score}", String(graded.score)).replace("{total}", String(graded.total))}</Alert>}
        {result && "error" in result && <Alert tone="error">{labels.error}</Alert>}
      </div>
      {!graded && (
        <Button type="submit" disabled={pending || answers.some((a) => a < 0)}>
          {labels.check}
        </Button>
      )}
    </form>
  );
}
