/**
 * Payme and Click callback flows against a real test database.
 *   DATABASE_URL=postgresql://… npm test
 */
import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
process.env.PAYME_MERCHANT_ID = "test-merchant";
process.env.PAYME_KEY = "test-key";
process.env.CLICK_SERVICE_ID = "111";
process.env.CLICK_MERCHANT_ID = "222";
process.env.CLICK_SECRET_KEY = "click-secret";
process.env.PRO_PRICE_UZS = "65000";

const md5 = (s: string) => createHash("md5").update(s).digest("hex");
const AUTH = "Basic " + Buffer.from("Paycom:test-key").toString("base64");

describe.skipIf(!hasDb)("payments (database)", async () => {
  const { db } = await import("@/lib/db");
  const { handlePayme } = await import("@/lib/payments/payme");
  const { clickPrepare, clickComplete } = await import("@/lib/payments/click");
  let userId = "";

  beforeAll(async () => {
    const u = await db.user.create({
      data: { email: `pay-${Date.now()}@test.local`, passwordHash: "x", profile: { create: { displayName: "Payer", birthYear: 1990, ageGroup: "ADULT", onboardingDone: true } } },
    });
    userId = u.id;
  });
  afterAll(async () => {
    if (userId) await db.user.delete({ where: { id: userId } });
  });

  const proDaysLeft = async () => {
    const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
    return u.proUntil ? (u.proUntil.getTime() - Date.now()) / 86_400_000 : 0;
  };
  const rpc = (method: string, params: object, auth = AUTH) => handlePayme({ jsonrpc: "2.0", id: 1, method, params }, auth);

  it("Payme: rejects wrong auth, wrong amount and unknown orders", async () => {
    const order = await db.payment.create({ data: { userId, provider: "PAYME", product: "pro_14d", amountUzs: 65000 } });
    expect((await rpc("CheckPerformTransaction", { amount: 6_500_000, account: { order_id: order.id } }, "Basic bad")).error?.code).toBe(-32504);
    expect((await rpc("CheckPerformTransaction", { amount: 100, account: { order_id: order.id } })).error?.code).toBe(-31001);
    expect((await rpc("CheckPerformTransaction", { amount: 6_500_000, account: { order_id: "nope" } })).error?.code).toBe(-31050);
    expect((await rpc("CheckPerformTransaction", { amount: 6_500_000, account: { order_id: order.id } })).result).toEqual({ allow: true });
  });

  it("Payme: create → perform gives 14 days of Pro once; cancel after perform takes it back", async () => {
    const order = await db.payment.create({ data: { userId, provider: "PAYME", product: "pro_14d", amountUzs: 65000 } });
    const created = await rpc("CreateTransaction", { id: "pm-1", time: Date.now(), amount: 6_500_000, account: { order_id: order.id } });
    expect(created.result).toMatchObject({ transaction: order.id, state: 1 });
    // Same id again → same answer (idempotent); another Payme tx for the same order → busy.
    expect((await rpc("CreateTransaction", { id: "pm-1", time: Date.now(), amount: 6_500_000, account: { order_id: order.id } })).result).toMatchObject({ state: 1 });
    expect((await rpc("CreateTransaction", { id: "pm-2", time: Date.now(), amount: 6_500_000, account: { order_id: order.id } })).error?.code).toBe(-31051);

    expect((await rpc("PerformTransaction", { id: "pm-1" })).result).toMatchObject({ state: 2 });
    expect((await rpc("PerformTransaction", { id: "pm-1" })).result).toMatchObject({ state: 2 }); // repeat is safe
    const days = await proDaysLeft();
    expect(days).toBeGreaterThan(13.9);
    expect(days).toBeLessThan(14.1);
    expect((await rpc("CheckTransaction", { id: "pm-1" })).result).toMatchObject({ state: 2, transaction: order.id });

    expect((await rpc("CancelTransaction", { id: "pm-1", reason: 5 })).result).toMatchObject({ state: -2 });
    expect(await proDaysLeft()).toBeLessThan(0.1);
    expect((await db.payment.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("REFUNDED");

    const st = await rpc("GetStatement", { from: Date.now() - 60_000, to: Date.now() + 60_000 });
    expect((st.result as { transactions: unknown[] }).transactions.length).toBeGreaterThanOrEqual(1);
  });

  it("Payme: cancelling before payment doesn't give Pro", async () => {
    const order = await db.payment.create({ data: { userId, provider: "PAYME", product: "pro_14d", amountUzs: 65000 } });
    await rpc("CreateTransaction", { id: "pm-3", time: Date.now(), amount: 6_500_000, account: { order_id: order.id } });
    expect((await rpc("CancelTransaction", { id: "pm-3", reason: 3 })).result).toMatchObject({ state: -1 });
    expect((await rpc("PerformTransaction", { id: "pm-3" })).error?.code).toBe(-31008);
    expect(await proDaysLeft()).toBeLessThan(0.1);
  });

  it("Click: prepare → complete with valid signatures gives 14 days; bad signature is rejected", async () => {
    await db.user.update({ where: { id: userId }, data: { proUntil: null } });
    const order = await db.payment.create({ data: { userId, provider: "CLICK", product: "pro_14d", amountUzs: 65000 } });
    const base = { click_trans_id: "9001", service_id: "111", click_paydoc_id: "1", merchant_trans_id: order.id, amount: "65000.00", error: "0", error_note: "Success", sign_time: "2026-10-10 12:00:00" };
    const prep = { ...base, action: "0", sign_string: md5(`9001111click-secret${order.id}65000.0002026-10-10 12:00:00`) };
    expect((await clickPrepare({ ...prep, sign_string: "bad" })).error).toBe(-1);
    const p = await clickPrepare(prep);
    expect(p.error).toBe(0);
    const prepareId = String(p.merchant_prepare_id);
    const comp = { ...base, action: "1", merchant_prepare_id: prepareId, sign_string: md5(`9001111click-secret${order.id}${prepareId}65000.0012026-10-10 12:00:00`) };
    expect((await clickComplete(comp)).error).toBe(0);
    expect((await clickComplete(comp)).error).toBe(-4); // already paid — no double Pro
    const days = await proDaysLeft();
    expect(days).toBeGreaterThan(13.9);
    expect(days).toBeLessThan(14.1);
  });
});
