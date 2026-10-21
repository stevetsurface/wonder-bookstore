/* Vercel serverless function: the AI bookseller. POST { messages:[{role, content}], lang } -> { reply, picks, persona, question }
   Needs ANTHROPIC_API_KEY in the Vercel project environment. */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { SYSTEM_STATIC, ReplySchema, validate, cleanMessages } from "../lib/bookseller.js";

const ALLOWED_ORIGINS = [/\.vercel\.app$/, /^https:\/\/stevetsurface\.github\.io$/, /^https?:\/\/localhost(:\d+)?$/, /wonderstore\.co\.id$/];
const client = new Anthropic();
const hits = new Map(); // per-instance rate limit: ip -> [timestamps]
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, max = 40;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.some(r => r.test(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "The bookseller is not configured yet (missing API key)." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "?";
  if (limited(ip)) return res.status(429).json({ error: "Too many messages, please try again in a few minutes." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const messages = cleanMessages(body.messages);
  if (!messages.length) return res.status(400).json({ error: "Say something first." });
  const lang = body.lang === "id" ? "Bahasa Indonesia" : "English";

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 1500,
      output_config: { effort: "low", format: zodOutputFormat(ReplySchema) },
      system: [
        { type: "text", text: SYSTEM_STATIC, cache_control: { type: "ephemeral", ttl: "1h" } },
        { type: "text", text: `The site is currently shown in ${lang}.` }
      ],
      messages
    });
    if (response.stop_reason === "refusal") {
      return res.status(200).json(validate({ reply: lang === "English" ? "I can only help with books, gifts and our stores. What are you in the mood to read?" : "Saya hanya bisa membantu soal buku, hadiah, dan toko kami. Mau baca apa hari ini?", picks: [], persona: "", question: "" }));
    }
    if (!response.parsed_output) return res.status(502).json({ error: "The bookseller gave an unreadable answer, please try again." });
    const out = validate(response.parsed_output);
    out.usage = { in: response.usage.input_tokens, cached: response.usage.cache_read_input_tokens, out: response.usage.output_tokens };
    return res.status(200).json(out);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "The bookseller is busy, try again in a moment." });
    if (err instanceof Anthropic.APIConnectionError) return res.status(502).json({ error: "Could not reach the bookseller." });
    if (err instanceof Anthropic.APIError) { console.error("anthropic", err.status, err.message); return res.status(502).json({ error: "The bookseller hit a problem." }); }
    console.error(err);
    return res.status(500).json({ error: "Unexpected error." });
  }
}
