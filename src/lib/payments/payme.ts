import "server-only";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { payme } from "./config";
import { markPaid, markRefunded } from "./grant";

/**
 * Payme Merchant API (JSON-RPC 2.0). Payme calls POST /api/payments/payme with
 * Authorization: Basic base64("Paycom:<KEY>").
 * Docs: https://developer.help.paycom.uz/  — amounts are in tiyin (1 so'm = 100 tiyin).
 */

const TIMEOUT_MS = 12 * 60 * 60 * 1000; // a created transaction expires after 12 hours

type Msg = { ru: string; uz: string; en: string };
const E = {
  auth: { code: -32504, message: { ru: "Недостаточно привилегий", uz: "Ruxsat yetarli emas", en: "Insufficient privileges" } },
  method: { code: -32601, message: { ru: "Метод не найден", uz: "Metod topilmadi", en: "Method not found" } },
  parse: { code: -32700, message: { ru: "Ошибка разбора JSON", uz: "JSON xatosi", en: "Parse error" } },
  amount: { code: -31001, message: { ru: "Неверная сумма", uz: "Notoʻgʻri summa", en: "Wrong amount" } },
  order: { code: -31050, message: { ru: "Заказ не найден", uz: "Buyurtma topilmadi", en: "Order not found" } },
  busy: { code: -31051, message: { ru: "Заказ уже оплачивается", uz: "Buyurtma allaqachon toʻlanmoqda", en: "Order is already being paid" } },
  tx: { code: -31003, message: { ru: "Транзакция не найдена", uz: "Tranzaksiya topilmadi", en: "Transaction not found" } },
  cant: { code: -31008, message: { ru: "Невозможно выполнить операцию", uz: "Amalni bajarib boʻlmaydi", en: "Unable to perform operation" } },
} satisfies Record<string, { code: number; message: Msg }>;

type RpcId = string | number | null;
type RpcResponse = { result?: unknown; error?: { code: number; message: Msg; data?: string }; id: RpcId };

const err = (e: { code: number; message: Msg }, id: RpcId, data?: string): RpcResponse => ({ error: { ...e, ...(data ? { data } : {}) }, id });

export function checkPaymeAuth(header: string | null): boolean {
  if (!payme.enabled || !header?.startsWith("Basic ")) return false;
  const given = Buffer.from(header.slice(6), "base64");
  const expected = Buffer.from(`Paycom:${payme.key}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const ms = (d: Date | null | undefined) => (d ? d.getTime() : 0);

type Params = { id?: string; time?: number; amount?: number; account?: { order_id?: string }; reason?: number; from?: number; to?: number };

async function findOrder(account: Params["account"]) {
  const orderId = account?.order_id;
  if (!orderId || typeof orderId !== "string") return null;
  return db.payment.findFirst({ where: { id: orderId, provider: "PAYME" } });
}

export async function handlePayme(body: unknown, authHeader: string | null): Promise<RpcResponse> {
  const req = (body ?? {}) as { method?: string; params?: Params; id?: RpcId };
  const id = req.id ?? null;
  if (!checkPaymeAuth(authHeader)) return err(E.auth, id);
  const p = req.params ?? {};

  switch (req.method) {
    case "CheckPerformTransaction": {
      const order = await findOrder(p.account);
      if (!order) return err(E.order, id, "order_id");
      if (order.status !== "PENDING") return err(E.busy, id, "order_id");
      if (p.amount !== order.amountUzs * 100) return err(E.amount, id);
      return { result: { allow: true }, id };
    }

    case "CreateTransaction": {
      if (!p.id) return err(E.tx, id);
      const existing = await db.payment.findFirst({ where: { provider: "PAYME", providerTxId: p.id } });
      if (existing) {
        if (existing.providerState !== 1) return err(E.cant, id);
        if (Date.now() - Number(existing.providerCreate ?? 0) > TIMEOUT_MS) {
          await db.payment.update({ where: { id: existing.id }, data: { providerState: -1, status: "CANCELLED", cancelReason: 4, cancelledAt: new Date() } });
          return err(E.cant, id);
        }
        return { result: { create_time: Number(existing.providerCreate), transaction: existing.id, state: 1 }, id };
      }
      const order = await findOrder(p.account);
      if (!order) return err(E.order, id, "order_id");
      if (p.amount !== order.amountUzs * 100) return err(E.amount, id);
      // One active Payme transaction per order.
      if (order.status !== "PENDING" || (order.providerTxId && order.providerTxId !== p.id)) return err(E.busy, id, "order_id");
      const createTime = Date.now();
      await db.payment.update({ where: { id: order.id }, data: { providerTxId: p.id, providerState: 1, providerCreate: BigInt(createTime) } });
      return { result: { create_time: createTime, transaction: order.id, state: 1 }, id };
    }

    case "PerformTransaction": {
      const tx = p.id ? await db.payment.findFirst({ where: { provider: "PAYME", providerTxId: p.id } }) : null;
      if (!tx) return err(E.tx, id);
      if (tx.providerState === 2) return { result: { transaction: tx.id, perform_time: ms(tx.performedAt), state: 2 }, id };
      if (tx.providerState !== 1) return err(E.cant, id);
      if (Date.now() - Number(tx.providerCreate ?? 0) > TIMEOUT_MS) {
        await db.payment.update({ where: { id: tx.id }, data: { providerState: -1, status: "CANCELLED", cancelReason: 4, cancelledAt: new Date() } });
        return err(E.cant, id);
      }
      await db.$transaction(async (t) => markPaid(t, tx.id, { providerState: 2 }));
      const done = await db.payment.findUniqueOrThrow({ where: { id: tx.id } });
      return { result: { transaction: done.id, perform_time: ms(done.performedAt), state: 2 }, id };
    }

    case "CancelTransaction": {
      const tx = p.id ? await db.payment.findFirst({ where: { provider: "PAYME", providerTxId: p.id } }) : null;
      if (!tx) return err(E.tx, id);
      const reason = typeof p.reason === "number" ? p.reason : null;
      if (tx.providerState === 1) {
        await db.payment.update({ where: { id: tx.id }, data: { providerState: -1, status: "CANCELLED", cancelReason: reason, cancelledAt: new Date() } });
      } else if (tx.providerState === 2) {
        await db.$transaction(async (t) => markRefunded(t, tx.id, { providerState: -2, cancelReason: reason }));
      }
      const done = await db.payment.findUniqueOrThrow({ where: { id: tx.id } });
      return { result: { transaction: done.id, cancel_time: ms(done.cancelledAt), state: done.providerState }, id };
    }

    case "CheckTransaction": {
      const tx = p.id ? await db.payment.findFirst({ where: { provider: "PAYME", providerTxId: p.id } }) : null;
      if (!tx) return err(E.tx, id);
      return {
        result: {
          create_time: Number(tx.providerCreate ?? 0),
          perform_time: ms(tx.performedAt),
          cancel_time: ms(tx.cancelledAt),
          transaction: tx.id,
          state: tx.providerState,
          reason: tx.cancelReason,
        },
        id,
      };
    }

    case "GetStatement": {
      const from = BigInt(Math.floor(p.from ?? 0));
      const to = BigInt(Math.floor(p.to ?? 0));
      const list = await db.payment.findMany({ where: { provider: "PAYME", providerCreate: { gte: from, lte: to } }, orderBy: { providerCreate: "asc" } });
      return {
        result: {
          transactions: list.map((t) => ({
            id: t.providerTxId,
            time: Number(t.providerCreate),
            amount: t.amountUzs * 100,
            account: { order_id: t.id },
            create_time: Number(t.providerCreate),
            perform_time: ms(t.performedAt),
            cancel_time: ms(t.cancelledAt),
            transaction: t.id,
            state: t.providerState,
            reason: t.cancelReason,
          })),
        },
        id,
      };
    }

    default:
      return err(E.method, id);
  }
}

export const PAYME_PARSE_ERROR = (): RpcResponse => err(E.parse, null);
