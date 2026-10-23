#!/usr/bin/env node
/* Stamp every local CSS/JS reference in the HTML pages with ?v=<timestamp> so browsers and GitHub Pages
   pick up new assets immediately after a deploy. Run before committing: node tools/bump-assets.mjs */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const v = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
let n = 0;
for (const f of fs.readdirSync(root).filter(f => f.endsWith(".html"))) {
  const p = path.join(root, f);
  const before = fs.readFileSync(p, "utf8");
  const after = before.replace(/(href|src)="(assets\/[^"?]+\.(css|js))(\?v=[^"]*)?"/g, `$1="$2?v=${v}"`);
  if (after !== before) { fs.writeFileSync(p, after); n++; }
}
console.log(`stamped ${n} pages with v=${v}`);
