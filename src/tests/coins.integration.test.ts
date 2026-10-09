/**
 * Integration tests for the coin economy. They need a test database:
 *   DATABASE_URL=postgresql://… npm test
 * Without DATABASE_URL they are skipped.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("coin economy (database)", async () => {
  const { db } = await import("@/lib/db");
  const { awardCoins, purchaseItem, equipItem } = await import("@/lib/coins");
  let userId = "";

  beforeAll(async () => {
    const u = await db.user.create({
      data: {
        email: `coins-${Date.now()}@test.local`,
        passwordHash: "x",
        profile: { create: { displayName: "Coin Tester", birthYear: 1990, ageGroup: "ADULT", onboardingDone: true } },
      },
    });
    userId = u.id;
    await db.shopItem.upsert({ where: { code: "frame_teal" }, update: {}, create: { code: "frame_teal", kind: "FRAME", name: { en: "Teal" }, price: 60, style: "teal" } });
    await db.shopItem.upsert({ where: { code: "frame_gold" }, update: {}, create: { code: "frame_gold", kind: "FRAME", name: { en: "Gold" }, price: 300, proOnly: true, style: "gold" } });
    await db.shopItem.upsert({ where: { code: "pro_pass_30" }, update: {}, create: { code: "pro_pass_30", kind: "PRO_PASS", name: { en: "Pro" }, price: 500, style: "pro" } });
  });

  afterAll(async () => {
    if (userId) await db.user.delete({ where: { id: userId } });
  });

  const balance = async () => (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;

  it("awards once per refKey (no double rewards for the same task)", async () => {
    expect(await awardCoins(userId, "habit", "habit:h1:2026-10-09")).toBe(2);
    expect(await awardCoins(userId, "habit", "habit:h1:2026-10-09")).toBe(0);
    expect(await balance()).toBe(2);
  });

  it("enforces daily caps", async () => {
    const got = [];
    for (let i = 0; i < 4; i++) got.push(await awardCoins(userId, "workout", `workout:w${i}`));
    expect(got).toEqual([10, 10, 10, 0]);
  });

  it("limits camera-coach coins per day", async () => {
    expect(await awardCoins(userId, "form_check", "form:a", 25)).toBe(25);
    expect(await awardCoins(userId, "form_check", "form:b", 25)).toBe(25);
    expect(await awardCoins(userId, "form_check", "form:c", 25)).toBe(0);
  });

  it("buys items atomically and refuses when coins are insufficient", async () => {
    const before = await balance(); // 2 + 30 + 50 = 82
    expect(before).toBe(82);
    expect(await purchaseItem(userId, "frame_teal")).toEqual({ ok: true });
    expect(await balance()).toBe(22);
    expect(await purchaseItem(userId, "frame_teal")).toEqual({ ok: false, error: "owned" });
    expect(await purchaseItem(userId, "pro_pass_30")).toEqual({ ok: false, error: "insufficient" });
    expect(await balance()).toBe(22);
  });

  it("requires Pro for Pro-only items and grants Pro with a pass", async () => {
    expect(await purchaseItem(userId, "frame_gold")).toEqual({ ok: false, error: "need_pro" });
    await db.user.update({ where: { id: userId }, data: { coins: { increment: 1000 } } });
    expect(await purchaseItem(userId, "pro_pass_30")).toEqual({ ok: true });
    const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(u.proUntil!.getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);
    expect(await purchaseItem(userId, "frame_gold")).toEqual({ ok: true });
  });

  it("only equips owned items", async () => {
    expect(await equipItem(userId, "FRAME", "frame_gold")).toBe(true);
    expect(await equipItem(userId, "BANNER", "banner_galaxy")).toBe(false);
    const p = await db.profile.findUniqueOrThrow({ where: { userId } });
    expect(p.equippedFrame).toBe("frame_gold");
  });

  it("never lets the balance go negative under concurrent purchases", async () => {
    await db.user.update({ where: { id: userId }, data: { coins: 300 } });
    await db.userItem.deleteMany({ where: { userId, item: { code: "frame_teal" } } });
    await db.shopItem.upsert({ where: { code: "frame_mint" }, update: {}, create: { code: "frame_mint", kind: "FRAME", name: { en: "Mint" }, price: 200, style: "mint" } });
    // 300 coins, two 200-coin purchases at once → exactly one succeeds
    await db.shopItem.update({ where: { code: "frame_teal" }, data: { price: 200 } });
    const results = await Promise.all([purchaseItem(userId, "frame_teal"), purchaseItem(userId, "frame_mint")]);
    await db.shopItem.update({ where: { code: "frame_teal" }, data: { price: 60 } });
    expect(results.filter((r) => r.ok).length).toBe(1);
    expect(await balance()).toBe(100);
  });
});
