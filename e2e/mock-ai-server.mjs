// TEST-ONLY mock of an OpenAI-compatible API used by the Playwright suite.
// It lets end-to-end tests exercise the real AI routes (auth, consent, validation,
// safety guardrails, JSON parsing) without a paid API key. Never deploy it.
import http from "node:http";

const port = Number(process.env.MOCK_AI_PORT ?? 4010);
http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const j = JSON.parse(body || "{}");
      const hasImage = JSON.stringify(j.messages ?? []).includes("image_url");
      const content = hasImage
        ? JSON.stringify({
            isFood: true,
            items: [
              { name: "Osh", portionGrams: 300, kcal: 540, proteinG: 18, carbsG: 70, fatG: 20, foodGroup: "mixed", confidence: "medium" },
              { name: "Achichuk", portionGrams: 100, kcal: 25, proteinG: 1, carbsG: 5, fatG: 0.2, foodGroup: "vegetables", confidence: "high" },
            ],
            balanceNote: "Sabzavotlar qoʻshilgani yaxshi.",
          })
        : `MOCK ANSWER (model=${j.model})`;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { content } }] }));
    });
  })
  .listen(port, () => console.log(`mock AI listening on ${port}`));
