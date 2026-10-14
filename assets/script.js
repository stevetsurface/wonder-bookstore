/* Wonder Bookstore — catalogue, bag, filters */

const PRODUCTS = [
  // Books (titles carried per the store's product highlights; prices are placeholders)
  { id: 1, recent: 7, staff: "Ashta District 8", rating: 4.9,  type: "Books", category: "Self-Development", title: "Atomic Habits", author: "James Clear", format: "Hardcover", price: 289000, color: "#f4efe4", light: true, badge: "Bestseller" },
  { id: 2, recent: 4, rating: 4.7,  type: "Books", category: "Fiction", title: "The Silent Patient", author: "Alex Michaelides", format: "Paperback", price: 199000, color: "#2b2b2b", badge: "Bestseller" },
  { id: 3, staff: "Hublife", rating: 4.6,  type: "Books", category: "Business", title: "The Art of Thinking Clearly", author: "Rolf Dobelli", format: "Paperback", price: 229000, color: "#dfe5d3", light: true },
  { id: 4, rating: 4.5,  type: "Books", category: "Classics", title: "The Art of War", author: "Sun Tzu", format: "Paperback", price: 149000, color: "#6b2f2a" },
  { id: 5, recent: 3, staff: "Berawa", rating: 4.8,  type: "Books", category: "Self-Development", title: "When Things Don't Go Your Way", author: "Haemin Sunim", format: "Paperback", price: 259000, color: "#f0b84a", light: true, badge: "Staff pick" },
  { id: 6, recent: 5, rating: 4.9,  type: "Books", category: "Children", title: "Dog Man: A Tale of Two Kitties", author: "Dav Pilkey", format: "Paperback", price: 189000, color: "#1e5fa8" },
  { id: 7, staff: "TSM Bali", rating: 4.5,  type: "Books", category: "Fiction", title: "The Stranger in the Lifeboat", author: "Mitch Albom", format: "Paperback", price: 219000, color: "#1b3a5c" },
  { id: 8, rating: 4.7,  type: "Books", category: "Fiction", title: "The Five People You Meet in Heaven", author: "Mitch Albom", format: "Paperback", price: 199000, color: "#e8dcc4", light: true },
  { id: 9, recent: 2, staff: "Pondok Indah Mall 5", rating: 4.8,  type: "Books", category: "Self-Development", title: "The Book You Wish Your Parents Had Read", author: "Philippa Perry", format: "Hardcover", price: 249000, color: "#e2521f", badge: "Staff pick" },
  { id: 10, recent: 6, rating: 4.9, type: "Books", category: "Children", title: "Dog Man and Cat Kid", author: "Dav Pilkey", format: "Paperback", price: 189000, color: "#3f8a3a" },
  // Gifts & stationery (brands the store carries; prices are placeholders)
  { id: 11, recent: 9, rating: 4.6, type: "Gifts", category: "Gifts", title: "The Really Tiny Book Light", author: "IF", price: 129000, color: "#e8432b", badge: "Gift idea" },
  { id: 12, staff: "Ashta District 8", rating: 4.7, type: "Gifts", category: "Gifts", title: "Music Box — La Vie en Rose", author: "Kikkerland", price: 159000, color: "#f2c52c", light: true },
  { id: 13, rating: 4.5, type: "Gifts", category: "Gifts", title: "Mini Wooden Hammer Multi-Tool", author: "Kikkerland", price: 249000, color: "#3d3d3d" },
  { id: 14, rating: 4.4, type: "Gifts", category: "Gifts", title: "Flip-On Bottle Buddy", author: "Kikkerland", price: 99000, color: "#5a7a4c" },
  { id: 15, recent: 3, rating: 4.8, type: "Stationery", category: "Stationery", title: "Fabulously Flat Paper Pens", author: "IF", price: 189000, color: "#f6f1e6", light: true, badge: "Gift idea" },
  { id: 16, staff: "TSM Cibubur", rating: 4.3, type: "Stationery", category: "Stationery", title: "Cable Ties, set of 6", author: "Kikkerland", price: 79000, color: "#c8396b" },
];

const TYPES = ["All", "Books", "Gifts", "Stationery"];

/* ---------- Money ---------- */
function money(n) { return "Rp " + n.toLocaleString("id-ID"); }

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
    showToast("Added to your bag — " + PRODUCTS.find(p => p.id === id).title);
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
  render() {
    document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = this.count());
    const body = document.querySelector("[data-cart-items]");
    const totalEl = document.querySelector("[data-cart-total]");
    const checkout = document.querySelector("[data-checkout]");
    if (!body) return;
    if (this.items.length === 0) {
      body.innerHTML = '<div class="empty"><p>Your bag is empty.</p><a class="btn btn-dark btn-sm" href="shop.html">Browse the shop ↗</a></div>';
    } else {
      body.innerHTML = this.items.map(i => {
        const p = PRODUCTS.find(x => x.id === i.id);
        return `
          <div class="cart-item">
            <div class="mini" style="background:${p.color}"></div>
            <div>
              <h4>${p.title}</h4>
              <div class="author">${p.author}</div>
              <div class="qty">
                <button data-qty="-1" data-id="${p.id}" aria-label="Decrease">−</button>
                <span>${i.qty}</span>
                <button data-qty="1" data-id="${p.id}" aria-label="Increase">+</button>
              </div>
              <button class="remove" data-remove="${p.id}">Remove</button>
            </div>
            <div class="price">${money(p.price * i.qty)}</div>
          </div>`;
      }).join("");
    }
    if (totalEl) totalEl.textContent = money(this.total());
    if (checkout) checkout.disabled = this.items.length === 0;
  }
};

/* ---------- Cards ---------- */
function proof(p) {
  const rows = [];
  if (p.recent) rows.push(`<span class="proof hot"><i></i>${p.recent} bought in the last 24 hours</span>`);
  if (p.staff) rows.push(`<span class="proof"><i></i>Recommended by the ${p.staff} team</span>`);
  return rows.length ? `<div class="proof-row">${rows.join("")}</div>` : "";
}
function stars(r) { const n = Math.round(r); return "★".repeat(n) + "☆".repeat(5 - n) + " " + r.toFixed(1); }
function productCard(p) {
  const isBook = p.type === "Books";
  return `
    <article class="book-card">
      <div class="cover ${p.light ? "light" : ""}" style="background:${p.color}">
        ${!isBook ? `<span class="brand-tag">${p.author}</span>` : ""}
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <div class="cover-title">${p.title}</div>
        ${isBook ? `<div class="cover-author">${p.author}</div>` : ""}
        <div class="quick-add"><button class="btn btn-sm" data-add="${p.id}">Quick add ↗</button></div>
      </div>
      <div class="book-body">
        <span class="cat">${p.category}</span>
        <h3>${p.title}</h3>
        <span class="author">${p.author}</span>
        <div class="meta-row"><span class="stars">${stars(p.rating)}</span>${p.format ? `<span class="format">${p.format}</span>` : ""}</div>
        ${proof(p)}
        <div class="book-foot">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-dark btn-sm" data-add="${p.id}">Add</button>
        </div>
      </div>
    </article>`;
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Shop page ---------- */
function initShop() {
  const grid = document.querySelector("[data-shop-grid]");
  if (!grid) return;
  const tabs = document.querySelector("[data-tabs]");
  const chips = document.querySelector("[data-chips]");
  const search = document.querySelector("[data-search]");
  const sort = document.querySelector("[data-sort]");
  const count = document.querySelector("[data-results]");
  const params = new URLSearchParams(location.search);
  let type = TYPES.includes(params.get("type")) ? params.get("type") : "All";
  let category = params.get("cat") || "All";
  if (params.get("q")) search.value = params.get("q");

  function categoriesFor(t) {
    const list = PRODUCTS.filter(p => t === "All" || p.type === t).map(p => p.category);
    return ["All", ...Array.from(new Set(list))];
  }
  function renderTabs() {
    tabs.innerHTML = TYPES.map(t => `<button class="tab ${t === type ? "active" : ""}" data-type="${t}">${t}</button>`).join("");
    const cats = categoriesFor(type);
    if (!cats.includes(category)) category = "All";
    chips.innerHTML = cats.map(c => `<button class="chip ${c === category ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
  }
  function render() {
    const q = (search.value || "").toLowerCase().trim();
    let list = PRODUCTS.filter(p => (type === "All" || p.type === type) && (category === "All" || p.category === category) &&
      (!q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)));
    switch (sort.value) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    count.textContent = `${list.length} ${list.length === 1 ? "item" : "items"}` + (type !== "All" ? ` · ${type}` : "") + (category !== "All" ? ` · ${category}` : "");
    grid.innerHTML = list.length ? list.map(productCard).join("") : '<div class="empty"><p>Nothing matches that search.</p></div>';
  }
  function syncUrl() {
    const url = new URL(location.href);
    type === "All" ? url.searchParams.delete("type") : url.searchParams.set("type", type);
    category === "All" ? url.searchParams.delete("cat") : url.searchParams.set("cat", category);
    history.replaceState(null, "", url);
  }
  tabs.addEventListener("click", e => {
    const b = e.target.closest("[data-type]"); if (!b) return;
    type = b.dataset.type; category = "All"; renderTabs(); syncUrl(); render();
  });
  chips.addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    category = b.dataset.cat; renderTabs(); syncUrl(); render();
  });
  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  renderTabs(); render();
}

/* ---------- Home ---------- */
function initHome() {
  const featured = document.querySelector("[data-featured]");
  if (featured) featured.innerHTML = PRODUCTS.filter(p => p.type === "Books").sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0)).map(productCard).join("");
  const gifts = document.querySelector("[data-gifts]");
  if (gifts) gifts.innerHTML = PRODUCTS.filter(p => p.type !== "Books").map(productCard).join("");
  const kids = document.querySelector("[data-kids]");
  if (kids) kids.innerHTML = PRODUCTS.filter(p => p.category === "Children" || p.category === "Self-Development").map(productCard).join("");
}

/* ---------- Rails (horizontal carousels) ---------- */
function initRails() {
  document.querySelectorAll("[data-rail-wrap]").forEach(wrap => {
    const rail = wrap.querySelector(".rail");
    const prev = wrap.querySelector("[data-prev]");
    const next = wrap.querySelector("[data-next]");
    const bar = wrap.querySelector(".progress span");
    const step = () => (rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 20 : 300);
    function update() {
      const max = rail.scrollWidth - rail.clientWidth;
      const frac = rail.clientWidth / rail.scrollWidth;
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
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    dotEls.forEach((d, k) => d.classList.toggle("active", k === i));
  }
  function auto() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
  dotEls.forEach((d, k) => d.addEventListener("click", () => { go(k); auto(); }));
  show.querySelector("[data-prev]").addEventListener("click", () => { go(i - 1); auto(); });
  show.querySelector("[data-next]").addEventListener("click", () => { go(i + 1); auto(); });
  go(0); auto();
}

/* ---------- Header: search + mega menu (mobile tap) ---------- */
function initHeader() {
  const form = document.querySelector("[data-search-form]");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const q = form.querySelector("input").value.trim();
    location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });
  document.querySelectorAll(".nav-links li.has-menu > a").forEach(a => {
    a.addEventListener("click", e => {
      if (window.matchMedia("(max-width: 680px)").matches) { e.preventDefault(); a.parentElement.classList.toggle("open"); }
    });
  });
}

/* ---------- Forms ---------- */
function initForms() {
  document.querySelectorAll("form[data-demo-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const success = form.querySelector(".form-success") || form.parentElement.querySelector(".form-success");
      if (success) success.style.display = "block"; else showToast("Thanks — we'll be in touch.");
      form.reset();
    });
  });
}

/* ---------- Wiring ---------- */
document.addEventListener("DOMContentLoaded", () => {
  Cart.load(); Cart.render(); initHome(); initShop(); initForms(); initRails(); initSlideshow(); initHeader();

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
    if (e.target.closest("[data-checkout]")) showToast("Checkout coming soon — " + Cart.count() + " item(s), " + money(Cart.total()));
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("cart-open"); });
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
});
