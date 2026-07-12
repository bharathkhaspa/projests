// SnapScan API server — receives a receipt photo, returns structured expense JSON.
// Keeps the Anthropic API key server-side (never ship it inside the mobile app).
import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-4-8";
const PORT = process.env.PORT ?? 3900;

const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    is_receipt: {
      type: "boolean",
      description: "false if the image is not a receipt/bill/invoice",
    },
    merchant: { type: "string", description: "Store or business name, empty string if unknown" },
    date: { type: "string", description: "Receipt date as YYYY-MM-DD, empty string if not visible" },
    currency: { type: "string", description: "ISO currency code, e.g. INR, USD. Empty if unknown." },
    total: { anyOf: [{ type: "number" }, { type: "null" }], description: "Grand total paid" },
    tax: { anyOf: [{ type: "number" }, { type: "null" }], description: "Total tax/GST if shown" },
    category: {
      type: "string",
      enum: ["food", "groceries", "transport", "shopping", "utilities", "entertainment", "health", "other"],
    },
    items: {
      type: "array",
      description: "Line items if legible; empty array otherwise",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { anyOf: [{ type: "number" }, { type: "null" }] },
          price: { anyOf: [{ type: "number" }, { type: "null" }] },
        },
        required: ["name", "quantity", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["is_receipt", "merchant", "date", "currency", "total", "tax", "category", "items"],
  additionalProperties: false,
};

const app = express();
app.use(express.json({ limit: "25mb" }));

// CORS — allows the Expo web build (different port) to call this server
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true, model: MODEL }));

app.post("/scan", async (req, res) => {
  const { imageBase64, mediaType = "image/jpeg" } = req.body ?? {};
  if (!imageBase64) return res.status(400).json({ error: "imageBase64 is required" });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system:
        "You extract structured expense data from photos of receipts and bills. " +
        "Read carefully, including faded or skewed text. Amounts must be numbers " +
        "without currency symbols. If a field is not visible, use null or an empty string.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            { type: "text", text: "Extract this receipt. If it is not a receipt, set is_receipt to false." },
          ],
        },
      ],
      output_config: { format: { type: "json_schema", schema: RECEIPT_SCHEMA } },
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
    res.json({
      expense: JSON.parse(text),
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Rate limited, try again shortly." });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `Claude API error: ${err.message}` });
    }
    console.error(err);
    res.status(500).json({ error: "Scan failed." });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`SnapScan server on http://0.0.0.0:${PORT} (model: ${MODEL})`)
);
