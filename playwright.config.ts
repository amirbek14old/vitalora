import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * End-to-end tests run against a production build with a test database and a mock AI provider.
 *   1. createdb vitalora_test && DATABASE_URL=... npx prisma migrate deploy && npm run db:seed
 *   2. npm run build
 *   3. npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", locale: "uz-UZ" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_EXTERNAL_SERVER
    ? undefined
    : [
        { command: "node e2e/mock-ai-server.mjs", port: 4010, reuseExistingServer: true },
        {
          command: `next start -p ${PORT}`,
          port: PORT,
          reuseExistingServer: true,
          env: { AI_PROVIDER: "openai", AI_API_KEY: "test", AI_MODEL: "mock-text", AI_VISION_MODEL: "mock-vision", AI_BASE_URL: "http://127.0.0.1:4010" },
        },
      ],
});
