# The AI bookseller (Claude-powered chat on the finder page)

`api/recommend.js` is a Vercel serverless function that holds the Anthropic API key and answers the chat panel on `finder.html`. The browser never sees the key.

## How it works

- The catalogue (every book in `assets/products.js` plus its tags from `assets/tags.js`) is rendered into one stable system-prompt block with `cache_control` (1 hour TTL), so it is paid once per hour per warm instance rather than on every message.
- Model: `claude-opus-5-5`, `effort: "low"` (chat-sized replies), structured output through `client.messages.parse` with a Zod schema: `reply`, `picks[{id, why}]`, `persona`, `question`.
- Every returned id is checked against the catalogue in `lib/bookseller.js`; title, author, price, stock and cover shown to the customer come from our data, never from the model.
- Guardrails: 12-message window, 1,200 characters per message, 40 requests per 10 minutes per IP (per instance), CORS allow-list (`*.vercel.app`, the GitHub Pages site, `wonderstore.co.id`, localhost), refusal handling.
- Cost per 5-turn session at Opus 5.5 rates is a few US cents; the system prompt is about 2.7K tokens.

## Deploy on Vercel (one-time)

1. In Vercel: **Add New → Project → Import** `stevetsurface/wonder-bookstore`. Framework preset: *Other*. Root directory: `/`. No build command, output directory `.` (static files are served as-is; `api/` becomes a function automatically).
2. Project → **Settings → Environment Variables**: add `ANTHROPIC_API_KEY` for Production (and Preview if you want preview deployments to chat).
3. Deploy. The site is then served from Vercel with the chat working at `/api/recommend`.
4. If you keep GitHub Pages as the public site, set `window.WONDER_API_BASE = "https://<your-project>.vercel.app"` in a small script before `assets/chat.js` (or rename the Vercel project to `wonder-bookstore`, which the page already defaults to).

Every push to `main` redeploys.

## Test locally

```bash
npm install
node tools/test-recommend.mjs                       # prompt build + validation, no network
ANTHROPIC_API_KEY=sk-ant-... node tools/test-recommend.mjs live   # one real call
```

## Tuning

- Voice and rules: `SYSTEM_STATIC` in `lib/bookseller.js`.
- Book tags: `assets/tags.js` (shared with the quiz).
- Model or effort: `api/recommend.js`. To try Claude Haiku 5.5 for cost, change the model id and compare transcripts first.
- Transcripts are not stored anywhere today. If you add logging, decide retention and say so in the FAQ.
