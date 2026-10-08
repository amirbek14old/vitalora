"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { saveMealAction } from "@/app/actions/meals";
import { scaleItem, totals, type FoodAnalysis, type FoodItem } from "@/lib/ai/food";
import type { Dictionary } from "@/lib/i18n/types";

type Labels = Dictionary["foodScan"] & { groupLabels: Record<string, string>; errorGeneric: string; notConfigured: string; rateLimited: string };

/** Downscale on the device before upload: smaller request and EXIF metadata (incl. GPS) is removed. */
async function downscale(file: File, maxSide = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85));
}

export function FoodScanner({ labels, teen }: { labels: Labels; teen: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "saved">("idle");
  const [error, setError] = useState<string>("");
  const [original, setOriginal] = useState<FoodItem[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [note, setNote] = useState("");
  const [saving, startSaving] = useTransition();

  const sum = useMemo(() => totals(items), [items]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(f.type) && f.type !== "") {
      setStatus("error");
      setError(labels.badType);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setFile(f);
    setStatus("idle");
    setItems([]);
  }

  async function analyse() {
    if (!file) return;
    setStatus("loading");
    setError("");
    try {
      const blob = await downscale(file).catch(() => file);
      if (blob.size > 4 * 1024 * 1024) {
        setStatus("error");
        setError(labels.tooLarge);
        return;
      }
      const fd = new FormData();
      fd.append("image", blob, "meal.jpg");
      const res = await fetch("/api/ai/food-scan", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = {
          not_food: labels.notFood, too_large: labels.tooLarge, bad_type: labels.badType,
          not_configured: labels.notConfigured, rate_limited: labels.rateLimited, consent_required: labels.consentNeeded,
        };
        setStatus("error");
        setError(map[data.error] ?? labels.errorGeneric);
        return;
      }
      const analysis = data.analysis as FoodAnalysis;
      setOriginal(analysis.items);
      setItems(analysis.items);
      setNote(analysis.balanceNote ?? "");
      setStatus("done");
    } catch {
      setStatus("error");
      setError(labels.errorGeneric);
    }
  }

  function setPortion(i: number, grams: number) {
    if (!Number.isFinite(grams) || grams < 1 || grams > 3000) return;
    setItems((prev) => prev.map((it, idx) => (idx === i ? scaleItem(original[i], grams) : it)));
  }

  function save() {
    startSaving(async () => {
      const res = await saveMealAction({ items, balanceNote: note });
      if (res.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("error");
        setError(labels.errorGeneric);
      }
    });
  }

  return (
    <div className="space-y-5">
      <Alert tone="info">{labels.disclaimer}{teen && <> {labels.teenNote}</>}</Alert>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-3">
          <input ref={inputRef} id="food-photo" type="file" accept="image/*" capture="environment" className="sr-only" onChange={onPick} />
          <label htmlFor="food-photo" className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-brand-500 dark:border-slate-600">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="max-h-72 rounded-xl object-contain" />
            ) : (
              <>
                <Camera className="mb-2 h-10 w-10 text-brand-600" aria-hidden />
                <span className="font-medium">{labels.choose}</span>
                <span className="mt-1 text-xs text-slate-500">JPEG · PNG · WebP · ≤ 4 MB</span>
              </>
            )}
          </label>
          <Button onClick={analyse} disabled={!file || status === "loading"} className="w-full sm:w-auto">
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
            {status === "loading" ? labels.analysing : labels.analyse}
          </Button>
        </div>
      </div>

      <div aria-live="polite">
        {status === "error" && <Alert tone="error">{error}</Alert>}
        {status === "saved" && <Alert tone="success">{labels.saved}</Alert>}
      </div>

      {(status === "done" || status === "saved") && items.length > 0 && (
        <section aria-labelledby="scan-result" className="space-y-3">
          <h2 id="scan-result" className="text-lg font-semibold">{labels.resultTitle}</h2>
          <p className="text-xs text-slate-500">{labels.editHint}</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="bg-slate-50 text-left dark:bg-slate-800/60">
                <tr>
                  <th scope="col" className="p-3">{labels.item}</th>
                  <th scope="col" className="p-3">{labels.portion}</th>
                  {!teen && <th scope="col" className="p-3">{labels.kcal}</th>}
                  {!teen && <th scope="col" className="p-3">{labels.protein}</th>}
                  {!teen && <th scope="col" className="p-3">{labels.carbs}</th>}
                  {!teen && <th scope="col" className="p-3">{labels.fat}</th>}
                  <th scope="col" className="p-3">{labels.confidence}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="p-3">
                      <p className="font-medium">{it.name}</p>
                      <p className="text-xs text-slate-500">{labels.groupLabels[it.foodGroup] ?? it.foodGroup}</p>
                    </td>
                    <td className="p-3">
                      <label className="sr-only" htmlFor={`portion-${i}`}>{labels.portion}: {it.name}</label>
                      <input id={`portion-${i}`} type="number" min={1} max={3000} defaultValue={it.portionGrams} onChange={(e) => setPortion(i, Number(e.target.value))} className="h-9 w-20 rounded-lg border border-slate-300 bg-transparent px-2 dark:border-slate-600" />
                    </td>
                    {!teen && <td className="p-3">{it.kcal ?? "—"}</td>}
                    {!teen && <td className="p-3">{it.proteinG ?? "—"}</td>}
                    {!teen && <td className="p-3">{it.carbsG ?? "—"}</td>}
                    {!teen && <td className="p-3">{it.fatG ?? "—"}</td>}
                    <td className="p-3">{it.confidence ? <Badge tone={it.confidence === "high" ? "brand" : it.confidence === "medium" ? "slate" : "amber"}>{labels.confidenceLevels[it.confidence]}</Badge> : "—"}</td>
                  </tr>
                ))}
              </tbody>
              {!teen && (
                <tfoot className="border-t-2 border-slate-300 font-semibold dark:border-slate-600">
                  <tr>
                    <th scope="row" className="p-3 text-left">{labels.total} (≈)</th>
                    <td className="p-3" />
                    <td className="p-3">{sum.kcal}</td>
                    <td className="p-3">{sum.proteinG}</td>
                    <td className="p-3">{sum.carbsG}</td>
                    <td className="p-3">{sum.fatG}</td>
                    <td className="p-3" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {note && <Alert tone="success"><strong>{labels.balance}:</strong> {note}</Alert>}
          {status === "done" && (
            <Button variant="secondary" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" aria-hidden />{labels.save}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
