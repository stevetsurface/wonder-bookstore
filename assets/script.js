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
      (!q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.isbn || "").includes(q)));
    switch (sort.value) {
      case "best": list.sort((a, b) => b.sold - a.sold); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: list.sort((a, b) => (BEST_RANK[a.id] || 99) - (BEST_RANK[b.id] || 99) || (b.pick ? 1 : 0) - (a.pick ? 1 : 0) || b.sold - a.sold);
    }
    count.textContent = `${list.length} ${t(list.length === 1 ? "item" : "items")}` + (type !== "All" ? ` · ${t(type)}` : "") + (category !== "All" ? ` · ${t(category)}` : "");
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
