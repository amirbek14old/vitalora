"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { AVATAR_GROUPS, AVATAR_PRESETS } from "@/lib/avatars";
import { PresetAvatarArt } from "@/components/preset-avatar-art";
import { setAvatarPresetAction } from "@/app/actions/avatar";
import { cn } from "@/lib/utils";

type Labels = { title: string; hint: string; proOnly: string; groups: Record<(typeof AVATAR_GROUPS)[number], string> };

/** Grid of ready-made profile pictures. Pro pictures are locked for non-Pro users. */
export function AvatarPicker({ current, pro, labels }: { current: string | null; pro: boolean; labels: Labels }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState(current);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function choose(key: string) {
    setMsg(null);
    start(async () => {
      const res = await setAvatarPresetAction(key);
      if (res.ok) {
        setSelected(key);
        setMsg({ ok: true, text: res.message ?? "" });
        router.refresh();
      } else setMsg({ text: res.error ?? "" });
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{labels.title}</h3>
        <p className="text-xs text-slate-500">{labels.hint}</p>
      </div>
      {AVATAR_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {labels.groups[group]} {group === "pro" && !pro && <Link href="/pro" className="ml-1 normal-case text-amber-600 underline">{labels.proOnly}</Link>}
          </p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
            {AVATAR_PRESETS.filter((p) => p.group === group).map((p) => {
              const locked = !!p.pro && !pro;
              const active = selected === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => choose(p.key)}
                  disabled={pending || locked}
                  aria-label={`${labels.groups[group]}: ${p.key}${locked ? ` (${labels.proOnly})` : ""}`}
                  aria-pressed={active}
                  data-testid={`preset-${p.key}`}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-full ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:ring-offset-surface-carddark",
                    active ? "ring-2 ring-brand-600" : "hover:scale-105",
                    locked && "cursor-not-allowed opacity-50 grayscale",
                  )}
                >
                  <PresetAvatarArt preset={p} />
                  {active && <span className="absolute inset-0 flex items-center justify-center bg-black/30"><Check className="h-1/2 w-1/2 text-white" aria-hidden /></span>}
                  {locked && <span className="absolute inset-0 flex items-center justify-center"><Lock className="h-1/3 w-1/3 text-white" aria-hidden /></span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {msg && <p role="status" className={cn("text-sm", msg.ok ? "text-brand-700 dark:text-brand-400" : "text-red-600")}>{msg.text}</p>}
    </div>
  );
}
