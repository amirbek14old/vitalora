import "server-only";
import type { Prisma } from "@prisma/client";
import { extendPro, shortenPro } from "@/lib/coins";
import { PRO_PAID_DAYS } from "@/lib/coin-rules";

/** Marks a payment as paid and gives 14 days of Pro. Idempotent: does nothing if it was already paid. */
export async function markPaid(tx: Prisma.TransactionClient, paymentId: string, extra: Prisma.PaymentUpdateInput = {}): Promise<void> {
  const updated = await tx.payment.updateMany({ where: { id: paymentId, status: "PENDING" }, data: { status: "PAID", performedAt: new Date() } });
  if (Object.keys(extra).length) await tx.payment.update({ where: { id: paymentId }, data: extra });
  if (updated.count === 1) {
    const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, select: { userId: true } });
    await extendPro(tx, p.userId, PRO_PAID_DAYS);
  }
}

/** Refund after payment: takes the Pro days back. */
export async function markRefunded(tx: Prisma.TransactionClient, paymentId: string, extra: Prisma.PaymentUpdateInput = {}): Promise<void> {
  const updated = await tx.payment.updateMany({ where: { id: paymentId, status: "PAID" }, data: { status: "REFUNDED", cancelledAt: new Date() } });
  if (Object.keys(extra).length) await tx.payment.update({ where: { id: paymentId }, data: extra });
  if (updated.count === 1) {
    const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, select: { userId: true } });
    await shortenPro(tx, p.userId, PRO_PAID_DAYS);
  }
}
