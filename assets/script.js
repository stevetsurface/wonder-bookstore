/* Wonder Bookstore — catalogue, bag, filters, views, language */

const BRAND_OF = {
  "Penguin Random House": ["PRH", "PRH UK", "PRH US", "Penguin", "Penguin UK", "Random House", "Avery", "Portfolio", "Vintage", "Crown", "Signet", "Hogarth", "Doubleday", "Viking", "Ace", "Ladybird"],
  "HarperCollins": ["Harper", "Harper Collins", "HarperCollins", "HarperVoyager", "Harper Voyager", "Harper Perennial", "Harper Collins UK"],
  "Hachette": ["Hachette", "Little Brown", "Hodder Education", "Hodder"],
  "Simon & Schuster": ["Simon & Schuster"],
  "Macmillan": ["Macmillan", "St. Martin's", "FSG", "Celadon", "Campbell"],
  "Bloomsbury": ["Bloomsbury", "Bloomsbury UK"],
  "Scholastic": ["Scholastic", "Scholastic MY"],
  "Wordsworth Classics": ["Wordsworth"],
  "Kikkerland": ["Kikkerland"], "IF": ["IF"]
};
function brandOf(pub) { for (const [b, list] of Object.entries(BRAND_OF)) if (list.includes(pub)) return b; return pub; }
const PRODUCTS = (window.PRODUCT_DATA || []).map(p => Object.assign({}, p, { brand: brandOf(p.publisher) }));
const TYPES = ["All", "Books", "Gifts", "Stationery"];
const TOP_N = 5;
const BEST_RANK = {};
PRODUCTS.filter(p => p.type === "Books").sort((a, b) => b.sold - a.sold).slice(0, TOP_N).forEach((p, i) => { BEST_RANK[p.id] = i + 1; });
/* Store favourites: the top seller in each category last month */
const CAT_LEADER = {};
PRODUCTS.filter(p => p.type === "Books" && p.sold > 0).forEach(p => { if (!CAT_LEADER[p.category] || CAT_LEADER[p.category].sold < p.sold) CAT_LEADER[p.category] = p; });
Object.values(CAT_LEADER).forEach(p => { p.pick = true; });

/* ---------- Language ---------- */
const LANG_KEY = "wonder-lang";
let LANG = "en";
try { LANG = localStorage.getItem(LANG_KEY) || ((navigator.language || "").toLowerCase().startsWith("id") ? "id" : "en"); } catch {}

const UI = {
  "Add": "Tambah", "Quick add ↗": "Tambah cepat ↗", "Bestseller": "Terlaris", "BEST SELLER #": "TERLARIS #", "Staff pick": "Pilihan staf",
  "Gift idea": "Ide hadiah", "New": "Baru", "Hardcover": "Hardcover", "Paperback": "Paperback",
  "bought in the last 24 hours": "dibeli dalam 24 jam terakhir", "Recommended by the": "Rekomendasi tim", "team": "",
  "All": "Semua", "Books": "Buku", "Gifts": "Hadiah", "Stationery": "Alat tulis",
  "Fiction": "Fiksi", "Classics": "Klasik", "Business": "Bisnis", "Self-Development": "Pengembangan diri", "Children": "Anak",
  "All titles": "Semua judul", "Bestsellers": "Terlaris", "Staff picks": "Pilihan staf", "New arrivals": "Baru datang",
  "Grid": "Grid", "List": "Daftar", "Compact": "Ringkas",
  "item": "produk", "items": "produk", "Nothing matches that search.": "Tidak ada yang cocok dengan pencarian itu.",
  "Your bag is empty.": "Tas Anda masih kosong.", "Browse the shop ↗": "Lihat toko ↗", "Subtotal": "Subtotal", "Checkout ↗": "Checkout ↗",
  "View bag": "Lihat tas", "Remove": "Hapus", "Added to your bag —": "Masuk ke tas —",
  "Checkout coming soon —": "Checkout segera hadir —", "Thanks — we'll be in touch.": "Terima kasih — kami akan menghubungi Anda.",
  "Sort: Featured": "Urutkan: Unggulan", "Best selling": "Terlaris", "Price: low to high": "Harga: rendah ke tinggi", "Price: high to low": "Harga: tinggi ke rendah", "Title A–Z": "Judul A–Z",
  "Trending in store": "Sedang ramai di toko", "Just bought": "Baru saja dibeli", "in": "di", "min ago": "menit lalu",
  "Only a few left": "Stok tinggal sedikit", "In stock": "Stok tersedia", "On request": "Bisa dipesan",
  "Store favourites": "Favorit toko", "Store favourite": "Favorit toko", "sold last month": "terjual bulan lalu", "#1 in": "#1 di", "last month": "bulan lalu",
  "Top sellers last month": "Terlaris bulan lalu", "Brands": "Brand", "All brands": "Semua brand", "Brand:": "Brand:",
  "Romance": "Romance", "Sci-Fi & Fantasy": "Sci-Fi & Fantasi", "Mystery & Thriller": "Misteri & Thriller", "Young Adult": "Young Adult", "Psychology": "Psikologi",
  "Philosophy": "Filsafat", "Memoir & Biography": "Memoar & Biografi", "Social Sciences": "Ilmu Sosial", "Comics & Manga": "Komik & Manga", "Education": "Edukasi", "Reference": "Referensi",
  "ISBN": "ISBN", "Publisher": "Penerbit"
};
function t(s) { return LANG === "id" && UI[s] !== undefined ? UI[s] : s; }
function catLabel(c) { return t(c); }

/* Static page text: swap innerHTML of elements whose English matches the dictionary (assets/i18n.js) */
function applyI18n() {
  const dict = window.PAGE_I18N || {};
  const INL = ["BR", "SPAN", "SMALL", "STRONG", "I", "EM", "B", "IMG"];
  document.querySelectorAll("[data-en]").forEach(el => { el.innerHTML = el.dataset.en; });
  if (LANG === "id") {
    document.querySelectorAll("body *").forEach(el => {
      if (el.closest("[data-featured],[data-gifts],[data-shop-grid],[data-cart-items],[data-mini-cart],[data-trending],[data-tabs],[data-chips],[data-results],script,style")) return;
      if (!el.textContent.trim() || el.tagName === "IMG") return;
      if (![...el.children].every(c => INL.includes(c.tagName))) return;
      const k = el.innerHTML.trim().replace(/\s+/g, " ");
      if (dict[k]) { if (!el.dataset.en) el.dataset.en = el.innerHTML; el.innerHTML = dict[k]; }
    });
    document.querySelectorAll("input[placeholder]").forEach(i => { const k = "PH:" + (i.dataset.enPh || i.placeholder); if (!i.dataset.enPh) i.dataset.enPh = i.placeholder; if (dict[k]) i.placeholder = dict[k]; });
    const tk = "TITLE:" + (document.documentElement.dataset.enTitle || document.title);
    if (!document.documentElement.dataset.enTitle) document.documentElement.dataset.enTitle = document.title;
    if (dict[tk]) document.title = dict[tk];
  } else {
    document.querySelectorAll("input[data-en-ph]").forEach(i => { i.placeholder = i.dataset.enPh; });
    if (document.documentElement.dataset.enTitle) document.title = document.documentElement.dataset.enTitle;
  }
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("active", b.dataset.lang === LANG));
}
const RERENDER = [];
function setLang(l) {
  LANG = l;
  try { localStorage.setItem(LANG_KEY, l); } catch {}
  applyI18n();
  RERENDER.forEach(fn => fn());
}

/* ---------- Money ---------- */
function money(n) { return "Rp " + n.toLocaleString("id-ID"); }
function stars(r) { const n = Math.round(r); return "★".repeat(n) + "☆".repeat(5 - n) + " " + r.toFixed(1); }

/* ---------- Bag (localStorage) ---------- */
const Cart = {
  key: "wonder-bag",
  items: [],
  load() { try { this.items = JSON.parse(localStorage.getItem(this.key)) || []; } catch { this.items = []; } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch {} this.render(); },
  add(id) {
    const existing = this.items.find(i => i.id === id);
    if (existing) existing.qty += 1; else this.items.push({ id, qty: 1 });
    this.save();
    showToast(t("Added to your bag —") + " " + PRODUCTS.find(p => p.id === id).title);
  },
  setQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    this.save();
  },
  remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); },
  count() { return this.items.reduce((n, i) => n + i.qty, 0); },
  total() { return this.items.reduce((s, i) => s + i.qty * PRODUCTS.find(p => p.id === i.id).price, 0); },
  lines() {
    return this.items.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return `
        <div class="cart-item">
          ${p.cover ? `<div class="mini has-img"><img src="${p.cover}" alt=""></div>` : `<div class="mini" style="background:${colorOf(p)}"></div>`}
          <div>
            <h4>${p.title}</h4>
            <div class="author">${p.author}</div>
            <div class="qty">
              <button data-qty="-1" data-id="${p.id}" aria-label="Decrease">−</button>
              <span>${i.qty}</span>
              <button data-qty="1" data-id="${p.id}" aria-label="Increase">+</button>
            </div>
            <button class="remove" data-remove="${p.id}">${t("Remove")}</button>
          </div>
          <div class="price">${money(p.price * i.qty)}</div>
        </div>`;
    }).join("");
  },
  render() {
    document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = this.count());
    const empty = `<div class="empty"><p>${t("Your bag is empty.")}</p><a class="btn btn-dark btn-sm" href="shop.html">${t("Browse the shop ↗")}</a></div>`;
    const body = document.querySelector("[data-cart-items]");
    if (body) body.innerHTML = this.items.length ? this.lines() : empty;
    const mini = document.querySelector("[data-mini-cart]");
    if (mini) mini.innerHTML = this.items.length
      ? `<div class="mini-lines">${this.lines()}</div>
         <div class="mini-foot"><div class="total-row"><span>${t("Subtotal")}</span><span>${money(this.total())}</span></div>
         <div class="mini-actions"><button class="btn btn-dark btn-sm" data-open-cart>${t("View bag")} ↗</button><button class="btn btn-sm wa" data-checkout>${t("Checkout ↗")}</button></div></div>`
      : empty;
    document.querySelectorAll("[data-cart-total]").forEach(el => el.textContent = money(this.total()));
    document.querySelectorAll("[data-checkout]").forEach(el => el.disabled = this.items.length === 0);
    document.querySelectorAll("[data-sub-label]").forEach(el => el.textContent = t("Subtotal"));
  }
};

/* ---------- Cards ---------- */
function rankPill(p) { return BEST_RANK[p.id] ? `<span class="rank">${t("BEST SELLER #")}${BEST_RANK[p.id]}</span>` : ""; }
const PALETTE = ["#1f3b73", "#3e7a5a", "#b07a12", "#2e5f8a", "#9c4f7a", "#6b4fa0", "#c2402f", "#2a1640", "#5b2a86", "#b0476a"];
function colorOf(p) { return p.color || PALETTE[p.id % PALETTE.length]; }
function coverBadge(p) {
  if (p.pick) return `<span class="badge">${t("Store favourite")}</span>`;
  if (p.type !== "Books") return `<span class="badge">${t("Gift idea")}</span>`;
  return "";
}
function proof(p) {
  const rows = [];
  if (p.sold > 0) rows.push(`<span class="proof hot"><i></i>${p.sold} ${t("sold last month")}</span>`);
  if (p.pick) rows.push(`<span class="proof"><i></i>${t("#1 in")} ${t(p.category)} ${t("last month")}</span>`);
  return rows.length ? `<div class="proof-row">${rows.join("")}</div>` : "";
}
function stockLabel(p) { return `<span class="format ${p.inStock ? "in" : "req"}">${t(p.inStock ? "In stock" : "On request")}</span>`; }
function coverBlock(p, cls = "") {
  const isBook = p.type === "Books";
  if (p.cover) return `
    <div class="cover has-img ${cls}">
      <img src="${p.cover}" alt="${p.title}" loading="lazy">
      ${coverBadge(p)}
      <div class="quick-add"><button class="btn btn-sm" data-add="${p.id}">${t("Quick add ↗")}</button></div>
    </div>`;
  return `
    <div class="cover ${p.light ? "light" : ""} ${cls}" style="background:${colorOf(p)}">
      ${!isBook ? `<span class="brand-tag">${p.author}</span>` : ""}
      ${coverBadge(p)}
      <div class="cover-title">${p.title}</div>
      ${isBook ? `<div class="cover-author">${p.author}</div>` : ""}
      <div class="quick-add"><button class="btn btn-sm" data-add="${p.id}">${t("Quick add ↗")}</button></div>
    </div>`;
}
function thumbBlock(p) {
  if (p.cover) return `<div class="thumb has-img"><img src="${p.cover}" alt="" loading="lazy"></div>`;
  return `<div class="thumb ${p.light ? "light" : ""}" style="background:${colorOf(p)}"><span>${p.title}</span></div>`;
}
function productCard(p) {
  return `
    <article class="book-card">
      ${coverBlock(p)}
      <div class="book-body">
        <div class="cat-row"><span class="cat">${catLabel(p.category)}</span>${rankPill(p)}</div>
        <h3>${p.title}</h3>
        <span class="author">${p.author}</span>
        <div class="meta-row"><span class="pub">${p.publisher}</span>${stockLabel(p)}</div>
        ${moodChips(p, 2)}
        ${proof(p)}
        <div class="book-foot">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-dark btn-sm" data-add="${p.id}">${t("Add")}</button>
        </div>
      </div>
    </article>`;
}
function productRow(p) {
  return `
    <article class="book-row">
      ${thumbBlock(p)}
      <div class="row-main">
        <div class="row-title"><h3>${p.title}</h3>${rankPill(p)}${coverBadge(p)}</div>
        <div class="row-sub">${p.author} · ${p.publisher} · ${catLabel(p.category)}</div>
        ${moodChips(p, 4)}
        <div class="meta-row">${p.isbn ? `<span class="pub">ISBN ${p.isbn}</span>` : "<span></span>"}${stockLabel(p)}</div>
        ${proof(p)}
      </div>
      <div class="row-side">
        <span class="price">${money(p.price)}</span>
        <button class="btn btn-dark btn-sm" data-add="${p.id}">${t("Add")}</button>
      </div>
    </article>`;
}
function productTile(p) {
  return `
    <article class="book-tile">
      ${coverBlock(p, "tile-cover")}
      <div class="tile-body"><div class="tile-title">${p.title}${rankPill(p)}</div><div class="tile-foot"><span class="price">${money(p.price)}</span><button class="btn btn-dark btn-sm" data-add="${p.id}">+</button></div></div>
    </article>`;
}
function trendingCard(p) {
  return `
    <div class="trend">
      ${thumbBlock(p)}
      <div class="trend-body">
        <div class="trend-title">${p.title}</div>
        <div class="trend-proof">${p.sold} ${t("sold last month")}</div>
        <div class="trend-price">${money(p.price)}</div>
      </div>
      <button class="trend-add" data-add="${p.id}" aria-label="Add">+</button>
    </div>`;
}
function renderTrending() {
  document.querySelectorAll("[data-trending]").forEach(box => {
    const top = PRODUCTS.filter(p => p.type === "Books").sort((a, b) => b.sold - a.sold).slice(0, 10);
    const recent = top.slice(0, 4).map(p => `<span>${p.title} <em>· ${p.sold}</em></span>`).join("");
    box.innerHTML = `
      <div class="trend-head"><h3><span class="tr-ic">↗</span> ${t("Trending in store")}</h3><span class="muted">${LANG === "id" ? "Paling banyak terjual bulan lalu" : "Most sold last month"}</span></div>
      <div class="rail-wrap" data-rail-wrap>
        <div class="rail trend-rail">${top.map(trendingCard).join("")}</div>
        <div class="progress"><span></span></div>
      </div>
      <div class="just-bought"><strong><i></i>${t("Top sellers last month")}</strong>${recent}</div>`;
  });
  initRails();
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- Shop page ---------- */
function initShop() {
  const grid = document.querySelector("[data-shop-grid]");
  if (!grid) return;
  const tabs = document.querySelector("[data-tabs]");
  const colTabs = document.querySelector("[data-collection]");
  const chips = document.querySelector("[data-chips]");
  const search = document.querySelector("[data-search]");
  const sort = document.querySelector("[data-sort]");
  const count = document.querySelector("[data-results]");
  const views = document.querySelector("[data-views]");
  const params = new URLSearchParams(location.search);
  let type = TYPES.includes(params.get("type")) ? params.get("type") : "All";
  let category = params.get("cat") || "All";
  let collection = params.get("col") || "all";
  const mood = params.get("mood") || "";
  let view = "grid";
  try { view = localStorage.getItem("wonder-view") || "grid"; } catch {}
  if (params.get("q")) search.value = params.get("q");

  const COLLECTIONS = [["all", "All titles"], ["best", "Bestsellers"], ["picks", "Store favourites"], ["stock", "In stock"]];
  const brandSel = document.querySelector("[data-brand]");
  let brand = params.get("brand") || "All";
  const VIEWS = [["grid", "Grid", "▦"], ["list", "List", "☰"], ["compact", "Compact", "▪"]];
  function categoriesFor(tp) {
    const list = PRODUCTS.filter(p => tp === "All" || p.type === tp).map(p => p.category);
    return ["All", ...Array.from(new Set(list))];
  }
  function renderControls() {
    tabs.innerHTML = TYPES.map(x => `<button class="tab ${x === type ? "active" : ""}" data-type="${x}">${t(x)}</button>`).join("");
    const cats = categoriesFor(type);
    if (!cats.includes(category)) category = "All";
    chips.innerHTML = cats.map(c => `<button class="chip ${c === category ? "active" : ""}" data-cat="${c}">${t(c)}</button>`).join("");
    if (colTabs) colTabs.innerHTML = COLLECTIONS.map(([k, l]) => `<button class="seg ${k === collection ? "active" : ""}" data-col="${k}">${t(l)}</button>`).join("");
    if (views) views.innerHTML = VIEWS.map(([k, l, ic]) => `<button class="view-btn ${k === view ? "active" : ""}" data-view="${k}" title="${t(l)}" aria-label="${t(l)}">${ic}</button>`).join("");
    [...sort.options].forEach(o => { if (!o.dataset.en) o.dataset.en = o.textContent; o.textContent = t(o.dataset.en); });
    if (brandSel) {
      const counts = {};
      PRODUCTS.forEach(p => { counts[p.brand] = (counts[p.brand] || 0) + 1; });
      const brands = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      brandSel.innerHTML = `<option value="All">${t("Brand:")} ${t("All brands")}</option>` + brands.map(b => `<option value="${b}" ${b === brand ? "selected" : ""}>${b} (${counts[b]})</option>`).join("");
    }
  }
  function render() {
    const q = (search.value || "").toLowerCase().trim();
    let list = PRODUCTS.filter(p => (type === "All" || p.type === type) && (category === "All" || p.category === category) &&
      (collection === "all" || (collection === "best" && BEST_RANK[p.id]) || (collection === "picks" && p.pick) || (collection === "stock" && p.inStock)) &&
      (brand === "All" || p.brand === brand) &&
      (!mood || (TAGS_ALL && TAGS_ALL[mood] && TAGS_ALL[mood].has(p.id))) &&
      (!q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.isbn || "").includes(q)));
    switch (sort.value) {
      case "best": list.sort((a, b) => b.sold - a.sold); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: list.sort((a, b) => (BEST_RANK[a.id] || 99) - (BEST_RANK[b.id] || 99) || (b.pick ? 1 : 0) - (a.pick ? 1 : 0) || b.sold - a.sold);
    }
    const titleEl = document.querySelector("[data-shop-title]");
    if (titleEl) titleEl.innerHTML = `${collection === "best" ? t("Bestsellers") : collection === "picks" ? t("Store favourites") : collection === "stock" ? t("In stock") : category !== "All" ? t(category) : type !== "All" ? t(type) : brand !== "All" ? brand : mood && MOOD_LABEL[mood] ? MOOD_LABEL[mood][LANG === "id" ? 1 : 0] : (LANG === "id" ? "Semua produk" : "All products")}<small>${list.length} ${t(list.length === 1 ? "item" : "items")}</small>`;
    count.textContent = `${list.length} ${t(list.length === 1 ? "item" : "items")}` + (type !== "All" ? ` · ${t(type)}` : "") + (category !== "All" ? ` · ${t(category)}` : "") + (mood && MOOD_LABEL[mood] ? ` · ${MOOD_LABEL[mood][LANG === "id" ? 1 : 0]}` : "");
    grid.className = view === "list" ? "book-list" : view === "compact" ? "book-compact" : "book-grid";
    const fn = view === "list" ? productRow : view === "compact" ? productTile : productCard;
    grid.innerHTML = list.length ? list.map(fn).join("") : `<div class="empty"><p>${t("Nothing matches that search.")}</p></div>`;
  }
  function syncUrl() {
    const url = new URL(location.href);
    type === "All" ? url.searchParams.delete("type") : url.searchParams.set("type", type);
    category === "All" ? url.searchParams.delete("cat") : url.searchParams.set("cat", category);
    collection === "all" ? url.searchParams.delete("col") : url.searchParams.set("col", collection);
    brand === "All" ? url.searchParams.delete("brand") : url.searchParams.set("brand", brand);
    history.replaceState(null, "", url);
  }
  tabs.addEventListener("click", e => { const b = e.target.closest("[data-type]"); if (!b) return; type = b.dataset.type; category = "All"; renderControls(); syncUrl(); render(); });
  chips.addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; category = b.dataset.cat; renderControls(); syncUrl(); render(); });
  if (colTabs) colTabs.addEventListener("click", e => { const b = e.target.closest("[data-col]"); if (!b) return; collection = b.dataset.col; renderControls(); syncUrl(); render(); });
  if (views) views.addEventListener("click", e => { const b = e.target.closest("[data-view]"); if (!b) return; view = b.dataset.view; try { localStorage.setItem("wonder-view", view); } catch {} renderControls(); render(); });
  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  if (brandSel) brandSel.addEventListener("change", () => { brand = brandSel.value; syncUrl(); render(); });
  renderControls(); render();
  RERENDER.push(() => { renderControls(); render(); });
}

/* ---------- Home ---------- */
function initHome() {
  const featured = document.querySelector("[data-featured]");
  if (!featured) return;
  const tabsEl = document.querySelector("[data-home-tabs]");
  const TABS = [["best", "Bestsellers"], ["picks", "Store favourites"], ["kids", "Children"]];
  let tab = "best";
  function render() {
    if (tabsEl) tabsEl.innerHTML = TABS.map(([k, l]) => `<button class="seg ${k === tab ? "active" : ""}" data-home-tab="${k}">${t(l)}</button>`).join("");
    let list = tab === "best" ? PRODUCTS.filter(p => p.type === "Books").sort((a, b) => b.sold - a.sold).slice(0, 12)
      : tab === "picks" ? PRODUCTS.filter(p => p.pick).sort((a, b) => b.sold - a.sold)
      : PRODUCTS.filter(p => p.category === "Children").sort((a, b) => b.sold - a.sold).slice(0, 12);
    featured.innerHTML = list.map(productCard).join("");
    const gifts = document.querySelector("[data-gifts]");
    if (gifts) gifts.innerHTML = PRODUCTS.filter(p => p.type !== "Books").sort((a, b) => b.sold - a.sold).map(productCard).join("");
    featured.scrollLeft = 0;
    window.dispatchEvent(new Event("resize"));
  }
  if (tabsEl) tabsEl.addEventListener("click", e => { const b = e.target.closest("[data-home-tab]"); if (!b) return; tab = b.dataset.homeTab; render(); });
  render();
  RERENDER.push(render);
}

/* ---------- Brands page ---------- */
const BRAND_INFO = [
  ["Penguin Random House", "assets/logos/penguin-random-house.svg", "Penguin, Avery, Portfolio, Vintage, Crown, Viking, Ladybird and more.", "Penguin, Avery, Portfolio, Vintage, Crown, Viking, Ladybird, dan lainnya."],
  ["HarperCollins", "assets/logos/harpercollins.png", "Harper, Harper Voyager, Harper Perennial and HarperCollins UK.", "Harper, Harper Voyager, Harper Perennial, dan HarperCollins UK."],
  ["Hachette", "assets/logos/hachette.svg", "Hachette, Little, Brown and Hodder Education.", "Hachette, Little, Brown, dan Hodder Education."],
  ["Simon & Schuster", "assets/logos/simon-schuster.svg", "Fiction and non-fiction from Simon & Schuster.", "Fiksi dan non-fiksi dari Simon & Schuster."],
  ["Macmillan", "assets/logos/macmillan.jpg", "Macmillan, St. Martin's, FSG, Celadon and Campbell Books.", "Macmillan, St. Martin's, FSG, Celadon, dan Campbell Books."],
  ["Bloomsbury", "assets/logos/bloomsbury.svg", "Bloomsbury UK and US.", "Bloomsbury Inggris dan AS."],
  ["Scholastic", "assets/logos/scholastic.svg", "Dog Man, Cat Kid Comic Club and children's favourites.", "Dog Man, Cat Kid Comic Club, dan favorit anak-anak."],
  ["Wordsworth Classics", "", "Affordable editions of the classics.", "Edisi terjangkau buku-buku klasik."],
  ["Kikkerland", "assets/logos/kikkerland.png", "Design gifts and clever everyday objects.", "Hadiah desain dan benda sehari-hari yang cerdik."],
  ["Fred & Friends", "assets/logos/fred.png", "Playful kitchen and desk gifts.", "Hadiah dapur dan meja yang menyenangkan."],
  ["IF", "", "Book lights, paper pens and reading accessories.", "Lampu baca, pena kertas, dan aksesori membaca."]
];
function initBrands() {
  const grid = document.querySelector("[data-brands]");
  if (!grid) return;
  function render() {
    grid.innerHTML = BRAND_INFO.map(([name, logo, en, id]) => {
      const n = PRODUCTS.filter(p => p.brand === name).length;
      return `
        <a class="brand-card" href="shop.html?brand=${encodeURIComponent(name)}">
          <div class="brand-logo">${logo ? `<img src="${logo}" alt="${name}">` : `<span>${name}</span>`}</div>
          <h3>${name}</h3>
          <p>${LANG === "id" ? id : en}</p>
          <span class="brand-count">${n ? n + " " + t(n === 1 ? "item" : "items") + " ↗" : (LANG === "id" ? "Lihat di toko ↗" : "See in store ↗")}</span>
        </a>`;
    }).join("");
  }
  render();
  RERENDER.push(render);
}

/* ---------- Rails ---------- */
function initRails() {
  document.querySelectorAll("[data-rail-wrap]").forEach(wrap => {
    if (wrap.dataset.bound) return;
    wrap.dataset.bound = "1";
    const rail = wrap.querySelector(".rail");
    const prev = wrap.querySelector("[data-prev]");
    const next = wrap.querySelector("[data-next]");
    const bar = wrap.querySelector(".progress span");
    const step = () => (rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 20 : 300);
    function update() {
      const max = rail.scrollWidth - rail.clientWidth;
      const frac = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1;
      if (bar) { bar.style.width = (frac * 100) + "%"; bar.style.left = (max > 0 ? (rail.scrollLeft / max) * (100 - frac * 100) : 0) + "%"; }
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener("click", () => rail.scrollBy({ left: -step() * 2, behavior: "smooth" }));
    if (next) next.addEventListener("click", () => rail.scrollBy({ left: step() * 2, behavior: "smooth" }));
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
}

/* ---------- Hero slideshow ---------- */
function initSlideshow() {
  const show = document.querySelector("[data-slideshow]");
  if (!show) return;
  const slides = [...show.querySelectorAll(".slide")];
  const dots = show.querySelector(".dots");
  let i = 0, timer;
  dots.innerHTML = slides.map((_, k) => `<button aria-label="Slide ${k + 1}"></button>`).join("");
  const dotEls = [...dots.children];
  function go(n) { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle("active", k === i)); dotEls.forEach((d, k) => d.classList.toggle("active", k === i)); }
  function auto() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
  dotEls.forEach((d, k) => d.addEventListener("click", () => { go(k); auto(); }));
  show.querySelector("[data-prev]").addEventListener("click", () => { go(i - 1); auto(); });
  show.querySelector("[data-next]").addEventListener("click", () => { go(i + 1); auto(); });
  go(0); auto();
}

/* ---------- Header ---------- */
function initHeader() {
  const form = document.querySelector("[data-search-form]");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const q = form.querySelector("input").value.trim();
    location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });
  document.querySelectorAll(".nav-links li.has-menu > a").forEach(a => {
    a.addEventListener("click", e => { if (window.matchMedia("(max-width: 680px)").matches) { e.preventDefault(); a.parentElement.classList.toggle("open"); } });
  });
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
}

/* ---------- Forms ---------- */
function initForms() {
  document.querySelectorAll("form[data-demo-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const success = form.querySelector(".form-success") || form.parentElement.querySelector(".form-success");
      if (success) success.style.display = "block"; else showToast(t("Thanks — we'll be in touch."));
      form.reset();
    });
  });
}

/* ---------- Wiring ---------- */
document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  Cart.load(); Cart.render(); initHome(); initShop(); initBrands(); initForms(); renderTrending(); initRails(); initSlideshow(); initHeader();
  RERENDER.push(() => Cart.render()); RERENDER.push(renderTrending);

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => { if (a.getAttribute("href") === path) a.classList.add("active"); });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle) toggle.addEventListener("click", () => links.classList.toggle("open"));

  document.body.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { Cart.add(Number(add.dataset.add)); return; }
    const qty = e.target.closest("[data-qty]");
    if (qty) { const item = Cart.items.find(i => i.id === Number(qty.dataset.id)); if (item) Cart.setQty(item.id, item.qty + Number(qty.dataset.qty)); return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { Cart.remove(Number(rm.dataset.remove)); return; }
    if (e.target.closest("[data-open-cart]")) { document.body.classList.add("cart-open"); return; }
    if (e.target.closest("[data-close-cart]")) { document.body.classList.remove("cart-open"); return; }
    if (e.target.closest("[data-checkout]")) showToast(t("Checkout coming soon —") + " " + Cart.count() + " " + t("items") + ", " + money(Cart.total()));
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("cart-open"); });
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
});

/* =====================================================================
   Stores, shipping, payment, orders and Wonder Club (front-end flows)
   ===================================================================== */
const STORES = [
  { id: "hublife", name: "Hublife", area: "Tanjung Duren, West Jakarta", areaId: "Tanjung Duren, Jakarta Barat", city: "Jakarta", coffee: false },
  { id: "ashta", name: "Ashta District 8", area: "SCBD, South Jakarta", areaId: "SCBD, Jakarta Selatan", city: "Jakarta", coffee: true },
  { id: "pim5", name: "Pondok Indah Mall 5", area: "Pondok Indah, South Jakarta", areaId: "Pondok Indah, Jakarta Selatan", city: "Jakarta", coffee: false },
  { id: "cibubur", name: "TSM Cibubur", area: "Cibubur, Depok", areaId: "Cibubur, Depok", city: "Depok", coffee: false },
  { id: "berawa", name: "Berawa", area: "Canggu, Bali", areaId: "Canggu, Bali", city: "Bali", coffee: true },
  { id: "tsmbali", name: "TSM Bali", area: "Denpasar, Bali", areaId: "Denpasar, Bali", city: "Bali", coffee: false },
];
/* Shipping rates are estimates per zone until a rate API (RajaOngkir / Biteship) is connected. Prices per order. */
const ZONES = [
  ["jabodetabek", "Jabodetabek", "Jabodetabek"], ["jawa", "Java (outside Jabodetabek)", "Jawa (luar Jabodetabek)"], ["bali", "Bali", "Bali"], ["sumatra", "Sumatra", "Sumatra"], ["other", "Other islands", "Pulau lainnya"]
];
const COURIERS = [
  { id: "jne", name: "JNE Regular", eta: { jabodetabek: "1–2", jawa: "2–3", bali: "2–4", sumatra: "3–5", other: "4–7" }, rate: { jabodetabek: 12000, jawa: 18000, bali: 22000, sumatra: 28000, other: 38000 } },
  { id: "jnt", name: "J&T Express", eta: { jabodetabek: "1–2", jawa: "2–3", bali: "2–4", sumatra: "3–5", other: "4–7" }, rate: { jabodetabek: 11000, jawa: 17000, bali: 21000, sumatra: 27000, other: 36000 } },
  { id: "sicepat", name: "SiCepat REG", eta: { jabodetabek: "1–2", jawa: "2–3", bali: "2–4", sumatra: "3–5", other: "4–7" }, rate: { jabodetabek: 10000, jawa: 16000, bali: 20000, sumatra: 26000, other: 35000 } },
  { id: "instant", name: "Gojek Instant (same city)", eta: { jabodetabek: "0 (today)", bali: "0 (today)" }, rate: { jabodetabek: 25000, bali: 25000 } },
];
const FREE_SHIPPING_FROM = 350000;
const PAYMENTS = [
  ["qris", "QRIS", "Scan with any bank or e-wallet app", "Scan dengan aplikasi bank atau e-wallet mana pun"],
  ["gopay", "GoPay", "Pay in the Gojek app", "Bayar lewat aplikasi Gojek"],
  ["shopeepay", "ShopeePay", "Pay in the Shopee app", "Bayar lewat aplikasi Shopee"],
  ["va_bca", "BCA Virtual Account", "Transfer from m-BCA or any ATM", "Transfer dari m-BCA atau ATM mana pun"],
  ["va_mandiri", "Mandiri Virtual Account", "Transfer from Livin' or any ATM", "Transfer dari Livin' atau ATM mana pun"],
  ["va_bni", "BNI Virtual Account", "Transfer from BNI Mobile or any ATM", "Transfer dari BNI Mobile atau ATM mana pun"],
  ["va_bri", "BRI Virtual Account", "Transfer from BRImo or any ATM", "Transfer dari BRImo atau ATM mana pun"],
  ["card", "Credit / debit card", "Visa, Mastercard, JCB", "Visa, Mastercard, JCB"],
  ["cstore", "Indomaret / Alfamart", "Pay cash at the counter", "Bayar tunai di kasir"],
  ["instore", "Pay in store on pickup", "Only with store pickup", "Hanya untuk ambil di toko"],
];
const CLUB = { earnPer: 1000, redeemPoints: 100, redeemValue: 10000, birthdayPct: 30,
  tiers: [["Reader", 0], ["Bookworm", 2500000], ["Wonderer", 7500000]] };

const Orders = {
  key: "wonder-orders",
  all() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(list) { try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {} },
  add(o) { const list = this.all(); list.unshift(o); this.save(list); return o; },
  get(id) { return this.all().find(o => o.id === id); }
};
const Member = {
  key: "wonder-member",
  get() { try { return JSON.parse(localStorage.getItem(this.key)); } catch { return null; } },
  set(m) { try { localStorage.setItem(this.key, JSON.stringify(m)); } catch {} },
  clear() { try { localStorage.removeItem(this.key); } catch {} },
  spend(m) { return Orders.all().filter(o => o.memberEmail === m.email).reduce((s, o) => s + o.subtotal, 0); },
  points(m) { const earned = Orders.all().filter(o => o.memberEmail === m.email).reduce((s, o) => s + o.pointsEarned, 0); return earned - (m.redeemed || 0); },
  tier(m) { const spend = this.spend(m); let tier = CLUB.tiers[0]; CLUB.tiers.forEach(tr => { if (spend >= tr[1]) tier = tr; }); return tier; },
  nextTier(m) { const spend = this.spend(m); return CLUB.tiers.find(tr => tr[1] > spend) || null; }
};
function isBirthdayMonth(m) { if (!m || !m.birthday) return false; return new Date(m.birthday).getMonth() === new Date().getMonth(); }
function fmtDate(iso) { return new Date(iso).toLocaleDateString(LANG === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short", year: "numeric" }); }

/* ---------- Checkout ---------- */
function initCheckout() {
  const root = document.querySelector("[data-checkout-page]");
  if (!root) return;
  const member = Member.get();
  const st = { method: "pickup", store: "ashta", zone: "jabodetabek", courier: "jne", pay: "qris", usePoints: false, placed: null };
  if (member) { st.name = member.name; st.email = member.email; st.phone = member.phone; }

  function items() { return Cart.items.map(i => ({ p: PRODUCTS.find(x => x.id === i.id), qty: i.qty })); }
  function subtotal() { return Cart.total(); }
  function shipping() {
    if (st.method === "pickup") return 0;
    const c = COURIERS.find(x => x.id === st.courier);
    if (!c || c.rate[st.zone] === undefined) return null;
    return subtotal() >= FREE_SHIPPING_FROM && c.id !== "instant" ? 0 : c.rate[st.zone];
  }
  function birthdayDiscount() { return member && isBirthdayMonth(member) && !member.birthdayUsedYear ? Math.round(subtotal() * CLUB.birthdayPct / 100) : 0; }
  function pointsDiscount() { if (!member || !st.usePoints) return 0; const pts = Member.points(member); const blocks = Math.floor(pts / CLUB.redeemPoints); return Math.min(blocks * CLUB.redeemValue, subtotal() - birthdayDiscount()); }
  function total() { return Math.max(0, subtotal() - birthdayDiscount() - pointsDiscount() + (shipping() || 0)); }

  function render() {
    if (st.placed) { location.href = "order.html?id=" + st.placed; return; }
    const L = (en, id) => (LANG === "id" ? id : en);
    if (!Cart.items.length) { root.innerHTML = `<div class="empty"><p>${t("Your bag is empty.")}</p><a class="btn btn-dark btn-sm" href="shop.html">${t("Browse the shop ↗")}</a></div>`; return; }
    const ship = shipping();
    root.innerHTML = `
      <div class="co-grid">
        <div class="co-main">
          <section class="co-block">
            <h3><span class="n">1</span>${L("Contact", "Kontak")}</h3>
            ${member ? `<p class="muted" style="font-size:.9rem">${L("Signed in as", "Masuk sebagai")} <strong>${member.name}</strong> · ${Member.tier(member)[0]} · ${Member.points(member)} ${L("points", "poin")}</p>` : `<p class="muted" style="font-size:.9rem">${L("Wonder Club member?", "Anggota Wonder Club?")} <a href="account.html" style="text-decoration:underline">${L("Sign in to earn points", "Masuk untuk dapat poin")}</a></p>`}
            <div class="field-row">
              <div class="field"><label>${t("Name")}</label><input data-f="name" value="${st.name || ""}" required></div>
              <div class="field"><label>${L("WhatsApp number", "Nomor WhatsApp")}</label><input data-f="phone" value="${st.phone || ""}" placeholder="08…" required></div>
            </div>
            <div class="field"><label>${t("Email")}</label><input data-f="email" type="email" value="${st.email || ""}" required></div>
          </section>

          <section class="co-block">
            <h3><span class="n">2</span>${L("Delivery", "Pengiriman")}</h3>
            <div class="choice-row">
              <label class="choice ${st.method === "pickup" ? "on" : ""}"><input type="radio" name="method" value="pickup" ${st.method === "pickup" ? "checked" : ""}><div><strong>${L("Pick up in store", "Ambil di toko")}</strong><span>${L("Free · ready in 2 hours during store hours", "Gratis · siap dalam 2 jam pada jam buka")}</span></div></label>
              <label class="choice ${st.method === "ship" ? "on" : ""}"><input type="radio" name="method" value="ship" ${st.method === "ship" ? "checked" : ""}><div><strong>${L("Ship to me", "Kirim ke alamat")}</strong><span>${L("Free shipping from", "Gratis ongkir mulai")} ${money(FREE_SHIPPING_FROM)}</span></div></label>
            </div>
            ${st.method === "pickup" ? `
              <div class="store-pick">${STORES.map(s => `
                <label class="choice store-choice ${st.store === s.id ? "on" : ""}"><input type="radio" name="store" value="${s.id}" ${st.store === s.id ? "checked" : ""}><div><strong>${s.name}</strong><span>${LANG === "id" ? s.areaId : s.area}${s.coffee ? " · Wonder Coffee" : ""}</span></div></label>`).join("")}
              </div>` : `
              <div class="field"><label>${L("Address", "Alamat")}</label><textarea data-f="address" rows="2" required>${st.address || ""}</textarea></div>
              <div class="field-row">
                <div class="field"><label>${L("City / district", "Kota / kecamatan")}</label><input data-f="city" value="${st.city || ""}" required></div>
                <div class="field"><label>${L("Shipping zone", "Zona pengiriman")}</label><select data-f="zone">${ZONES.map(z => `<option value="${z[0]}" ${st.zone === z[0] ? "selected" : ""}>${LANG === "id" ? z[2] : z[1]}</option>`).join("")}</select></div>
              </div>
              <div class="choice-row cols">${COURIERS.filter(c => c.rate[st.zone] !== undefined).map(c => {
                const free = subtotal() >= FREE_SHIPPING_FROM && c.id !== "instant";
                return `<label class="choice ${st.courier === c.id ? "on" : ""}"><input type="radio" name="courier" value="${c.id}" ${st.courier === c.id ? "checked" : ""}><div><strong>${c.name}</strong><span>${c.eta[st.zone]} ${L("days", "hari")} · ${free ? L("Free", "Gratis") : money(c.rate[st.zone])}</span></div></label>`; }).join("")}
              </div>
              <p class="form-note">${L("Rates are estimates until the courier rate service is connected.", "Tarif masih perkiraan sampai layanan tarif kurir terhubung.")}</p>`}
          </section>

          <section class="co-block">
            <h3><span class="n">3</span>${L("Payment", "Pembayaran")}</h3>
            <div class="choice-row cols">${PAYMENTS.filter(([id]) => id !== "instore" || st.method === "pickup").map(([id, name, en, idn]) => `
              <label class="choice ${st.pay === id ? "on" : ""}"><input type="radio" name="pay" value="${id}" ${st.pay === id ? "checked" : ""}><div><strong>${name}</strong><span>${LANG === "id" ? idn : en}</span></div></label>`).join("")}
            </div>
            <p class="form-note">${L("Processed by Midtrans. You will be redirected to complete payment.", "Diproses oleh Midtrans. Anda akan diarahkan untuk menyelesaikan pembayaran.")}</p>
          </section>
        </div>

        <aside class="co-side">
          <div class="co-summary">
            <h3>${L("Your order", "Pesanan Anda")}</h3>
            ${items().map(({ p, qty }) => `<div class="co-line">${p.cover ? `<img src="${p.cover}" alt="">` : `<span class="mini" style="background:${colorOf(p)}"></span>`}<div><strong>${p.title}</strong><span>${qty} × ${money(p.price)}</span></div><span>${money(p.price * qty)}</span></div>`).join("")}
            <div class="co-totals">
              <div><span>${t("Subtotal")}</span><span>${money(subtotal())}</span></div>
              ${birthdayDiscount() ? `<div class="good"><span>${L("Birthday month", "Bulan ulang tahun")} −${CLUB.birthdayPct}%</span><span>−${money(birthdayDiscount())}</span></div>` : ""}
              ${member && Member.points(member) >= CLUB.redeemPoints ? `<div><label class="pts"><input type="checkbox" data-f="usePoints" ${st.usePoints ? "checked" : ""}> ${L("Use", "Pakai")} ${Math.floor(Member.points(member) / CLUB.redeemPoints) * CLUB.redeemPoints} ${L("points", "poin")}</label><span>${st.usePoints ? "−" + money(pointsDiscount()) : money(Math.floor(Member.points(member) / CLUB.redeemPoints) * CLUB.redeemValue)}</span></div>` : ""}
              <div><span>${st.method === "pickup" ? L("Pickup", "Ambil di toko") : L("Shipping", "Ongkir")}</span><span>${ship === null ? "—" : ship === 0 ? L("Free", "Gratis") : money(ship)}</span></div>
              <div class="grand"><span>${L("Total", "Total")}</span><span>${money(total())}</span></div>
            </div>
            ${member ? `<p class="form-note">${L("You will earn", "Anda akan mendapat")} <strong>${Math.floor(total() / CLUB.earnPer)}</strong> ${L("Wonder Club points", "poin Wonder Club")}.</p>` : `<p class="form-note">${L("Join Wonder Club to earn", "Gabung Wonder Club untuk dapat")} ${Math.floor(total() / CLUB.earnPer)} ${L("points on this order.", "poin dari pesanan ini.")}</p>`}
            <button class="btn btn-dark" data-place style="width:100%;justify-content:center">${L("Place order ↗", "Buat pesanan ↗")}</button>
            <p class="form-note" style="text-align:center">${L("Demo: no payment is taken yet.", "Demo: belum ada pembayaran yang diproses.")}</p>
          </div>
        </aside>
      </div>`;
  }
  root.addEventListener("change", e => {
    const el = e.target;
    if (el.name === "method") st.method = el.value;
    else if (el.name === "store") st.store = el.value;
    else if (el.name === "courier") st.courier = el.value;
    else if (el.name === "pay") st.pay = el.value;
    else if (el.dataset.f === "usePoints") st.usePoints = el.checked;
    else if (el.dataset.f) { st[el.dataset.f] = el.value; if (el.dataset.f !== "zone") return; }
    else return;
    if (st.method === "pickup" && st.pay !== "instore" && !PAYMENTS.find(p => p[0] === st.pay)) st.pay = "qris";
    if (st.method === "ship" && st.pay === "instore") st.pay = "qris";
    if (!COURIERS.find(c => c.id === st.courier && c.rate[st.zone] !== undefined)) st.courier = "jne";
    render();
  });
  root.addEventListener("input", e => { if (e.target.dataset.f && e.target.dataset.f !== "zone") st[e.target.dataset.f] = e.target.value; });
  root.addEventListener("click", e => {
    if (!e.target.closest("[data-place]")) return;
    const req = ["name", "phone", "email"].concat(st.method === "ship" ? ["address", "city"] : []);
    const missing = req.filter(k => !(st[k] || "").trim());
    if (missing.length) { showToast(LANG === "id" ? "Lengkapi kontak dan alamat dulu." : "Please complete contact and address first."); root.querySelector(`[data-f="${missing[0]}"]`).focus(); return; }
    const id = "WB" + Date.now().toString().slice(-8);
    const order = {
      id, date: new Date().toISOString(), items: items().map(({ p, qty }) => ({ id: p.id, title: p.title, price: p.price, qty, cover: p.cover || "" })),
      subtotal: subtotal(), shipping: shipping() || 0, discount: birthdayDiscount() + pointsDiscount(), total: total(),
      method: st.method, store: st.method === "pickup" ? STORES.find(s => s.id === st.store).name : null, courier: st.method === "ship" ? COURIERS.find(c => c.id === st.courier).name : null,
      zone: st.zone, address: st.method === "ship" ? `${st.address}, ${st.city}` : null,
      payment: PAYMENTS.find(p => p[0] === st.pay)[1], status: "awaiting_payment",
      name: st.name, phone: st.phone, email: st.email, memberEmail: member ? member.email : null,
      pointsEarned: member ? Math.floor(total() / CLUB.earnPer) : 0, pointsUsed: member && st.usePoints ? Math.floor(Member.points(member) / CLUB.redeemPoints) * CLUB.redeemPoints : 0
    };
    if (member) {
      if (order.pointsUsed) { member.redeemed = (member.redeemed || 0) + order.pointsUsed; }
      if (birthdayDiscount()) member.birthdayUsedYear = new Date().getFullYear();
      Member.set(member);
    }
    Orders.add(order);
    Cart.items = []; Cart.save();
    st.placed = id; render();
  });
  render();
  RERENDER.push(render);
}

/* ---------- Order confirmation ---------- */
function initOrderPage() {
  const root = document.querySelector("[data-order-page]");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const o = Orders.get(id);
  const L = (en, idn) => (LANG === "id" ? idn : en);
  function render() {
    if (!o) { root.innerHTML = `<div class="empty"><p>${L("Order not found.", "Pesanan tidak ditemukan.")}</p></div>`; return; }
    const payNote = o.payment.includes("Virtual") ? L("Transfer the total to the virtual account number sent to your WhatsApp and email.", "Transfer total ke nomor virtual account yang dikirim ke WhatsApp dan email Anda.")
      : o.payment === "QRIS" ? L("Scan the QR code sent to your WhatsApp and email.", "Scan kode QR yang dikirim ke WhatsApp dan email Anda.")
      : o.payment === "Pay in store on pickup" ? L("Pay at the cashier when you collect.", "Bayar di kasir saat mengambil pesanan.")
      : L("Follow the payment link sent to your WhatsApp and email.", "Ikuti tautan pembayaran yang dikirim ke WhatsApp dan email Anda.");
    root.innerHTML = `
      <div class="order-card">
        <div class="label muted">${L("Order", "Pesanan")} ${o.id} · ${fmtDate(o.date)}</div>
        <h2>${L("Thank you,", "Terima kasih,")} ${o.name.split(" ")[0]}.</h2>
        <p class="muted">${o.method === "pickup" ? L("Your order will be ready to collect at", "Pesanan Anda siap diambil di") + " <strong>" + o.store + "</strong> " + L("within 2 hours during store hours. Bring this order number.", "dalam 2 jam pada jam buka. Bawa nomor pesanan ini.") : L("Your order will ship with", "Pesanan Anda akan dikirim dengan") + " <strong>" + o.courier + "</strong> " + L("to", "ke") + " " + o.address + "."}</p>
        <div class="order-status"><span class="dot"></span>${L("Awaiting payment", "Menunggu pembayaran")} · ${o.payment}</div>
        <p class="muted" style="font-size:.92rem">${payNote}</p>
        <div class="co-summary" style="margin-top:20px">
          ${o.items.map(i => `<div class="co-line">${i.cover ? `<img src="${i.cover}" alt="">` : `<span class="mini"></span>`}<div><strong>${i.title}</strong><span>${i.qty} × ${money(i.price)}</span></div><span>${money(i.price * i.qty)}</span></div>`).join("")}
          <div class="co-totals">
            <div><span>${t("Subtotal")}</span><span>${money(o.subtotal)}</span></div>
            ${o.discount ? `<div class="good"><span>${L("Discounts", "Diskon")}</span><span>−${money(o.discount)}</span></div>` : ""}
            <div><span>${o.method === "pickup" ? L("Pickup", "Ambil di toko") : L("Shipping", "Ongkir")}</span><span>${o.shipping ? money(o.shipping) : L("Free", "Gratis")}</span></div>
            <div class="grand"><span>Total</span><span>${money(o.total)}</span></div>
          </div>
          ${o.pointsEarned ? `<p class="form-note">+${o.pointsEarned} ${L("Wonder Club points once paid.", "poin Wonder Club setelah dibayar.")}</p>` : ""}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
          <a class="btn btn-dark" href="shop.html">${L("Keep shopping ↗", "Lanjut belanja ↗")}</a>
          <a class="btn btn-dark" href="account.html">${L("My account ↗", "Akun saya ↗")}</a>
        </div>
      </div>`;
  }
  render();
  RERENDER.push(render);
}

/* ---------- Wonder Club account ---------- */
function initAccount() {
  const root = document.querySelector("[data-account-page]");
  if (!root) return;
  const L = (en, idn) => (LANG === "id" ? idn : en);
  function render() {
    const m = Member.get();
    if (!m) {
      root.innerHTML = `
        <div class="co-grid">
          <div class="co-main">
            <div class="co-block">
              <h3>${L("Join Wonder Club", "Gabung Wonder Club")}</h3>
              <p class="muted">${L("Free to join. Earn points on every purchase, in store and online, and get a birthday month treat.", "Gratis. Dapatkan poin dari setiap pembelian, di toko maupun online, plus kejutan di bulan ulang tahun.")}</p>
              <form data-join>
                <div class="field-row">
                  <div class="field"><label>${t("Name")}</label><input name="name" required></div>
                  <div class="field"><label>${L("WhatsApp number", "Nomor WhatsApp")}</label><input name="phone" required placeholder="08…"></div>
                </div>
                <div class="field-row">
                  <div class="field"><label>${t("Email")}</label><input name="email" type="email" required></div>
                  <div class="field"><label>${L("Birthday", "Tanggal lahir")}</label><input name="birthday" type="date"></div>
                </div>
                <div class="field"><label>${L("Home store", "Toko langganan")}</label><select name="store">${STORES.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div>
                <button class="btn btn-dark" type="submit">${L("Join free ↗", "Gabung gratis ↗")}</button>
                <p class="form-note">${L("Already a member in store? Use the same WhatsApp number and we will link your points.", "Sudah jadi anggota di toko? Pakai nomor WhatsApp yang sama dan poin Anda akan ditautkan.")}</p>
              </form>
            </div>
          </div>
          <aside class="co-side">${benefits()}</aside>
        </div>`;
      return;
    }
    const tier = Member.tier(m), next = Member.nextTier(m), spend = Member.spend(m), pts = Member.points(m);
    const orders = Orders.all().filter(o => o.memberEmail === m.email);
    const pct = next ? Math.min(100, Math.round((spend - tier[1]) / (next[1] - tier[1]) * 100)) : 100;
    root.innerHTML = `
      <div class="co-grid">
        <div class="co-main">
          <div class="co-block member-card">
            <div class="member-top"><div><div class="label" style="opacity:.7">Wonder Club · ${tier[0]}</div><h2 style="margin:6px 0 0">${m.name}</h2></div><img src="assets/logo-mark.svg" alt="" style="width:44px"></div>
            <div class="member-stats">
              <div><strong>${pts}</strong><span>${L("points", "poin")} · ${L("worth", "senilai")} ${money(Math.floor(pts / CLUB.redeemPoints) * CLUB.redeemValue)}</span></div>
              <div><strong>${money(spend)}</strong><span>${L("spent this year", "belanja tahun ini")}</span></div>
              <div><strong>${orders.length}</strong><span>${L("orders", "pesanan")}</span></div>
            </div>
            <div class="tier-bar"><span style="width:${pct}%"></span></div>
            <p class="form-note" style="margin:8px 0 0">${next ? L("Spend", "Belanja") + " " + money(next[1] - spend) + " " + L("more to reach", "lagi untuk mencapai") + " " + next[0] : L("You are at the top tier.", "Anda di tingkat tertinggi.")}</p>
            ${isBirthdayMonth(m) && m.birthdayUsedYear !== new Date().getFullYear() ? `<div class="order-status good" style="margin-top:14px"><span class="dot"></span>${L("It is your birthday month: " + CLUB.birthdayPct + "% off one order, applied at checkout.", "Ini bulan ulang tahun Anda: diskon " + CLUB.birthdayPct + "% untuk satu pesanan, otomatis di checkout.")}</div>` : ""}
          </div>
          <div class="co-block">
            <h3>${L("Orders", "Pesanan")}</h3>
            ${orders.length ? orders.map(o => `<a class="order-row" href="order.html?id=${o.id}"><div><strong>${o.id}</strong><span>${fmtDate(o.date)} · ${o.items.length} ${t(o.items.length === 1 ? "item" : "items")} · ${o.method === "pickup" ? o.store : o.courier}</span></div><div><strong>${money(o.total)}</strong><span>${L("Awaiting payment", "Menunggu pembayaran")}</span></div></a>`).join("") : `<p class="muted">${L("No orders yet.", "Belum ada pesanan.")}</p>`}
          </div>
          <div class="co-block">
            <h3>${L("Details", "Data")}</h3>
            <p class="muted" style="font-size:.92rem">${m.email} · ${m.phone}${m.birthday ? " · " + fmtDate(m.birthday) : ""} · ${L("Home store", "Toko langganan")}: ${(STORES.find(s => s.id === m.store) || STORES[0]).name}</p>
            <button class="btn btn-dark btn-sm" data-signout>${L("Sign out", "Keluar")}</button>
          </div>
        </div>
        <aside class="co-side">${benefits()}</aside>
      </div>`;
  }
  function benefits() {
    const m = Member.get();
    const cur = m ? Member.tier(m)[0] : CLUB.tiers[0][0];
    const perks = {
      Reader: [[L("Points on every purchase", "Poin dari setiap pembelian"), `1 ${L("point per", "poin per")} ${money(CLUB.earnPer)} · ${CLUB.redeemPoints} ${L("points", "poin")} = ${money(CLUB.redeemValue)}`], [L("Birthday month", "Bulan ulang tahun"), `${CLUB.birthdayPct}% ${L("off one order", "untuk satu pesanan")}`], [L("Events", "Acara"), L("Invitations to launches and kids' activities", "Undangan peluncuran dan aktivitas anak")]],
      Bookworm: [[L("Everything in Reader", "Semua di Reader"), ""], [L("Early access", "Akses lebih awal"), L("New arrivals and pre-orders 48 hours early", "Judul baru dan pre-order 48 jam lebih awal")], [L("Member events", "Acara anggota"), L("Priority seats at book clubs and launches", "Kursi prioritas di klub buku dan peluncuran")]],
      Wonderer: [[L("Everything in Bookworm", "Semua di Bookworm"), ""], [L("Personal bookseller", "Penjaga toko pribadi"), L("WhatsApp line to a store bookseller", "Jalur WhatsApp ke penjaga toko")], [L("Private previews", "Pratinjau privat"), L("First look at collaborations and signed editions", "Lihat lebih dulu kolaborasi dan edisi bertanda tangan")]]
    };
    return `<div class="co-summary tiers">
      <h3>${L("Your rewards", "Hadiah Anda")}</h3>
      <p class="muted" style="font-size:.9rem">${L("Three tiers by yearly spend. Rules are a draft for the store team to confirm.", "Tiga tingkat berdasarkan belanja tahunan. Aturan masih draf untuk dikonfirmasi tim toko.")}</p>
      <div class="tier-tabs">${CLUB.tiers.map(([name]) => `<button class="${name === cur ? "active" : ""}" data-tier="${name}">${name}</button>`).join("")}</div>
      ${CLUB.tiers.map(([name, min]) => `
        <div class="tier-pane" data-tier-pane="${name}" ${name === cur ? "" : "hidden"}>
          <div class="tier-req">${min ? L("From", "Mulai") + " " + money(min) + " " + L("a year", "per tahun") : L("Free to join", "Gratis bergabung")}</div>
          <ul class="arrow-list">${perks[name].map(([h, d]) => `<li><strong>→ ${h}</strong>${d ? `<span>${d}</span>` : ""}</li>`).join("")}</ul>
        </div>`).join("")}
      ${m ? "" : `<a class="btn btn-dark btn-sm" href="#join" style="margin-top:6px">${L("Register or sign in →", "Daftar atau masuk →")}</a>`}
    </div>`;
  }
  root.addEventListener("submit", e => {
    const f = e.target.closest("[data-join]"); if (!f) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    Member.set({ name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone.trim(), birthday: d.birthday || "", store: d.store, joined: new Date().toISOString(), redeemed: 0 });
    showToast(LANG === "id" ? "Selamat datang di Wonder Club!" : "Welcome to Wonder Club!");
    render(); renderHeaderMember();
  });
  root.addEventListener("click", e => {
    if (e.target.closest("[data-signout]")) { Member.clear(); render(); renderHeaderMember(); return; }
    const tb = e.target.closest("[data-tier]");
    if (tb) { root.querySelectorAll("[data-tier]").forEach(b => b.classList.toggle("active", b === tb)); root.querySelectorAll("[data-tier-pane]").forEach(pn => pn.hidden = pn.dataset.tierPane !== tb.dataset.tier); }
  });
  render();
  RERENDER.push(render);
}
function renderHeaderMember() {
  const m = Member.get();
  document.querySelectorAll("[data-account-link]").forEach(a => { a.textContent = m ? (m.name.split(" ")[0] + " · " + Member.points(m)) : (LANG === "id" ? "Wonder Club" : "Wonder Club"); });
}
document.addEventListener("DOMContentLoaded", () => {
  initCheckout(); initOrderPage(); initAccount(); renderHeaderMember(); RERENDER.push(renderHeaderMember);
  document.body.addEventListener("click", e => { if (e.target.closest("[data-checkout]") && Cart.items.length) { e.stopImmediatePropagation(); location.href = "checkout.html"; } }, true);
});

/* =====================================================================
   Journal: events, news and reading lists (shelf posts embed catalogue books)
   ===================================================================== */
const byTitles = (...titles) => () => titles.map(tt => PRODUCTS.find(p => p.title.toLowerCase().startsWith(tt.toLowerCase()))).filter(Boolean);
const JOURNAL = [
  { slug: "now-open-pondok-indah-mall-5", type: "news", date: "2026-03-20", img: "assets/img/store-pim5.jpg",
    title: ["Now open: Pondok Indah Mall 5", "Baru buka: Pondok Indah Mall 5"],
    excerpt: ["Our sixth store brings the signature green to South Jakarta, with a children's corner and the full gift range.", "Toko keenam membawa hijau khas kami ke Jakarta Selatan, dengan pojok anak dan koleksi hadiah lengkap."],
    body: [["Wonder Bookstore Pondok Indah Mall 5 opened in March 2026, our fourth store in Greater Jakarta and sixth overall.", "The store carries the full range: imported English-language books across business, self-development, fiction and children's titles, plus stationery and design gifts from Kikkerland, Fred & Friends and IF.", "Come and browse, stay a while, and tell us what you would like to see on the shelves."],
           ["Wonder Bookstore Pondok Indah Mall 5 dibuka pada Maret 2026, toko keempat kami di Jabodetabek dan keenam secara keseluruhan.", "Toko ini membawa koleksi lengkap: buku impor berbahasa Inggris untuk bisnis, pengembangan diri, fiksi, dan anak, plus alat tulis dan hadiah desain dari Kikkerland, Fred & Friends, dan IF.", "Datang, lihat-lihat, berlama-lamalah, dan beri tahu kami apa yang ingin Anda lihat di rak."]],
    books: byTitles("Atomic Habits", "Dog Man #14", "The Let Them Theory", "Tuesdays With Morrie") },
  { slug: "five-reads-for-the-6am-flight", type: "shelf", date: "2026-02-10", img: "assets/img/customers-reading.jpg",
    title: ["Five reads for the 6AM flight", "Lima bacaan untuk penerbangan pagi"],
    excerpt: ["Short, absorbing, and easy to pick up before boarding. The store team's picks from the bestseller wall.", "Singkat, menyerap, dan mudah dipilih sebelum boarding. Pilihan tim toko dari rak terlaris."],
    body: [["Airport reads have one job: hold your attention through boarding, a delay and the first hour in the air.", "These are the titles our team reaches for when a customer asks for \"something for the flight\". Each one is in stock across the six stores."],
           ["Bacaan bandara punya satu tugas: menjaga perhatian Anda sepanjang boarding, penundaan, dan satu jam pertama di udara.", "Inilah judul yang diambil tim kami saat pelanggan minta \"sesuatu untuk penerbangan\". Semuanya tersedia di enam toko."]],
    books: byTitles("Tuesdays With Morrie", "The Alchemist", "The Let Them Theory", "Atomic Habits", "The Psychology of Money") },
  { slug: "dog-man-and-friends", type: "shelf", date: "2026-01-28", img: "assets/img/interior-cibubur.jpg",
    title: ["Dog Man and friends: starting kids on comics", "Dog Man dan kawan-kawan: mulai komik untuk anak"],
    excerpt: ["Dav Pilkey's series is the reason so many seven-year-olds now read on their own. Where to start, and what comes next.", "Seri Dav Pilkey adalah alasan banyak anak tujuh tahun kini membaca sendiri. Mulai dari mana, dan lanjut ke mana."],
    body: [["Dog Man is our best-selling children's series by a wide margin, and for good reason: the jokes land, the drawings are generous, and the chapters are short enough to finish before bedtime.", "Start with Dog Man #1, then follow the numbers. When they have read them all, Cat Kid Comic Club teaches them to make their own."],
           ["Dog Man adalah seri anak terlaris kami dengan selisih jauh, dan alasannya jelas: leluconnya kena, gambarnya murah hati, dan babnya cukup pendek untuk selesai sebelum tidur.", "Mulai dari Dog Man #1, lalu ikuti nomornya. Setelah semuanya dibaca, Cat Kid Comic Club mengajari mereka membuat komik sendiri."]],
    books: () => PRODUCTS.filter(p => /dog man|cat kid/i.test(p.title)).sort((a, b) => b.sold - a.sold) },
  { slug: "classics-worth-keeping", type: "shelf", date: "2025-12-05", img: "assets/img/interior-pim5.jpg",
    title: ["Classics worth keeping", "Buku klasik yang layak disimpan"],
    excerpt: ["Wordsworth editions make the canon affordable. The ones to put on the shelf first.", "Edisi Wordsworth membuat karya klasik terjangkau. Yang pertama layak masuk rak."],
    body: [["The classics shelf is where most people start with good intentions and stall. These editions remove the excuse: readable type, sturdy paperbacks, and prices that make it easy to buy two.", "Pick one novel and one you have always meant to read. Keep both."],
           ["Rak klasik adalah tempat banyak orang memulai dengan niat baik lalu berhenti. Edisi ini menghapus alasannya: huruf yang nyaman dibaca, paperback kokoh, dan harga yang membuat beli dua terasa mudah.", "Pilih satu novel dan satu yang selalu ingin Anda baca. Simpan keduanya."]],
    books: () => PRODUCTS.filter(p => p.publisher === "Wordsworth") },
  { slug: "wonder-anniversary-with-ryan-geraldin", type: "event", date: "2025-11-15", img: "assets/img/events/anniversary-ryan-geraldin.jpg",
    title: ["Wonder anniversary with Ryan Geraldin", "Ulang tahun Wonder bersama Ryan Geraldin"],
    excerpt: ["Artist Ryan Geraldin took over the bestseller wall with prints, tees and caps for our anniversary.", "Seniman Ryan Geraldin mengisi rak terlaris dengan print, kaus, dan topi untuk ulang tahun kami."],
    body: [["For our anniversary we invited Jakarta artist Ryan Geraldin into the store. His line drawings covered prints, tote bags, tees and a cap, displayed between the business and self-help shelves.", "Collaborations like this are how we keep the stores changing with every season. Follow @wonderbookstoreofficial for the next one."],
           ["Untuk ulang tahun kami, seniman Jakarta Ryan Geraldin kami undang ke toko. Gambar garisnya memenuhi print, tote bag, kaus, dan topi, dipajang di antara rak bisnis dan pengembangan diri.", "Kolaborasi seperti ini membuat toko terus berubah setiap musim. Ikuti @wonderbookstoreofficial untuk yang berikutnya."]],
    store: "Ashta District 8" },
  { slug: "soiree-sore-with-ghea-resort", type: "event", date: "2025-09-20", img: "assets/img/events/ghea-resort.jpg",
    title: ["Soirée Sore: Tropical Bohemian with Ghea Resort", "Soirée Sore: Tropical Bohemian bersama Ghea Resort"],
    excerpt: ["An afternoon of resort wear, talks and books in the store with Ghea Resort by Amanda Janna.", "Sore dengan busana resor, bincang, dan buku di toko bersama Ghea Resort by Amanda Janna."],
    body: [["Ghea Resort by Amanda Janna brought its Tropical Bohemian collection into the store for an afternoon soirée, with a limited collaboration rack, a talk and a very full room.", "Events like this are open to everyone. Wonder Club members get the invitation first."],
           ["Ghea Resort by Amanda Janna membawa koleksi Tropical Bohemian ke toko untuk sebuah soirée sore, dengan rak kolaborasi terbatas, bincang, dan ruangan yang sangat penuh.", "Acara seperti ini terbuka untuk semua. Anggota Wonder Club mendapat undangan lebih dulu."]] },
  { slug: "book-launch-kareem-and-khaleel", type: "event", date: "2025-08-09", img: "assets/img/events/kareem-khaleel-launch.jpg",
    title: ["Book launch and career-moms sharing with Kareem & Khaleel", "Peluncuran buku dan sharing career moms bersama Kareem & Khaleel"],
    excerpt: ["Kareem & Khaleel launched their children's title in store, with a sharing session for working mothers.", "Kareem & Khaleel meluncurkan buku anak mereka di toko, dengan sesi berbagi untuk ibu bekerja."],
    body: [["A full house for the launch of Kareem & Khaleel's new picture book, followed by a sharing session on raising readers while building a career.", "The kids' corner turned into a reading circle for the afternoon. We host author events across all six stores; get in touch if you would like to launch with us."],
           ["Ruangan penuh untuk peluncuran buku bergambar baru Kareem & Khaleel, disusul sesi berbagi tentang membesarkan pembaca sambil membangun karier.", "Pojok anak berubah menjadi lingkaran membaca sepanjang sore. Kami mengadakan acara penulis di keenam toko; hubungi kami jika ingin meluncurkan buku bersama."]] },
  { slug: "mirror-decorating-with-ruang-kreasi", type: "event", date: "2024-12-14", img: "assets/img/events/ruang-kreasi-mirror.jpg",
    title: ["Mirror decorating for kids with Ruang Kreasi", "Menghias cermin untuk anak bersama Ruang Kreasi"],
    excerpt: ["Clay, flowers and a lot of glitter: a Saturday craft session for kids with Ruang Kreasi and Banana & Rover.", "Clay, bunga, dan banyak glitter: sesi kerajinan Sabtu untuk anak bersama Ruang Kreasi dan Banana & Rover."],
    body: [["Ruang Kreasi set up a clay station in the store and every child left with a decorated mirror. Banana & Rover supported the session.", "Kids' activities run regularly across the stores, especially in the school holidays. Check the journal or Instagram for the next date."],
           ["Ruang Kreasi menyiapkan stasiun clay di toko dan setiap anak pulang membawa cermin hiasan sendiri. Banana & Rover mendukung sesi ini.", "Aktivitas anak berjalan rutin di berbagai toko, terutama saat liburan sekolah. Cek jurnal atau Instagram untuk tanggal berikutnya."]] },
  { slug: "collaboration-with-rsia-bina-medika", type: "event", date: "2024-10-05", img: "assets/img/events/rsia-bina-medika.jpg",
    title: ["Collaboration event with RSIA Bina Medika", "Acara kolaborasi bersama RSIA Bina Medika"],
    excerpt: ["A family day in the store with the maternity and children's hospital RSIA Bina Medika.", "Hari keluarga di toko bersama rumah sakit ibu dan anak RSIA Bina Medika."],
    body: [["Together with RSIA Bina Medika we hosted a family afternoon: a talk for parents, story time for the little ones, and a picture-book table to take home.", "If your organisation would like to run a session with us, the events contact is on the stores page."],
           ["Bersama RSIA Bina Medika kami mengadakan sore keluarga: bincang untuk orang tua, story time untuk si kecil, dan meja buku bergambar untuk dibawa pulang.", "Jika organisasi Anda ingin mengadakan sesi bersama kami, kontak acara ada di halaman toko."]] }
];
const TYPE_LABEL = { event: ["Event", "Acara"], news: ["News", "Kabar"], shelf: ["Reading list", "Daftar bacaan"] };
function postCard(p, cls = "") {
  const i = LANG === "id" ? 1 : 0;
  const books = p.books ? p.books().slice(0, 4) : [];
  return `
    <a class="post-card ${cls}" href="post.html?slug=${p.slug}">
      <div class="post-img"><img src="${p.img}" alt="" loading="lazy"><span class="post-type">${TYPE_LABEL[p.type][i]}</span></div>
      <div class="post-body">
        <div class="post-meta">${fmtDate(p.date)}${p.store ? " · " + p.store : ""}</div>
        <h3>${p.title[i]}</h3>
        <p>${p.excerpt[i]}</p>
        ${books.length ? `<div class="post-books">${books.map(b => b.cover ? `<img src="${b.cover}" alt="${b.title}" title="${b.title}">` : `<span style="background:${colorOf(b)}"></span>`).join("")}<em>${books.length} ${LANG === "id" ? "buku" : "books"} ↗</em></div>` : ""}
      </div>
    </a>`;
}
function initJournal() {
  const root = document.querySelector("[data-journal]");
  if (!root) return;
  const filterEl = document.querySelector("[data-journal-filter]");
  let type = new URLSearchParams(location.search).get("type") || "all";
  function render() {
    const i = LANG === "id" ? 1 : 0;
    const list = JOURNAL.filter(p => type === "all" || p.type === type).sort((a, b) => b.date.localeCompare(a.date));
    if (filterEl) filterEl.innerHTML = [["all", LANG === "id" ? "Semua" : "All"], ["event", TYPE_LABEL.event[i]], ["shelf", TYPE_LABEL.shelf[i]], ["news", TYPE_LABEL.news[i]]].map(([k, l]) => `<button class="seg ${k === type ? "active" : ""}" data-jtype="${k}">${l}</button>`).join("");
    const [lead, ...rest] = list;
    root.innerHTML = (lead ? `<div class="journal-lead">${postCard(lead, "lead")}</div>` : "") + `<div class="post-grid">${rest.map(p => postCard(p)).join("")}</div>`;
  }
  if (filterEl) filterEl.addEventListener("click", e => { const b = e.target.closest("[data-jtype]"); if (!b) return; type = b.dataset.jtype; render(); });
  render(); RERENDER.push(render);
  const home = document.querySelector("[data-journal-home]");
  if (home) { const r = () => { home.innerHTML = JOURNAL.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(p => postCard(p)).join(""); }; r(); RERENDER.push(r); }
}
function initHomeJournal() {
  const home = document.querySelector("[data-journal-home]");
  if (!home || document.querySelector("[data-journal]")) return;
  const r = () => { home.innerHTML = JOURNAL.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(p => postCard(p)).join(""); };
  r(); RERENDER.push(r);
}
function initPost() {
  const root = document.querySelector("[data-post]");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const p = JOURNAL.find(x => x.slug === slug) || JOURNAL[0];
  function render() {
    const i = LANG === "id" ? 1 : 0;
    const books = p.books ? p.books() : [];
    document.title = p.title[i] + " — Wonder Bookstore";
    const related = JOURNAL.filter(x => x.slug !== p.slug && (x.type === p.type)).slice(0, 3);
    root.innerHTML = `
      <article class="post">
        <div class="post-hero"><img src="${p.img}" alt=""></div>
        <div class="post-wrap">
          <div class="post-meta"><span class="post-type inline">${TYPE_LABEL[p.type][i]}</span> ${fmtDate(p.date)}${p.store ? " · " + p.store : ""}</div>
          <h1>${p.title[i]}</h1>
          <p class="post-lead">${p.excerpt[i]}</p>
          <div class="post-text">${p.body[i].map(par => `<p>${par}</p>`).join("")}</div>
        </div>
        ${books.length ? `
        <div class="post-shelf">
          <div class="container">
            <div class="rail-head"><div><div class="label muted" style="margin-bottom:10px">${LANG === "id" ? "Buku dalam cerita ini" : "Books in this story"}</div><h2>${LANG === "id" ? "Rak dari jurnal" : "The shelf"}</h2></div><a class="link" href="shop.html">${t("Check all books ↗")}</a></div>
            <div class="rail-wrap" data-rail-wrap>
              <div class="rail book-grid">${books.map(productCard).join("")}</div>
              <div class="rail-foot"><div class="progress"><span></span></div><div class="slide-arrows"><button class="arrow-btn" data-prev aria-label="Previous">←</button><button class="arrow-btn" data-next aria-label="Next">→</button></div></div>
            </div>
          </div>
        </div>` : ""}
        <div class="post-wrap">
          <div class="post-share"><a class="btn btn-dark btn-sm" href="https://wa.me/?text=${encodeURIComponent(p.title[i] + " — " + location.href)}" target="_blank" rel="noopener">${LANG === "id" ? "Bagikan ke WhatsApp ↗" : "Share on WhatsApp ↗"}</a> <a class="btn btn-dark btn-sm" href="journal.html">${LANG === "id" ? "Semua cerita ↗" : "All stories ↗"}</a></div>
        </div>
        ${related.length ? `<div class="container" style="margin-top:56px"><div class="section-head"><div><h2 style="font-size:2rem">${LANG === "id" ? "Cerita lainnya" : "More stories"}</h2></div></div><div class="post-grid">${related.map(x => postCard(x)).join("")}</div></div>` : ""}
      </article>`;
    initRails();
  }
  render(); RERENDER.push(render);
}
document.addEventListener("DOMContentLoaded", () => { initJournal(); initHomeJournal(); initPost(); });

/* =====================================================================
   App-style layer (patterns from Goodreads, Kindle, StoryGraph, Fable, Etsy via Appllama):
   bottom tab bar + mobile search, ranked top reads, "Popular in" feed, setup checklist, product page, mood chips
   ===================================================================== */
const TAGS_ALL = (typeof window !== "undefined" && window.BOOK_TAGS) || null;
const MOOD_LABEL = { grow: ["Grow", "Bertumbuh"], money: ["Money", "Uang"], calm: ["Calm", "Tenang"], heart: ["Heart", "Hati"], think: ["Think", "Berpikir"], escape: ["Escape", "Cerita"], laugh: ["Funny", "Lucu"], short: ["Quick read", "Bacaan cepat"], long: ["Big book", "Buku tebal"], classic: ["Classic", "Klasik"], gift: ["Gift-worthy", "Cocok hadiah"], kid0: ["Ages 0–4", "Usia 0–4"], kid5: ["Ages 5–8", "Usia 5–8"], kid9: ["Ages 9–12", "Usia 9–12"], teen: ["Teen", "Remaja"] };
function moodsOf(p) { if (!TAGS_ALL) return []; return Object.keys(MOOD_LABEL).filter(k => TAGS_ALL[k] && TAGS_ALL[k].has(p.id)); }
function moodChips(p, max = 3) { const m = moodsOf(p).slice(0, max); return m.length ? `<div class="moods">${m.map(k => `<a class="mood" href="shop.html?mood=${k}">${MOOD_LABEL[k][LANG === "id" ? 1 : 0]}</a>`).join("")}</div>` : ""; }
function productUrl(p) { return `product.html?id=${p.id}`; }

/* Bottom tab bar + mobile search row, injected on every page */
function initAppShell() {
  if (document.querySelector(".tabbar")) return;
  const path = location.pathname.split("/").pop() || "index.html";
  const L = (en, id) => (LANG === "id" ? id : en);
  const tabs = [
    ["index.html", "⌂", L("Home", "Beranda")], ["shop.html", "▦", L("Shop", "Belanja")], ["finder.html", "✦", L("Finder", "Pencari")], ["account.html", "◎", L("Club", "Club")]
  ];
  const bar = document.createElement("nav");
  bar.className = "tabbar";
  bar.setAttribute("aria-label", "Main");
  bar.innerHTML = tabs.map(([href, ic, lab]) => `<a href="${href}" class="${path === href ? "active" : ""}"><span class="ic">${ic}</span><span>${lab}</span></a>`).join("") +
    `<button data-open-cart><span class="ic">▭<b class="tab-count" data-cart-count>0</b></span><span>${L("Bag", "Tas")}</span></button>`;
  document.body.appendChild(bar);
  const header = document.querySelector(".site-header");
  if (header && !document.querySelector(".msearch")) {
    const row = document.createElement("form");
    row.className = "msearch"; row.setAttribute("data-search-form", "");
    row.innerHTML = `<input type="search" placeholder="${L("Title, author or ISBN", "Judul, penulis, atau ISBN")}" aria-label="Search"><button type="submit" aria-label="Search">↗</button>`;
    header.insertAdjacentElement("afterend", row);
    row.addEventListener("submit", e => { e.preventDefault(); const q = row.querySelector("input").value.trim(); location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : ""); });
  }
  Cart.render();
}

/* Home: category chips + ranked top reads + "Popular in" feed + setup checklist */
function initHomeFeed() {
  const chips = document.querySelector("[data-home-chips]");
  const top = document.querySelector("[data-top-reads]");
  const feed = document.querySelector("[data-popular-feed]");
  const check = document.querySelector("[data-setup]");
  if (!chips && !top && !feed && !check) return;
  const L = (en, id) => (LANG === "id" ? id : en);
  function render() {
    if (chips) {
      const cats = ["Fiction", "Self-Development", "Children", "Business", "Psychology", "Comics & Manga"];
      chips.innerHTML = `<a class="hchip active" href="shop.html">${t("All")}</a>` + cats.map(c => `<a class="hchip" href="shop.html?cat=${encodeURIComponent(c)}">${t(c)}</a>`).join("") + `<a class="hchip" href="shop.html?type=Gifts">${t("Gifts")}</a>`;
    }
    if (top) {
      const books = PRODUCTS.filter(p => p.type === "Books").sort((a, b) => b.sold - a.sold).slice(0, 10);
      top.innerHTML = books.map((p, i) => `
        <a class="ranked" href="${productUrl(p)}">
          <span class="rank-n">${i + 1}</span>
          ${p.cover ? `<img src="${p.cover}" alt="${p.title}" loading="lazy">` : `<span class="rank-tile" style="background:${colorOf(p)}">${p.title}</span>`}
          <strong>${p.title}</strong><span>${p.author}</span>
        </a>`).join("");
    }
    if (feed) {
      const cats = [["Fiction", L("Popular in Fiction", "Populer di Fiksi")], ["Self-Development", L("Trending this month in Self-Development", "Sedang tren di Pengembangan Diri")], ["Children", L("Kids' corner favourite", "Favorit pojok anak")], ["Business", L("Popular in Business", "Populer di Bisnis")]];
      feed.innerHTML = cats.map(([c, label]) => {
        const list = PRODUCTS.filter(p => p.category === c).sort((a, b) => b.sold - a.sold);
        const p = list[0]; if (!p) return "";
        const more = list.slice(1, 4);
        return `
          <article class="feed-card">
            <div class="feed-label">${label} <a href="shop.html?cat=${encodeURIComponent(c)}">${L("See all", "Lihat semua")} ↗</a></div>
            <div class="feed-main">
              <a href="${productUrl(p)}" class="feed-cover">${p.cover ? `<img src="${p.cover}" alt="${p.title}">` : `<span style="background:${colorOf(p)}">${p.title}</span>`}</a>
              <div class="feed-body">
                <a href="${productUrl(p)}"><h3>${p.title}</h3></a>
                <div class="author">${p.author} · ${p.publisher}</div>
                ${moodChips(p)}
                ${proof(p)}
                <div class="feed-actions"><button class="btn btn-dark btn-sm" data-add="${p.id}">${t("Add")} · ${money(p.price)}</button><a class="btn btn-sm btn-ghost" href="${productUrl(p)}">${L("Details", "Detail")} ↗</a></div>
              </div>
            </div>
            ${more.length ? `<div class="feed-more">${more.map(m => `<a href="${productUrl(m)}" title="${m.title}">${m.cover ? `<img src="${m.cover}" alt="${m.title}" loading="lazy">` : `<span style="background:${colorOf(m)}"></span>`}</a>`).join("")}<span class="muted">${L("Also popular", "Juga populer")}</span></div>` : ""}
          </article>`;
      }).join("");
    }
    if (check) {
      const member = Member.get();
      let finder = null; try { finder = JSON.parse(localStorage.getItem("wonder-finder-last")); } catch {}
      const items = [
        [!!finder, "finder.html", "✦", L("Find your next book", "Temukan buku berikutnya"), L("60-second quiz", "Kuis 60 detik")],
        [!!member, "account.html", "◎", L("Join Wonder Club", "Gabung Wonder Club"), L("Points on every purchase", "Poin dari setiap pembelian")],
        [!!(member && member.store), "stores.html", "⌂", L("Pick your home store", "Pilih toko langganan"), L("Six stores, Jakarta & Bali", "Enam toko, Jakarta & Bali")],
        [false, "https://www.instagram.com/wonderbookstoreofficial", "↗", L("Follow for events", "Ikuti untuk acara"), "@wonderbookstoreofficial"]
      ];
      const done = items.filter(i => i[0]).length;
      check.innerHTML = `
        <div class="setup">
          <div class="setup-head"><div><div class="label" style="opacity:.7">${L("Welcome!", "Selamat datang!")}</div><h3>${L("Let's get set up", "Mari kita mulai")}</h3></div><span class="setup-progress">${done}/${items.length}</span></div>
          ${items.map(([ok, href, ic, title, sub]) => `<a class="setup-row ${ok ? "done" : ""}" href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}><span class="ic">${ok ? "✓" : ic}</span><div><strong>${title}</strong><span>${sub}</span></div><span class="chev">›</span></a>`).join("")}
        </div>`;
    }
  }
  render(); RERENDER.push(render);
}

/* Product page: cover hero, details, by the same author, readers also bought */
function initProduct() {
  const root = document.querySelector("[data-product]");
  if (!root) return;
  const id = Number(new URLSearchParams(location.search).get("id"));
  const p = PRODUCTS.find(x => x.id === id);
  const L = (en, idn) => (LANG === "id" ? idn : en);
  function render() {
    if (!p) { root.innerHTML = `<div class="container"><div class="empty"><p>${L("Book not found.", "Buku tidak ditemukan.")}</p><a class="btn btn-dark btn-sm" href="shop.html">${t("Browse the shop ↗")}</a></div></div>`; return; }
    document.title = `${p.title} — Wonder Bookstore`;
    const byAuthor = PRODUCTS.filter(x => x.author === p.author && x.id !== p.id).sort((a, b) => b.sold - a.sold).slice(0, 8);
    const also = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id && x.type === p.type).sort((a, b) => b.sold - a.sold).slice(0, 8);
    const moods = moodsOf(p);
    root.innerHTML = `
      <section class="pdp-hero">
        <div class="container pdp-top">
          <a class="pdp-back" href="javascript:history.length>1?history.back():location.assign('shop.html')">← ${L("Back", "Kembali")}</a>
          <button class="pdp-share" data-share aria-label="Share">↗</button>
        </div>
        <div class="container pdp-grid">
          <div class="pdp-cover">${p.cover ? `<img src="${p.cover}" alt="${p.title}">` : `<div class="pdp-tile" style="background:${colorOf(p)}">${p.title}</div>`}</div>
          <div class="pdp-info">
            <div class="cat-row"><a class="cat" href="shop.html?cat=${encodeURIComponent(p.category)}">${t(p.category)}</a>${rankPill(p)}${coverBadge(p)}</div>
            <h1>${p.title}</h1>
            <div class="pdp-author">${L("by", "oleh")} <a href="shop.html?q=${encodeURIComponent(p.author)}">${p.author}</a> · ${p.publisher}</div>
            ${moods.length ? `<div class="moods">${moods.map(k => `<a class="mood" href="shop.html?mood=${k}">${MOOD_LABEL[k][LANG === "id" ? 1 : 0]}</a>`).join("")}</div>` : ""}
            ${proof(p)}
            <div class="pdp-price"><span class="price">${money(p.price)}</span>${stockLabel(p)}</div>
            <div class="pdp-ctas">
              <button class="btn btn-dark" data-add="${p.id}">${L("Add to bag ↗", "Masukkan ke tas ↗")}</button>
              <a class="btn btn-ghost" href="checkout.html" data-buy="${p.id}">${L("Buy now · pickup or ship", "Beli sekarang · ambil atau kirim")}</a>
            </div>
            <p class="form-note">${L("Free pickup at any of six stores within 2 hours. Shipping free from Rp 350.000.", "Ambil gratis di enam toko dalam 2 jam. Gratis ongkir mulai Rp 350.000.")}</p>
          </div>
        </div>
      </section>
      <section class="section light" style="padding-top:36px">
        <div class="container pdp-body">
          <div class="pdp-tabs"><button class="seg active" data-ptab="about">${L("About", "Tentang")}</button><button class="seg" data-ptab="details">${L("Details", "Detail")}</button><button class="seg" data-ptab="stores">${L("In store", "Di toko")}</button></div>
          <div class="ptab" data-pane="about">
            <p>${L("Ask the bookseller for a summary and why readers love it:", "Tanya penjaga toko untuk ringkasan dan alasan pembaca menyukainya:")} <a href="finder.html" style="text-decoration:underline">${L("Ask about this book ↗", "Tanya tentang buku ini ↗")}</a></p>
            <p class="muted">${L("Publisher descriptions are being added to the catalogue. Until then the store team can tell you about any title on WhatsApp.", "Deskripsi penerbit sedang ditambahkan ke katalog. Sementara itu tim toko bisa menceritakan judul apa pun lewat WhatsApp.")}</p>
          </div>
          <div class="ptab" data-pane="details" hidden>
            <dl class="meta-grid">
              <div><dt>${t("Publisher")}</dt><dd>${p.publisher}</dd></div>
              ${p.isbn ? `<div><dt>ISBN</dt><dd>${p.isbn}</dd></div>` : ""}
              <div><dt>${L("Category", "Kategori")}</dt><dd>${t(p.category)}</dd></div>
              <div><dt>${L("Language", "Bahasa")}</dt><dd>${L("English", "Inggris")}</dd></div>
              <div><dt>${L("Sold last month", "Terjual bulan lalu")}</dt><dd>${p.sold}</dd></div>
              <div><dt>${L("Availability", "Ketersediaan")}</dt><dd>${t(p.inStock ? "In stock" : "On request")}</dd></div>
            </dl>
          </div>
          <div class="ptab" data-pane="stores" hidden>
            <div class="store-list">${STORES.map(s => `<a class="store-li" href="stores.html#${s.id}"><div><strong>${s.name}</strong><span>${LANG === "id" ? s.areaId : s.area}</span></div><span class="pill ${p.inStock ? "ok" : ""}">${p.inStock ? L("Ask to reserve", "Minta disimpan") : L("Order in", "Pesan")}</span></a>`).join("")}</div>
            <p class="form-note">${L("Per-store stock arrives with the inventory sync. Pickup orders are confirmed by the store on WhatsApp.", "Stok per toko akan hadir dengan sinkronisasi inventori. Pesanan ambil di toko dikonfirmasi lewat WhatsApp.")}</p>
          </div>
        </div>
      </section>
      ${byAuthor.length ? rail(L("Other books by", "Buku lain oleh") + " " + p.author, byAuthor, "shop.html?q=" + encodeURIComponent(p.author)) : ""}
      ${also.length ? rail(L("Readers also bought", "Pembaca juga membeli"), also, "shop.html?cat=" + encodeURIComponent(p.category)) : ""}`;
    initRails();
    document.querySelectorAll("[data-rail-wrap]").forEach(w => w.dispatchEvent(new Event("scroll")));
  }
  function rail(title, list, href) {
    return `<section class="section light" style="padding-top:0"><div class="container">
      <div class="rail-head"><h2 style="font-size:1.6rem">${title}</h2><a class="link" href="${href}">${t("Check all books ↗")}</a></div>
      <div class="rail-wrap" data-rail-wrap><div class="rail book-grid">${list.map(productCard).join("")}</div>
      <div class="rail-foot"><div class="progress"><span></span></div><div class="slide-arrows"><button class="arrow-btn" data-prev aria-label="Previous">←</button><button class="arrow-btn" data-next aria-label="Next">→</button></div></div></div>
    </div></section>`;
  }
  root.addEventListener("click", e => {
    const tb = e.target.closest("[data-ptab]");
    if (tb) { root.querySelectorAll("[data-ptab]").forEach(b => b.classList.toggle("active", b === tb)); root.querySelectorAll("[data-pane]").forEach(pn => pn.hidden = pn.dataset.pane !== tb.dataset.ptab); return; }
    if (e.target.closest("[data-buy]")) { if (!Cart.items.find(i => i.id === p.id)) Cart.add(p.id); return; }
    if (e.target.closest("[data-share]")) {
      const url = location.href;
      if (navigator.share) navigator.share({ title: p.title, url }).catch(() => {});
      else { navigator.clipboard && navigator.clipboard.writeText(url); showToast(L("Link copied", "Tautan disalin")); }
    }
  });
  render(); RERENDER.push(render);
}

/* Cards link to the product page; shop supports ?mood= */
document.addEventListener("DOMContentLoaded", () => {
  initAppShell(); initHomeFeed(); initProduct();
  document.body.addEventListener("click", e => {
    if (e.target.closest("button, a, input, select, label")) return;
    const card = e.target.closest(".book-card, .book-row, .book-tile, .trend");
    if (!card) return;
    const add = card.querySelector("[data-add]");
    if (add) location.href = productUrl({ id: Number(add.dataset.add) });
  });
});

/* =====================================================================
   Web redesign (Mobbin patterns): category nav row, shop filter sidebar, club tier tabs
   ===================================================================== */
function initCatNav() {
  const header = document.querySelector(".site-header");
  if (!header || document.querySelector(".catnav")) return;
  const L = (en, id) => (LANG === "id" ? id : en);
  const path = location.pathname.split("/").pop() || "index.html";
  const items = [
    ["shop.html?col=best", L("Bestsellers", "Terlaris")], ["shop.html?cat=Fiction", t("Fiction")], ["shop.html?cat=Self-Development", L("Self-development", "Pengembangan diri")],
    ["shop.html?cat=Children", L("Children", "Anak")], ["shop.html?cat=Comics+%26+Manga", L("Comics & manga", "Komik & manga")], ["shop.html?cat=Business", t("Business")],
    ["shop.html?type=Gifts", L("Gifts", "Hadiah")], ["shop.html?type=Stationery", L("Stationery", "Alat tulis")], ["brands.html", L("Brands", "Brand")],
    ["finder.html", L("Book finder", "Pencari buku")], ["journal.html", L("Journal", "Jurnal")], ["stores.html", L("Stores", "Toko")]
  ];
  const nav = document.createElement("nav");
  nav.className = "catnav"; nav.setAttribute("aria-label", "Categories");
  const render = () => { nav.innerHTML = `<div class="container">${items.map(([href, label]) => `<a href="${href}" class="${href.split("?")[0] === path && (href.includes("?") ? location.search.includes(href.split("?")[1].split("=")[1].slice(0, 4)) : true) ? "active" : ""}">${label}</a>`).join("")}</div>`; };
  render();
  const ms = document.querySelector(".msearch");
  (ms || header).insertAdjacentElement("afterend", nav);
  RERENDER.push(render);
}

/* Filter sidebar for the shop page (desktop) */
function initShopFilters() {
  const side = document.querySelector("[data-filters]");
  if (!side) return;
  const L = (en, id) => (LANG === "id" ? id : en);
  function render() {
    const params = new URLSearchParams(location.search);
    const cur = { type: params.get("type") || "All", cat: params.get("cat") || "All", brand: params.get("brand") || "All", mood: params.get("mood") || "", col: params.get("col") || "all" };
    const count = (fn) => PRODUCTS.filter(fn).length;
    const cats = {}; PRODUCTS.filter(p => p.type === "Books").forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
    const brands = {}; PRODUCTS.forEach(p => brands[p.brand] = (brands[p.brand] || 0) + 1);
    const link = (q, label, n, on) => `<a class="f-item ${on ? "on" : ""}" href="shop.html${q}">${label}${n !== undefined ? `<span>${n}</span>` : ""}</a>`;
    side.innerHTML = `
      <div class="f-group">
        <h4>${L("Shop", "Belanja")}</h4>
        ${link("", L("All products", "Semua produk"), PRODUCTS.length, cur.type === "All" && cur.cat === "All" && cur.col === "all" && !cur.mood && cur.brand === "All")}
        ${link("?col=best", L("Bestsellers", "Terlaris"), TOP_N, cur.col === "best")}
        ${link("?col=picks", t("Store favourites"), count(p => p.pick), cur.col === "picks")}
        ${link("?col=stock", t("In stock"), count(p => p.inStock), cur.col === "stock")}
      </div>
      <div class="f-group">
        <h4>${L("Books", "Buku")}</h4>
        ${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => link("?cat=" + encodeURIComponent(c), t(c), n, cur.cat === c)).join("")}
      </div>
      <div class="f-group">
        <h4>${L("Gifts & stationery", "Hadiah & alat tulis")}</h4>
        ${link("?type=Gifts", t("Gifts"), count(p => p.type === "Gifts"), cur.type === "Gifts")}
        ${link("?type=Stationery", t("Stationery"), count(p => p.type === "Stationery"), cur.type === "Stationery")}
      </div>
      <div class="f-group">
        <h4>${L("Mood", "Suasana")}</h4>
        <div class="f-chips">${Object.keys(MOOD_LABEL).filter(k => !/^kid|teen/.test(k)).map(k => `<a class="mood ${cur.mood === k ? "on" : ""}" href="shop.html?mood=${k}">${MOOD_LABEL[k][LANG === "id" ? 1 : 0]}</a>`).join("")}</div>
      </div>
      <div class="f-group">
        <h4>${L("For kids", "Untuk anak")}</h4>
        <div class="f-chips">${["kid0", "kid5", "kid9", "teen"].map(k => `<a class="mood ${cur.mood === k ? "on" : ""}" href="shop.html?mood=${k}">${MOOD_LABEL[k][LANG === "id" ? 1 : 0]}</a>`).join("")}</div>
      </div>
      <div class="f-group">
        <h4>${L("Brands", "Brand")}</h4>
        ${Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 9).map(([b, n]) => link("?brand=" + encodeURIComponent(b), b, n, cur.brand === b)).join("")}
        <a class="f-item" href="brands.html">${L("All brands", "Semua brand")} ↗</a>
      </div>`;
  }
  render(); RERENDER.push(render);
}
document.addEventListener("DOMContentLoaded", () => { initCatNav(); initShopFilters(); });

/* Social links in the footer (Instagram, Threads, WhatsApp, LinkedIn) */
const SOCIALS = [
  ["Instagram", "https://www.instagram.com/wonderbookstoreofficial", '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7.1.1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.7-2.1 1.4C1.3 2.6.9 3.3.6 4.1.3 4.9.1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.3 2.2.6 3 .3.8.7 1.5 1.4 2.1.6.6 1.3 1.1 2.1 1.4.8.3 1.7.5 3 .6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.2-.3 3-.6.8-.3 1.5-.7 2.1-1.4.6-.6 1.1-1.3 1.4-2.1.3-.8.5-1.7.6-3 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.2-.6-3-.3-.8-.7-1.5-1.4-2.1C21.4 1.3 20.7.9 19.9.6c-.8-.3-1.7-.5-3-.6C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>'],
  ["Threads", "https://www.threads.net/@wonderbookstoreofficial", '<svg viewBox="0 0 24 24"><path d="M12.2 24h-.1c-3.6 0-6.3-1.2-8.1-3.6C2.4 18.3 1.6 15.4 1.5 12v-.1C1.6 8.6 2.4 5.7 4 3.6 5.8 1.2 8.5 0 12.1 0h.1c2.7 0 5 .7 6.8 2.1 1.7 1.3 2.8 3.1 3.5 5.4l-2 .6c-1.1-3.7-3.8-5.9-8.3-6-2.9 0-5.1.9-6.5 2.8-1.4 1.7-2.1 4.2-2.1 7.2 0 3 .7 5.5 2.1 7.2 1.4 1.9 3.6 2.8 6.5 2.8 2.6 0 4.4-.6 5.8-2 1.6-1.6 1.6-3.5 1.1-4.7-.3-.7-.9-1.3-1.6-1.7-.2 1.5-.6 2.6-1.4 3.5-1 1.1-2.4 1.7-4.2 1.8-1.4.1-2.7-.3-3.7-1-1.2-.8-1.9-2.1-2-3.6-.1-1.4.5-2.8 1.6-3.7 1.1-.9 2.6-1.4 4.4-1.5 1.3-.1 2.5 0 3.6.3-.1-.9-.4-1.6-.9-2.1-.6-.6-1.5-1-2.6-1h-.1c-1 0-2.3.3-3.1 1.5l-1.7-1.2C9.5 4.9 11.2 4.3 13 4.3h.1c3.2 0 5.1 2 5.3 5.4.3.1.5.2.8.4 1.3.7 2.3 1.8 2.8 3.2.7 1.9.8 5-1.6 7.3-1.8 1.8-4 2.6-7 2.6h-.2zm.5-11.6c-.3 0-.6 0-.9.1-2.2.1-3.6 1.1-3.5 2.6.1 1.5 1.7 2.2 3.3 2.1 1.4-.1 3.3-.6 3.6-4.3-.8-.3-1.6-.5-2.5-.5z"/></svg>'],
  ["WhatsApp", "stores.html#contact", '<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5C18.6 23.8 24 18.5 24 11.9S18.6 0 12 0z"/></svg>'],
  ["LinkedIn", "https://www.linkedin.com/company/wonder-bookstore", '<svg viewBox="0 0 24 24"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.5c0 1 .8 1.8 1.8 1.8h20.4c1 0 1.8-.8 1.8-1.8V1.7C24 .8 23.2 0 22.2 0z"/></svg>'],
];
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".socials").forEach(box => {
    box.innerHTML = SOCIALS.map(([name, href, svg]) => `<a href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} aria-label="${name}" title="${name}">${svg}</a>`).join("");
  });
});

/* =====================================================================
   Open Library enrichment (synopsis, pages, rating) + Goodreads link on the book page
   ===================================================================== */
const OL_CACHE_KEY = "wonder-ol-v1";
function olCache() { try { return JSON.parse(localStorage.getItem(OL_CACHE_KEY)) || {}; } catch { return {}; } }
async function olFetch(url) { const r = await fetch(url, { headers: { Accept: "application/json" } }); if (!r.ok) throw new Error(r.status); return r.json(); }
async function openLibrary(isbn) {
  const cache = olCache();
  const hit = cache[isbn];
  if (hit && Date.now() - hit.at < 7 * 24 * 3600 * 1000) return hit.data;
  const out = { description: "", pages: null, published: "", subjects: [], rating: null, ratings: 0, workKey: "" };
  try {
    const ed = await olFetch(`https://openlibrary.org/isbn/${isbn}.json`);
    out.pages = ed.number_of_pages || null; out.published = ed.publish_date || "";
    const d = ed.description; if (d) out.description = typeof d === "string" ? d : d.value || "";
    const work = ed.works && ed.works[0] && ed.works[0].key;
    if (work) {
      out.workKey = work;
      const [w, r] = await Promise.all([olFetch(`https://openlibrary.org${work}.json`).catch(() => null), olFetch(`https://openlibrary.org${work}/ratings.json`).catch(() => null)]);
      if (w) { if (!out.description && w.description) out.description = typeof w.description === "string" ? w.description : w.description.value || ""; out.subjects = (w.subjects || []).slice(0, 6); }
      if (r && r.summary && r.summary.count) { out.rating = Math.round(r.summary.average * 10) / 10; out.ratings = r.summary.count; }
    }
  } catch (e) { /* leave defaults */ }
  cache[isbn] = { at: Date.now(), data: out };
  try { localStorage.setItem(OL_CACHE_KEY, JSON.stringify(cache)); } catch {}
  return out;
}
function cleanDescription(s) {
  return String(s).replace(/\r/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1").replace(/^-{3,}[\s\S]*$/m, "").replace(/\(\[source\]\[\d+\]\)/g, "").replace(/\s*\[\d+\]:\s*\S+/g, "").trim();
}
async function enrichProduct(p) {
  const about = document.querySelector('[data-pane="about"]');
  const details = document.querySelector('[data-pane="details"] .meta-grid');
  if (!about || !p) return;
  const L = (en, id) => (LANG === "id" ? id : en);
  const gr = p.isbn ? `https://www.goodreads.com/search?q=${p.isbn}` : `https://www.goodreads.com/search?q=${encodeURIComponent(p.title + " " + p.author)}`;
  const grLink = `<p class="form-note" style="margin-top:14px"><a href="${gr}" target="_blank" rel="nofollow noopener" data-track="goodreads">${L("Reviews on Goodreads ↗", "Ulasan di Goodreads ↗")}</a></p>`;
  if (!p.isbn || p.type !== "Books") { about.insertAdjacentHTML("beforeend", grLink); return; }
  about.insertAdjacentHTML("afterbegin", `<p class="muted" data-ol-loading style="font-size:.9rem">${L("Loading description…", "Memuat deskripsi…")}</p>`);
  const ol = await openLibrary(p.isbn);
  const loading = about.querySelector("[data-ol-loading]"); if (loading) loading.remove();
  const desc = cleanDescription(ol.description || "");
  if (desc) {
    const short = desc.length > 900 ? desc.slice(0, 900).replace(/\s+\S*$/, "") + "…" : desc;
    about.innerHTML = `
      ${ol.rating ? `<div class="ol-rating"><span class="stars">${"★".repeat(Math.round(ol.rating))}${"☆".repeat(5 - Math.round(ol.rating))}</span> <strong>${ol.rating}</strong> <span class="muted">· ${ol.ratings.toLocaleString(LANG === "id" ? "id-ID" : "en-US")} ${L("ratings on Open Library", "penilaian di Open Library")}</span></div>` : ""}
      <div class="ol-desc" data-full="${encodeURIComponent(desc)}"><p>${short.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>${desc.length > 900 ? `<button class="btn btn-dark btn-sm" data-ol-more>${L("Read more", "Baca selengkapnya")}</button>` : ""}</div>
      ${ol.subjects.length ? `<div class="moods" style="margin-top:14px">${ol.subjects.map(s => `<a class="mood" href="shop.html?q=${encodeURIComponent(s)}">${s}</a>`).join("")}</div>` : ""}
      <p class="form-note">${L("Description and rating from Open Library.", "Deskripsi dan penilaian dari Open Library.")}</p>
      ${grLink}`;
  } else {
    about.insertAdjacentHTML("beforeend", grLink);
  }
  if (details) {
    if (ol.pages) details.insertAdjacentHTML("beforeend", `<div><dt>${L("Pages", "Halaman")}</dt><dd>${ol.pages}</dd></div>`);
    if (ol.published) details.insertAdjacentHTML("beforeend", `<div><dt>${L("Published", "Terbit")}</dt><dd>${ol.published}</dd></div>`);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-product]");
  if (!root) return;
  const id = Number(new URLSearchParams(location.search).get("id"));
  const p = PRODUCTS.find(x => x.id === id);
  const run = () => enrichProduct(p);
  setTimeout(run, 0);
  RERENDER.push(() => setTimeout(run, 0));
  root.addEventListener("click", e => {
    const more = e.target.closest("[data-ol-more]");
    if (more) { const box = more.closest(".ol-desc"); const full = decodeURIComponent(box.dataset.full); box.innerHTML = `<p>${full.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`; return; }
    const tr = e.target.closest("[data-track]");
    if (tr && window.dataLayer) window.dataLayer.push({ event: "outbound_" + tr.dataset.track, id });
  });
});

/* Fallback covers from Open Library for titles without a local cover file */
document.addEventListener("DOMContentLoaded", () => {
  const fix = () => {
    document.querySelectorAll(".cover:not(.has-img):not([data-ol-tried]), .pdp-tile:not([data-ol-tried]), .thumb:not(.has-img):not([data-ol-tried])").forEach(el => {
      el.dataset.olTried = "1";
      const addBtn = el.querySelector("[data-add]") || el.closest(".book-card, .book-row, .book-tile, .trend, .pdp-hero")?.querySelector("[data-add]");
      const id = addBtn ? Number(addBtn.dataset.add) : Number(new URLSearchParams(location.search).get("id"));
      const p = PRODUCTS.find(x => x.id === id);
      if (!p || !p.isbn || p.type !== "Books") return;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth < 50) return;
        if (el.classList.contains("pdp-tile")) { const wrap = el.parentElement; wrap.innerHTML = `<img src="${img.src}" alt="${p.title}">`; return; }
        el.classList.add("has-img"); el.style.background = "";
        const keep = el.querySelector(".badge, .quick-add") ? [...el.querySelectorAll(".badge, .quick-add")].map(n => n.outerHTML).join("") : "";
        el.innerHTML = `<img src="${img.src}" alt="${p.title}" loading="lazy">${keep}`;
      };
      img.src = `https://covers.openlibrary.org/b/isbn/${p.isbn}-M.jpg?default=false`;
    });
  };
  fix(); RERENDER.push(fix);
  new MutationObserver(() => fix()).observe(document.body, { childList: true, subtree: true });
});
