import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OpenAICompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { parseFoodAnalysis } from "@/lib/ai/food";

let server: Server;
let base = "";
const seen: Record<string, unknown>[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const json = JSON.parse(body);
      seen.push(json);
      res.setHeader("content-type", "application/json");
      if (json.reasoning_effort) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: { message: "reasoning_effort not supported" } }));
      }
      if (json.model === "quota") {
        res.statusCode = 429;
        return res.end("{}");
      }
      // Gemini-style answer: fenced JSON, string numbers, unknown food group.
      const content = '```json\n{"isFood": true, "items": [{"name": "Somsa", "portionGrams": "150", "kcal": "420", "proteinG": 12, "carbsG": 45.55, "fatG": 20, "foodGroup": "bakery", "confidence": "High"}], "balanceNote": "Add a salad."}\n```';
      res.end(JSON.stringify({ choices: [{ message: { content }, finish_reason: "stop" }] }));
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

describe("OpenAI-compatible provider (Gemini-style)", () => {
  it("retries without optional params on 400 and parses fenced, loosely-typed JSON", async () => {
    const p = new OpenAICompatibleProvider({ apiKey: "k", model: "gemini-2.5-flash", visionModel: "gemini-2.5-flash", baseUrl: base + "/", reasoningEffort: "none" });
    const raw = await p.complete({ system: "s", messages: [{ role: "user", content: "x" }], image: { mediaType: "image/jpeg", base64: "AAAA" }, json: true });
    expect(seen.at(-2)).toMatchObject({ reasoning_effort: "none", response_format: { type: "json_object" } });
    expect(seen.at(-1)?.reasoning_effort).toBeUndefined();
    const a = parseFoodAnalysis(raw);
    expect(a.isFood).toBe(true);
    expect(a.items[0]).toMatchObject({ name: "Somsa", portionGrams: 150, kcal: 420, carbsG: 45.6, foodGroup: "grains", confidence: "high" });
  });

  it("reports the provider status code", async () => {
    const p = new OpenAICompatibleProvider({ apiKey: "k", model: "quota", visionModel: "quota", baseUrl: base });
    await expect(p.complete({ system: "s", messages: [{ role: "user", content: "x" }] })).rejects.toMatchObject({ status: 429 });
  });
});
