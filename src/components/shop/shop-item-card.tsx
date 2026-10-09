"use client";
import { useActionState } from "react";
import { Coins, Lock } from "lucide-react";
import { buyItemAction, equipItemAction } from "@/app/actions/shop";
import { SubmitButton } from "@/components/submit-button";
import { initialState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type Labels = { buy: string; owned: string; equip: string; equipped: string; unequip: string; proOnly: string };

export function ShopItemCard({
  code, kind, name, price, proOnly, owned, equipped, canBuy, preview, labels,
}: {
  code: string; kind: string; name: string; price: number; proOnly: boolean; owned: boolean; equipped: boolean; canBuy: boolean;
  preview: React.ReactNode; labels: Labels;
}) {
  const [buyState, buy] = useActionState(buyItemAction, initialState);
  const [equipState, equip] = useActionState(equipItemAction, initialState);
  const msg = buyState.error ?? equipState.error ?? buyState.message;
  return (
    <div className={cn("flex flex-col rounded-2xl border bg-white p-4 dark:bg-surface-carddark", equipped ? "border-brand-500 ring-2 ring-brand-500/30" : "border-slate-200 dark:border-slate-800")}>
      <div className="flex h-24 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900">{preview}</div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <p className="font-medium">{name}</p>
        {proOnly && <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"><Lock className="h-3 w-3" aria-hidden />PRO</span>}
      </div>
      <div className="mt-auto pt-3">
        {owned ? (
          <form action={equip}>
            <input type="hidden" name="kind" value={kind} />
            {!equipped && <input type="hidden" name="code" value={code} />}
            <SubmitButton size="sm" variant={equipped ? "outline" : "secondary"} className="w-full">{equipped ? labels.unequip : labels.equip}</SubmitButton>
          </form>
        ) : (
          <form action={buy}>
            <input type="hidden" name="code" value={code} />
            <SubmitButton size="sm" className="w-full" variant={canBuy ? "primary" : "outline"}>
              <Coins className="h-4 w-4" aria-hidden />{price} · {labels.buy}
            </SubmitButton>
          </form>
        )}
        {equipped && <p className="mt-1 text-center text-xs text-brand-700 dark:text-brand-400">{labels.equipped}</p>}
        {msg && <p role="status" className={cn("mt-2 text-center text-xs", buyState.error || equipState.error ? "text-red-600" : "text-emerald-600")}>{msg}</p>}
      </div>
    </div>
  );
}

export function BuyProButton({ price, label, disabledLabel, canBuy }: { price: number; label: string; disabledLabel?: string; canBuy: boolean }) {
  const [state, buy] = useActionState(buyItemAction, initialState);
  return (
    <form action={buy} className="space-y-2">
      <input type="hidden" name="code" value="pro_pass_30" />
      <SubmitButton size="lg" variant={canBuy ? "primary" : "outline"} className="w-full sm:w-auto">
        <Coins className="h-4 w-4" aria-hidden />{label.replace("{price}", String(price))}
      </SubmitButton>
      {!canBuy && disabledLabel && <p className="text-xs opacity-80">{disabledLabel}</p>}
      {(state.error || state.message) && <p role="status" className={cn("text-sm font-medium", state.error ? "text-red-100" : "text-white")}>{state.error ?? state.message}</p>}
    </form>
  );
}
