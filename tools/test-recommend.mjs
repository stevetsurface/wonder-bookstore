/* Local check of the bookseller prompt and validation, with and without a real API call.
   node tools/test-recommend.mjs            -> builds the prompt, validates a sample reply, no network
   ANTHROPIC_API_KEY=... node tools/test-recommend.mjs live   -> one real call */
import { SYSTEM_STATIC, PRODUCTS, validate, cleanMessages, ReplySchema } from "../lib/bookseller.js";
console.log(`catalogue: ${PRODUCTS.length} books, system prompt ~${Math.round(SYSTEM_STATIC.length / 4)} tokens`);
const sample = validate({ reply: "Try these.", picks: [{ id: 2, why: "short and warm" }, { id: 9999, why: "fake" }, { id: 2, why: "dup" }], persona: "The Quiet Reader", question: "" });
console.assert(sample.picks.length === 1 && sample.picks[0].title === "Tuesdays With Morrie", "validate should drop unknown and duplicate ids");
const msgs = cleanMessages([{ role: "assistant", content: "hi" }, { role: "user", content: "x" }, { role: "user", content: "y" }, { role: "assistant", content: "z" }]);
console.assert(msgs.length === 2 && msgs[0].role === "user", "cleanMessages should start with user and alternate");
console.log("validation ok");
if (process.argv[2] === "live") {
  const { default: handler } = await import("../api/recommend.js");
  const req = { method: "POST", headers: { origin: "http://localhost:8080" }, body: { lang: "en", messages: [{ role: "user", content: "Something calm for a weekend, I liked Before the Coffee Gets Cold, under 250k" }] } };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(o) { console.log(this.code, JSON.stringify(o, null, 2)); return this; }, end() {} };
  await handler(req, res);
}
