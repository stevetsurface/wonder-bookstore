#!/usr/bin/env node
/* Pull items, prices and stock from Jubelio and rewrite assets/products.js.
   Usage: JUBELIO_EMAIL=... JUBELIO_PASSWORD=... node tools/sync-jubelio.mjs
   Jubelio API docs: https://developer.jubelio.com (endpoint paths and field names below must be checked against the
   current docs; they are configurable here on purpose). Runs on a schedule from .github/workflows/sync-jubelio.yml. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CFG = {
  base: process.env.JUBELIO_BASE || "https://api2.jubelio.com",
  login: "/login",                                   // POST {email, password} -> {token}
  items: "/inventory/items/",                        // GET ?page=&pageSize= -> {data:[{item_group_id, item_name, product_skus:[...]}]}
  pageSize: 200,
  // field mapping per SKU; adjust to the shape your account returns
  map: {
    sku: s => s.item_code || s.sku, title: g => g.item_name, price: s => Number(s.sell_price || s.price || 0),
    stock: s => Number(s.available_qty ?? s.stock ?? 0), isbn: s => (s.barcode || "").replace(/\D/g, ""),
    author: g => (g.description || "").match(/Author:\s*([^\n;]+)/i)?.[1]?.trim() || "", publisher: g => g.brand || g.supplier_name || "",
    category: g => g.category_name || "Fiction"
  }
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const existing = (() => { const s = fs.readFileSync(path.join(root, "assets/products.js"), "utf8"); return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1)); })();
const byIsbn = new Map(existing.filter(p => p.isbn).map(p => [p.isbn, p]));
const byTitle = new Map(existing.map(p => [p.title.toLowerCase(), p]));

async function api(pathname, opts = {}, token) {
  const res = await fetch(CFG.base + pathname, { ...opts, headers: { "Content-Type": "application/json", ...(token ? { authorization: token } : {}), ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`${pathname} -> ${res.status} ${await res.text()}`);
  return res.json();
}
async function main() {
  const { JUBELIO_EMAIL: email, JUBELIO_PASSWORD: password } = process.env;
  if (!email || !password) { console.error("Set JUBELIO_EMAIL and JUBELIO_PASSWORD"); process.exit(1); }
  const { token } = await api(CFG.login, { method: "POST", body: JSON.stringify({ email, password }) });
  const groups = [];
  for (let page = 1; ; page++) {
    const res = await api(`${CFG.items}?page=${page}&pageSize=${CFG.pageSize}`, {}, token);
    const data = res.data || res.items || [];
    groups.push(...data);
    if (data.length < CFG.pageSize) break;
  }
  let id = 1, updated = 0, added = 0;
  const out = [];
  for (const g of groups) {
    const skus = g.product_skus || g.variants || [g];
    for (const s of skus) {
      const isbn = CFG.map.isbn(s), title = CFG.map.title(g) || s.item_name || "";
      const prev = (isbn && byIsbn.get(isbn)) || byTitle.get(title.toLowerCase());
      const row = {
        id: id++, type: prev?.type || "Books", category: prev?.category || CFG.map.category(g), title: prev?.title || title,
        author: prev?.author || CFG.map.author(g), publisher: prev?.publisher || CFG.map.publisher(g),
        price: CFG.map.price(s) || prev?.price || 0, sold: prev?.sold || 0, inStock: CFG.map.stock(s) > 0, stock: CFG.map.stock(s),
        isbn: isbn || prev?.isbn || "", sku: CFG.map.sku(s) || "", cover: prev?.cover || ""
      };
      prev ? updated++ : added++;
      out.push(row);
    }
  }
  if (!out.length) { console.error("Jubelio returned no items; keeping the existing file."); process.exit(2); }
  const header = `/* Catalogue data. Synced from Jubelio ${new Date().toISOString()} (${updated} updated, ${added} new). Sales counts are kept from the last manual import. */\nwindow.PRODUCT_DATA = `;
  fs.writeFileSync(path.join(root, "assets/products.js"), header + JSON.stringify(out, null, 0) + ";\n");
  console.log(`synced ${out.length} items (${updated} matched, ${added} new)`);
}
main().catch(e => { console.error(e); process.exit(1); });
