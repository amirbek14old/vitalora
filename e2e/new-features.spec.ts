import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const password = "Sogʻlom2026parol";

async function go(page: Page, url: string) {
  await page.goto(url);
  await page.waitForSelector("html[data-hydrated=true]");
}

async function register(page: Page, email: string) {
  await go(page, "/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByLabel("Koʻrinadigan ism").fill("Coin Tester");
  await page.getByLabel("Tugʻilgan yil").fill("1995");
  await page.locator("#acceptTerms").check();
  await page.getByRole("button", { name: "Hisob yaratish" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("button", { name: "Sozlashni yakunlash" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe.configure({ mode: "serial" });

test("auth: logout, protected redirect with next, login returns to the page", async ({ page }, info) => {
  const email = `auth-${info.project.name}-${Date.now()}@test.local`;
  await register(page, email);

  // Logout from the profile page (works on phones too)
  await go(page, "/profile");
  await page.getByRole("button", { name: "Chiqish" }).last().click();
  await expect(page).toHaveURL(/\/$/);

  // Protected page → login with ?next → back to that page
  await page.goto("/shop");
  await expect(page).toHaveURL(/\/login\?next=%2Fshop/);
  await page.waitForSelector("html[data-hydrated=true]");
  await expect(page.getByText("Davom etish uchun tizimga kiring.")).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Parolni koʻrsatish" }).click();
  await expect(page.getByLabel("Parol", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/shop$/);

  // Open-redirect attempts are ignored
  await go(page, "/profile");
  await page.getByRole("button", { name: "Chiqish" }).last().click();
  await go(page, "/login?next=//evil.example");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("coins: earn by completing tasks, buy and equip a frame, upload a photo", async ({ page }, info) => {
  await register(page, `shop-${info.project.name}-${Date.now()}@test.local`);

  // Lesson (+15) + perfect quiz (+10) + achievements (+20 each)
  await go(page, "/academy/movement-basics/why-move");
  await page.getByLabel("150–300 daqiqa").check();
  await page.getByLabel("Ha", { exact: true }).check();
  await page.getByRole("button", { name: "Javoblarni tekshirish" }).click();
  await expect(page.getByText("Natijangiz: 2 tadan 2 ta")).toBeVisible();
  await page.getByRole("button", { name: "Darsni tugatilgan deb belgilash" }).click();
  await expect(page.getByText("Tugatildi")).toBeVisible();

  // Workout (+10)
  await go(page, "/fitness/history");
  await page.locator("#wk-title").fill("Walk");
  await page.getByRole("button", { name: "Saqlash" }).click();
  await expect(page.getByText(/Mashgʻulot saqlandi\. \+10 tanga/)).toBeVisible();

  await go(page, "/shop");
  const balanceText = await page.getByRole("link", { name: /Tangalar: \d+/ }).getAttribute("aria-label");
  const balance = Number(balanceText!.split(": ")[1]);
  expect(balance).toBeGreaterThanOrEqual(60);

  const teal = page.locator("div.rounded-2xl", { hasText: "Firuza halqa" }).first();
  await teal.getByRole("button", { name: /Sotib olish/ }).click();
  await expect(teal.getByText("Sotib olindi! Endi uni taqishingiz mumkin.")).toBeVisible();
  await teal.getByRole("button", { name: "Taqish" }).click();
  await expect(teal.getByText("Taqilgan")).toBeVisible();
  await expect(page.getByRole("link", { name: `Tangalar: ${balance - 60}` })).toBeVisible();

  // Pro-only item is refused without Pro
  const gold = page.locator("div.rounded-2xl", { hasText: "Oltin chempion" }).first();
  await gold.getByRole("button", { name: /Sotib olish/ }).click();
  await expect(gold.getByText(/Pro aʼzolar uchun|yetarli emas/)).toBeVisible();

  // Profile photo
  await go(page, "/profile");
  await page.locator("#avatar-file").setInputFiles(path.join(__dirname, "fixtures-meal.jpg"));
  await expect(page.getByRole("button", { name: "Rasmni almashtirish" })).toBeVisible();
  const img = page.locator('main img[src^="/api/avatar/"]').first();
  await expect(img).toBeVisible();
  const res = await page.request.get((await img.getAttribute("src"))!);
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toMatch(/image\/(webp|jpeg)/);
});

test("AI coach page loads and handles a missing model/camera gracefully", async ({ page, context }, info) => {
  await register(page, `coach-${info.project.name}-${Date.now()}@test.local`);
  await context.grantPermissions(["camera"]);
  await go(page, "/fitness/coach");
  await expect(page.getByRole("heading", { name: "AI murabbiy" })).toBeVisible();
  await expect(page.getByText(/Video hech qachon yuklanmaydi/)).toBeVisible();
  await page.getByRole("radio", { name: "Oʻtirib-turish" }).click();
  await expect(page.getByRole("radio", { name: "Oʻtirib-turish" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Kamerani yoqish" }).click();
  // Either the camera starts (real model reachable) or a clear, localized error is shown.
  await expect(page.getByRole("button", { name: "Tugatish va saqlash" }).or(page.getByRole("alert"))).toBeVisible({ timeout: 30_000 });
});

test("mobile tab bar navigation", async ({ page, isMobile }, info) => {
  test.skip(!isMobile, "phones only");
  await register(page, `tabs-${info.project.name}-${Date.now()}@test.local`);
  const tabs = page.getByRole("navigation", { name: "Tabs" });
  await expect(tabs).toBeVisible();
  await tabs.getByRole("link", { name: "Odatlar" }).click();
  await expect(page).toHaveURL(/\/habits$/);
  await tabs.getByRole("link", { name: "AI murabbiy" }).click();
  await expect(page).toHaveURL(/\/fitness\/coach$/);
  await tabs.getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  // No horizontal overflow on a phone
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
