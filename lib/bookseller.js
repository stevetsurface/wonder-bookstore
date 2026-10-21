/* Catalogue, prompt and validation for the AI bookseller. Shared by api/recommend.js and tools/test-recommend.mjs. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function loadScriptGlobal(file, name) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const g = {}; const fn = new Function("window", "globalThis", src + `\n;return (typeof window !== "undefined" ? window : globalThis)["${name}"];`);
  return fn(g, g);
}
export const PRODUCTS = loadScriptGlobal("assets/products.js", "PRODUCT_DATA").filter(p => p.type === "Books" && ![95, 96, 97, 98, 99].includes(p.id));
const TAGS = loadScriptGlobal("assets/tags.js", "BOOK_TAGS");
const tagsOf = p => Object.entries(TAGS).filter(([k, set]) => k !== "skip" && set.has(p.id)).map(([k]) => k);
export const BY_ID = new Map(PRODUCTS.map(p => [p.id, p]));

/* Compact catalogue line per book. Stable ordering so the cached prefix never changes between requests. */
export const CATALOGUE_TEXT = PRODUCTS.slice().sort((a, b) => a.id - b.id).map(p =>
  `${p.id}|${p.title}|${p.author}|${p.category}|${p.publisher}|Rp${Math.round(p.price / 1000)}k|${p.inStock ? "in" : "req"}|sold${p.sold}|${tagsOf(p).join(",")}`
).join("\n");

export const SYSTEM_STATIC = `You are the bookseller at Wonder Bookstore, an English-language lifestyle bookstore with six stores in Jakarta and Bali (Hublife, Ashta District 8, Pondok Indah Mall 5, TSM Cibubur, Berawa, TSM Bali) and Wonder Coffee at Ashta and Berawa. Warm, direct, knowledgeable; two or three sentences per reply, never a lecture. Reply in the customer's language (Bahasa Indonesia or English); if they mix, follow their last message.

Rules:
- Recommend ONLY books from the catalogue below, by id. Never invent titles, prices, stock or store-specific availability. "in" means in stock somewhere in the chain; "req" means on request (say it can be ordered, with a wait).
- Ask at most one short clarifying question when the request is too vague to pick; otherwise recommend 2 to 5 books with a specific one-line reason each that connects to what the customer said.
- Prefer bestsellers (sold count) when choices are otherwise equal. Respect any budget the customer states (prices are in thousands of rupiah).
- For children, match the age band tag (kid0 = 0-4, kid5 = 5-8, kid9 = 9-12, teen).
- If asked something unrelated to books, gifts or the stores, answer in one sentence and steer back.
- Set persona to a short, friendly reading-personality label for this customer once you have enough to go on, otherwise an empty string.

Catalogue format: id|title|author|category|publisher|price|stock|sold|tags
Tags: grow (habits, focus), money, calm, heart (love, loss), think (ideas, history), escape (fiction), laugh, short (under a weekend), long (big book), classic, gift (good to give), kid0, kid5, kid9, teen.

Catalogue:
${CATALOGUE_TEXT}`;

export const ReplySchema = z.object({
  reply: z.string().describe("The bookseller's message to the customer, 1-3 short sentences, in the customer's language."),
  picks: z.array(z.object({
    id: z.number().int().describe("Catalogue id"),
    why: z.string().describe("One line, in the customer's language, tied to what they said.")
  })).max(5),
  persona: z.string().describe("Short reading-personality label or empty string."),
  question: z.string().describe("A single clarifying question, or empty string.")
});

/* Keep only ids that exist; attach catalogue data so the front end never trusts model text for prices. */
export function validate(parsed) {
  const seen = new Set();
  const picks = (parsed.picks || []).filter(x => BY_ID.has(x.id) && !seen.has(x.id) && seen.add(x.id)).slice(0, 5).map(x => {
    const p = BY_ID.get(x.id);
    return { id: p.id, title: p.title, author: p.author, category: p.category, publisher: p.publisher, price: p.price, inStock: p.inStock, cover: p.cover || "", why: String(x.why || "").slice(0, 200) };
  });
  return { reply: String(parsed.reply || "").slice(0, 600), picks, persona: String(parsed.persona || "").slice(0, 60), question: String(parsed.question || "").slice(0, 200) };
}

/* Trim and sanitise the conversation the browser sends. */
export function cleanMessages(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const m of input.slice(-12)) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const text = String(m.content || "").slice(0, 1200).trim();
    if (!text) continue;
    if (out.length && out[out.length - 1].role === m.role) continue; // must alternate
    out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}
