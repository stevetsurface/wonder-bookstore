#!/usr/bin/env node
/* Export the catalogue to CSV files for OpenCart 4 import (via the admin "Import" of a CSV-import extension, or Kafi's migration script).
   Usage: node tools/export-opencart.mjs  -> opencart/products.csv, opencart/categories.csv */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "assets/products.js"), "utf8");
const data = JSON.parse(src.slice(src.indexOf("[") , src.lastIndexOf("]") + 1));

const CATEGORY_TREE = {
  "Fiction": ["Books", "Fiction"], "Romance": ["Books", "Fiction", "Romance"], "Sci-Fi & Fantasy": ["Books", "Fiction", "Sci-Fi & Fantasy"], "Mystery & Thriller": ["Books", "Fiction", "Mystery & Thriller"], "Young Adult": ["Books", "Fiction", "Young Adult"],
  "Self-Development": ["Books", "Non-Fiction", "Self-Development"], "Business": ["Books", "Non-Fiction", "Business & Economics"], "Psychology": ["Books", "Non-Fiction", "Psychology"], "Philosophy": ["Books", "Non-Fiction", "Philosophy"], "Memoir & Biography": ["Books", "Non-Fiction", "Memoir & Biography"], "Social Sciences": ["Books", "Non-Fiction", "Social Sciences"],
  "Children": ["Books", "Children"], "Comics & Manga": ["Books", "Comics & Manga"], "Education": ["Books", "Education & Reference", "Education"], "Reference": ["Books", "Education & Reference", "Reference"],
  "Gifts": ["Gifts & Stationery", "Gifts"], "Stationery": ["Gifts & Stationery", "Stationery"]
};
const csv = rows => rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";

// categories.csv: path, name_en, name_id, parent_path
const ID_NAMES = { "Books": "Buku", "Fiction": "Fiksi", "Romance": "Romance", "Sci-Fi & Fantasy": "Sci-Fi & Fantasi", "Mystery & Thriller": "Misteri & Thriller", "Young Adult": "Young Adult", "Non-Fiction": "Non-Fiksi", "Self-Development": "Pengembangan Diri", "Business & Economics": "Bisnis & Ekonomi", "Psychology": "Psikologi", "Philosophy": "Filsafat", "Memoir & Biography": "Memoar & Biografi", "Social Sciences": "Ilmu Sosial", "Children": "Anak", "Comics & Manga": "Komik & Manga", "Education & Reference": "Edukasi & Referensi", "Education": "Edukasi", "Reference": "Referensi", "Gifts & Stationery": "Hadiah & Alat Tulis", "Gifts": "Hadiah", "Stationery": "Alat Tulis" };
const paths = new Set();
Object.values(CATEGORY_TREE).forEach(p => p.forEach((_, i) => paths.add(p.slice(0, i + 1).join(" > "))));
const catRows = [["category_path", "name_en", "name_id", "parent_path", "seo_keyword"]];
[...paths].sort().forEach(p => { const parts = p.split(" > "); const name = parts[parts.length - 1]; catRows.push([p, name, ID_NAMES[name] || name, parts.slice(0, -1).join(" > "), name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")]); });
fs.writeFileSync(path.join(root, "opencart/categories.csv"), csv(catRows));

// products.csv: one row per product, OpenCart 4 product + description fields
const prodRows = [["model", "sku", "isbn", "name_en", "name_id", "description_en", "description_id", "meta_title", "price", "quantity", "status", "manufacturer", "category_path", "image", "tag", "weight_grams", "author", "publisher", "units_sold_last_month"]];
data.forEach(p => {
  const cat = CATEGORY_TREE[p.category] || ["Books"];
  const descEn = p.type === "Books" ? `${p.title} by ${p.author}. Published by ${p.publisher}.${p.isbn ? " ISBN " + p.isbn + "." : ""}` : `${p.title} by ${p.author}.`;
  const descId = p.type === "Books" ? `${p.title} karya ${p.author}. Diterbitkan oleh ${p.publisher}.${p.isbn ? " ISBN " + p.isbn + "." : ""}` : `${p.title} dari ${p.author}.`;
  prodRows.push([
    p.isbn || `WB-${String(p.id).padStart(5, "0")}`, p.isbn || `WB-${String(p.id).padStart(5, "0")}`, p.isbn || "",
    p.title, p.title, descEn, descId, `${p.title} – Wonder Bookstore`,
    p.price, p.inStock ? 1 : 0, 1, p.brand || p.publisher, cat.join(" > "),
    p.cover ? p.cover.replace("assets/covers/", "catalog/covers/") : "", `${p.category}${p.type === "Books" ? ", " + p.author : ""}`,
    p.type === "Books" ? 350 : 200, p.author, p.publisher, p.sold
  ]);
});
fs.writeFileSync(path.join(root, "opencart/products.csv"), csv(prodRows));
console.log(`wrote ${prodRows.length - 1} products and ${catRows.length - 1} categories to opencart/`);
