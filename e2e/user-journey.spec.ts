import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const password = "Sogʻlom2026parol";

/** Navigate and wait until React has hydrated, so clicks aren't lost. */
async function go(page: Page, url: string) {
  await page.goto(url);
  await page.waitForSelector("html[data-hydrated=true]");
}

async function register(page: Page, email: string, birthYear: number) {
  await go(page, "/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByLabel("Koʻrinadigan ism").fill("Test Foydalanuvchi");
  await page.getByLabel("Tugʻilgan yil").fill(String(birthYear));
  await page.locator("#acceptTerms").check();
  await page.getByRole("button", { name: "Hisob yaratish" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Koʻproq harakat").check();
  await page.getByLabel("Yaxshiroq uxlash").check();
  await page.getByRole("button", { name: "Sozlashni yakunlash" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe.configure({ mode: "serial" });

test("adult journey: habits, workout, sleep, learning, AI, food photo, export, delete", async ({ page }, info) => {
  const email = `adult-${info.project.name}-${Date.now()}@test.local`;
  await register(page, email, 1995);

  // Dashboard renders with starter habits created during onboarding
  await expect(page.getByRole("heading", { name: /Salom, Test/ })).toBeVisible();
  await page.getByRole("button", { name: /Bugun uchun bajarildi/ }).first().click();
  await expect(page.getByRole("button", { name: /Bugun uchun bekor qilish/ }).first()).toBeVisible();

  // Routine builder + log workout
  await go(page, "/fitness?minutes=15&level=BEGINNER&focus=full");
  await expect(page.getByText("Sizning tartibingiz")).toBeVisible();
  await page.getByRole("button", { name: "Saqlash" }).click();
  await expect(page.getByText("Mashgʻulot saqlandi.")).toBeVisible();

  // Sleep log
  await go(page, "/sleep");
  await page.getByRole("button", { name: "Saqlash" }).click();
  await expect(page.getByText("Uyqu qaydi saqlandi.")).toBeVisible();

  // Lesson + quiz
  await go(page, "/academy/movement-basics/why-move");
  await page.getByLabel("150–300 daqiqa").check();
  await page.getByLabel("Ha", { exact: true }).check();
  await page.getByRole("button", { name: "Javoblarni tekshirish" }).click();
  await expect(page.getByText("Natijangiz: 2 tadan 2 ta")).toBeVisible();
  await page.getByRole("button", { name: "Darsni tugatilgan deb belgilash" }).click();
  await expect(page.getByText("Tugatildi")).toBeVisible();

  // AI requires consent first
  await go(page, "/assistant");
  await expect(page.getByText("AI imkoniyatlari oʻchirilgan")).toBeVisible();
  await go(page, "/settings");
  await page.locator("#s-ai").check();
  await page.getByRole("button", { name: "Saqlash" }).first().click();
  await expect(page.getByText("Sozlamalar saqlandi.")).toBeVisible();

  // Chat through the real route (mock provider)
  await go(page, "/assistant");
  await page.getByLabel("Savol bering…").fill("Mashqdan oldin qanday qizdirilish kerak?");
  await page.getByRole("button", { name: "Yuborish" }).click();
  await expect(page.getByText(/MOCK ANSWER/)).toBeVisible();

  // Safety guardrail answers without the model
  await page.getByLabel("Savol bering…").fill("I want to stop eating to lose weight fast");
  await page.getByRole("button", { name: "Yuborish" }).click();
  await expect(page.getByText(/Qatʼiy cheklash/)).toBeVisible();

  // Food photo → estimate → edit portion → save
  await go(page, "/nutrition/scan");
  await page.locator("#food-photo").setInputFiles(path.join(__dirname, "fixtures-meal.jpg"));
  await page.getByRole("button", { name: "Rasmni tahlil qilish" }).click();
  await expect(page.getByRole("cell", { name: "Osh Aralash taom" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Taxminiy jami/ })).toContainText("565");
  await page.getByLabel("Porsiya (g): Osh").fill("150");
  await expect(page.getByRole("row", { name: /Taxminiy jami/ })).toContainText("295");
  await page.getByRole("button", { name: "Ovqat kundaligimga saqlash" }).click();
  await expect(page.getByText("Ovqat kundaligingizga saqlandi.")).toBeVisible();

  // Achievements were granted
  await go(page, "/achievements");
  await expect(page.getByText("Birinchi qadam")).toBeVisible();
  await expect(page.getByText(/Qoʻlga kiritildi:/).first()).toBeVisible();

  // Data export contains own data only
  const res = await page.request.get("/api/account/export");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.account.email).toBe(email);
  expect(JSON.stringify(json)).not.toContain("passwordHash");
  expect(json.account.mealLogs.length).toBe(1);

  // Language switch
  await go(page, "/dashboard");
  if (await page.locator("#locale-select").isVisible()) {
    await page.locator("#locale-select").selectOption("ru");
  } else {
    await page.getByText("Menyu").click();
    await page.locator("#locale-select-mobile").selectOption("ru");
  }
  await expect(page.getByRole("heading", { name: /Привет, Test/ })).toBeVisible();

  // Delete account
  await go(page, "/settings");
  await page.locator("#del-confirm").fill("DELETE");
  await page.locator("#del-pw").fill(password);
  await page.getByRole("button", { name: "Удалить аккаунт" }).click();
  await expect(page).toHaveURL(/\/$/);
  await go(page, "/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("teen accounts never see calorie numbers", async ({ page }, info) => {
  const year = new Date().getFullYear() - 15;
  await register(page, `teen-${info.project.name}-${Date.now()}@test.local`, year);
  await go(page, "/profile");
  await expect(page.getByText("Oʻsmir hisobi (maxfiylik himoyasi bilan)")).toBeVisible();
  await go(page, "/settings");
  await page.locator("#s-ai").check();
  await page.getByRole("button", { name: "Saqlash" }).first().click();
  await expect(page.getByText("Sozlamalar saqlandi.")).toBeVisible();
  await go(page, "/nutrition/scan");
  await page.locator("#food-photo").setInputFiles(path.join(__dirname, "fixtures-meal.jpg"));
  await page.getByRole("button", { name: "Rasmni tahlil qilish" }).click();
  await expect(page.getByRole("cell", { name: "Osh Aralash taom" })).toBeVisible();
  await expect(page.getByText("Energiya (kkal)")).toHaveCount(0);
  await expect(page.getByText("540")).toHaveCount(0);
});

test("security basics", async ({ page, request }) => {
  // Protected pages redirect anonymous users
  await go(page, "/admin");
  await expect(page).toHaveURL(/\/login/);
  // AI routes reject cross-origin and anonymous requests
  const cross = await request.post("/api/ai/chat", { headers: { origin: "https://evil.example" }, data: { message: "hi" } });
  expect(cross.status()).toBe(403);
  const anon = await request.get("/api/account/export");
  expect(anon.status()).toBe(401);
  // Security headers present
  const home = await request.get("/");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  // Wrong password gives a generic message
  await go(page, "/login");
  await page.getByLabel("Email").fill("nobody@test.local");
  await page.getByLabel("Parol", { exact: true }).fill("wrong-password-1");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page.getByText("Email yoki parol notoʻgʻri.")).toBeVisible();
});
