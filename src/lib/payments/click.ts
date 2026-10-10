import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { click } from "./config";
import { markPaid } from "./grant";

/**
 * Click SHOP-API. Click sends two form-encoded POST requests:
 *   Prepare  (action=0) → /api/payments/click/prepare
 *   Complete (action=1) → /api/payments/click/complete
 * Both are signed with md5 using CLICK_SECRET_KEY. Amounts are in so'm.
 */

export type ClickParams = Record<string, string>;
type ClickResult = Record<string, string | number | null>;

const md5 = (s: string) => createHash("md5").update(s).digest("hex");

const ERR = {
  ok: [0, "Success"],
  sign: [-1, "SIGN CHECK FAILED!"],
  amount: [-2, "Incorrect parameter amount"],
  action: [-3, "Action not found"],
  paid: [-4, "Already paid"],
  order: [-5, "User does not exist"],
  tx: [-6, "Transaction does not exist"],
  bad: [-8, "Error in request from click"],
  cancelled: [-9, "Transaction cancelled"],
} as const;

function reply(p: ClickParams, e: (typeof ERR)[keyof typeof ERR], extra: ClickResult = {}): ClickResult {
  return { click_trans_id: p.click_trans_id ?? null, merchant_trans_id: p.merchant_trans_id ?? null, ...extra, error: e[0], error_note: e[1] };
}

function validSign(p: ClickParams, action: "0" | "1"): boolean {
  const base = action === "0"
    ? `${p.click_trans_id}${p.service_id}${click.secretKey}${p.merchant_trans_id}${p.amount}${p.action}${p.sign_time}`
    : `${p.click_trans_id}${p.service_id}${click.secretKey}${p.merchant_trans_id}${p.merchant_prepare_id}${p.amount}${p.action}${p.sign_time}`;
  return !!p.sign_string && md5(base) === p.sign_string.toLowerCase();
}

function sameAmount(given: string | undefined, expected: number): boolean {
  const n = Number(given);
  return Number.isFinite(n) && Math.abs(n - expected) < 0.01;
}

export async function clickPrepare(p: ClickParams): Promise<ClickResult> {
  if (!click.enabled) return reply(p, ERR.bad);
  if (!p.click_trans_id || !p.merchant_trans_id || p.service_id !== click.serviceId) return reply(p, ERR.bad);
  if (p.action !== "0") return reply(p, ERR.action);
  if (!validSign(p, "0")) return reply(p, ERR.sign);

  const order = await db.payment.findFirst({ where: { id: p.merchant_trans_id, provider: "CLICK" } });
  if (!order) return reply(p, ERR.order);
  if (order.status === "PAID") return reply(p, ERR.paid);
  if (order.status !== "PENDING") return reply(p, ERR.cancelled);
  if (!sameAmount(p.amount, order.amountUzs)) return reply(p, ERR.amount);
  if (order.providerTxId && order.providerTxId !== p.click_trans_id) return reply(p, ERR.paid);

  await db.payment.update({ where: { id: order.id }, data: { providerTxId: p.click_trans_id, providerState: 1 } });
  // merchant_prepare_id must be an integer: we use the row's creation time in seconds, checked again on Complete.
  return reply(p, ERR.ok, { merchant_prepare_id: Math.floor(order.createdAt.getTime() / 1000) });
}

export async function clickComplete(p: ClickParams): Promise<ClickResult> {
  if (!click.enabled) return reply(p, ERR.bad);
  if (!p.click_trans_id || !p.merchant_trans_id || p.service_id !== click.serviceId) return reply(p, ERR.bad);
  if (p.action !== "1") return reply(p, ERR.action);
  if (!validSign(p, "1")) return reply(p, ERR.sign);

  const order = await db.payment.findFirst({ where: { id: p.merchant_trans_id, provider: "CLICK" } });
  if (!order) return reply(p, ERR.order);
  if (order.providerTxId !== p.click_trans_id || String(Math.floor(order.createdAt.getTime() / 1000)) !== p.merchant_prepare_id) return reply(p, ERR.tx);
  if (!sameAmount(p.amount, order.amountUzs)) return reply(p, ERR.amount);
  if (order.status === "PAID") return reply(p, ERR.paid, { merchant_confirm_id: Math.floor(order.createdAt.getTime() / 1000) });
  if (order.status !== "PENDING") return reply(p, ERR.cancelled);

  // Click reports a failed payment with error < 0 → cancel our order.
  if (Number(p.error) < 0) {
    await db.payment.update({ where: { id: order.id }, data: { status: "CANCELLED", providerState: -1, cancelledAt: new Date() } });
    return reply(p, ERR.cancelled);
  }

  await db.$transaction(async (t) => markPaid(t, order.id, { providerState: 2 }));
  return reply(p, ERR.ok, { merchant_confirm_id: Math.floor(order.createdAt.getTime() / 1000) });
}

export async function readClickForm(req: Request): Promise<ClickParams> {
  const text = await req.text();
  const out: ClickParams = {};
  for (const [k, v] of new URLSearchParams(text)) out[k] = v;
  return out;
}
