/* Booky Scout: Wonder's weekly scouting report on what is moving in English-language books.
   Issues live in SCOUT_ISSUES. Rows reference catalogue ids where the title is on our shelves. */
window.SCOUT_ISSUES = [
  {
    week: "2026-10-26", number: 1, sample: true,
    intro: ["First issue, built from April unit sales across the six stores plus the Bestsellers Compass source list. International and local signal rows are examples of the format until the Monday Compass run feeds them.",
            "Edisi pertama, dibangun dari penjualan unit April di enam toko plus daftar sumber Bestsellers Compass. Baris sinyal internasional dan lokal adalah contoh format sampai hasil Compass hari Senin masuk."],
    sources: { intl: ["Publishers Weekly", "NYT", "USA Today", "Indie Bestsellers (ABA)", "Waterstones", "Amazon Charts (partial)", "BookTok composite (partial)", "Goodreads (partial)"],
               local: ["Periplus", "Gramedia International", "Kinokuniya ID", "Tokopedia", "Shopee", "TikTok Shop ID", "Indonesian press", "Bookstagram ID"], own: ["Wonder POS, six stores", "Sinar Starbooks reseller orders"] },
    rows: [
      { rule: 1, id: 1, action: "deep", intl: ["NYT #1 Nonfiction", "PW #2", "USA Today"], local: ["Tokopedia top 10", "Periplus"], why: ["On three international lists and two local ones; already our #3 seller.", "Masuk tiga daftar internasional dan dua lokal; sudah penjual #3 kami."], example: true },
      { rule: 2, id: 2, action: "reorder", intl: ["Indie Bestsellers"], local: [], evergreen: true, why: ["Evergreen that out-sold everything in April (104 units). Reorder before it runs out.", "Evergreen yang terjual paling banyak di April (104 unit). Pesan ulang sebelum habis."] },
      { rule: 2, id: 50, action: "reorder", intl: ["NYT Children's Series #1"], local: ["Gramedia"], evergreen: true, why: ["Dog Man series keeps charting; #14 is our second seller.", "Seri Dog Man terus masuk daftar; #14 penjual kedua kami."], example: true },
      { rule: 3, id: 20, action: "investigate", intl: [], local: ["Bookstagram ID", "TikTok Shop ID"], why: ["Indonesia-only lift from BookTok translations; check Japanese fiction shelf depth.", "Naik hanya di Indonesia lewat terjemahan BookTok; cek kedalaman rak fiksi Jepang."], example: true },
      { rule: 4, title: "Katabasis", author: "R.F. Kuang", publisher: "Harper Voyager", id: 32, action: "soft", intl: ["NYT #1 Fiction", "PW #1", "Waterstones", "Indie"], local: [], why: ["Global hit, no local signal yet. Soft buy, watch for Periplus or Tokopedia next week.", "Hit global, belum ada sinyal lokal. Beli ringan, pantau Periplus atau Tokopedia minggu depan."], example: true },
      { rule: 5, id: 5, action: "monitor", intl: ["PW #1 Nonfiction"], local: [], evergreen: true, why: ["Single-list #1 on a perennial; stock is healthy.", "#1 di satu daftar untuk judul abadi; stok aman."], example: true },
      { rule: 6, id: 73, action: "display", intl: ["BookTok composite"], local: ["TikTok Shop ID"], why: ["BookTok chip: physical edition and front-table display priority.", "Sinyal BookTok: edisi fisik dan prioritas display meja depan."], example: true }
    ],
    movers: { up: [1, 50, 15, 3, 14], flat: [5, 6, 29], note: ["Units sold in April per title, all six stores.", "Unit terjual di April per judul, enam toko."] },
    evergreens: [5, 6, 15, 38, 12, 88, 2, 29, 81, 87]
  }
];

(function () {
  const L = (en, id) => (LANG === "id" ? id : en);
  const RULES = {
    1: ["Cross-channel hit", "Hit lintas kanal", "On 3+ international lists AND a local source. Confirmed demand in our market.", "Masuk 3+ daftar internasional DAN sumber lokal. Permintaan terkonfirmasi di pasar kita."],
    2: ["Evergreen peaking", "Evergreen memuncak", "A perennial that is also charting somewhere this week.", "Judul abadi yang juga masuk daftar minggu ini."],
    3: ["Local-only signal", "Sinyal lokal saja", "Indonesia-specific spike, not on international lists.", "Lonjakan khusus Indonesia, tidak ada di daftar internasional."],
    4: ["International cross-list", "Lintas daftar internasional", "On 3+ international lists, no local signal yet.", "Masuk 3+ daftar internasional, belum ada sinyal lokal."],
    5: ["Single-list #1", "#1 di satu daftar", "A #1 on NYT or PW only: author push or news lift.", "#1 hanya di NYT atau PW: dorongan penulis atau berita."],
    6: ["BookTok / romantasy", "BookTok / romantasy", "Younger-demo demand: physical edition and display priority.", "Permintaan demografi muda: edisi fisik dan prioritas display."]
  };
  const ACTIONS = { deep: ["Deep buy", "Beli besar"], reorder: ["Reorder now", "Pesan ulang sekarang"], investigate: ["Investigate", "Selidiki"], soft: ["Soft buy, watch", "Beli ringan, pantau"], monitor: ["Monitor", "Pantau"], display: ["Display priority", "Prioritas display"] };
  const byId = id => PRODUCTS.find(p => p.id === id);

  function rowHtml(r) {
    const p = r.id ? byId(r.id) : null;
    const title = p ? p.title : r.title, author = p ? p.author : r.author, pub = p ? p.publisher : r.publisher;
    const cover = p && p.cover ? `<img src="${p.cover}" alt="">` : `<span class="sc-tile" style="background:${p ? colorOf(p) : "#1f3b73"}">${title}</span>`;
    const chips = [...r.intl.map(s => `<span class="sig intl">${s}</span>`), ...r.local.map(s => `<span class="sig local">${s}</span>`), ...(r.evergreen ? [`<span class="sig ever">Evergreen</span>`] : [])].join("");
    return `
      <div class="sc-row">
        <div class="sc-cover">${cover}</div>
        <div class="sc-main">
          <div class="sc-title">${p ? `<a href="product.html?id=${p.id}">${title}</a>` : title}${r.example ? ` <em class="sc-ex">${L("example signal", "contoh sinyal")}</em>` : ""}</div>
          <div class="sc-sub">${author} · ${pub}${p ? ` · ${t(p.category)}` : ""}</div>
          <div class="sc-sigs">${chips}</div>
          <p class="sc-why">${r.why[LANG === "id" ? 1 : 0]}</p>
        </div>
        <div class="sc-side">
          <span class="sc-rule">${L("Rule", "Aturan")} ${r.rule}</span>
          <span class="sc-action a-${r.action}">${ACTIONS[r.action][LANG === "id" ? 1 : 0]}</span>
          ${p ? `<span class="sc-own">${p.sold} ${L("sold / month", "terjual / bulan")} · ${t(p.inStock ? "In stock" : "On request")}</span>` : `<span class="sc-own">${L("Not stocked yet", "Belum ada stok")}</span>`}
        </div>
      </div>`;
  }

  function render(root, issue) {
    const i = LANG === "id" ? 1 : 0;
    const date = new Date(issue.week).toLocaleDateString(LANG === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
    const groups = [1, 2, 3, 4, 5, 6].map(n => [n, issue.rows.filter(r => r.rule === n)]).filter(([, rows]) => rows.length);
    const url = location.origin + location.pathname + "?issue=" + issue.number;
    root.innerHTML = `
      <div class="sc-head">
        <div>
          <div class="label muted">${L("Issue", "Edisi")} #${issue.number} · ${L("Week of", "Pekan")} ${date}${issue.sample ? ` · <span class="sc-ex">${L("sample issue", "edisi contoh")}</span>` : ""}</div>
          <h2>${L("This week's scout", "Hasil scout pekan ini")}</h2>
          <p class="muted" style="max-width:640px">${issue.intro[i]}</p>
        </div>
        <div class="sc-share">
          <a class="btn btn-dark btn-sm" href="https://wa.me/?text=${encodeURIComponent("Booky Scout #" + issue.number + " — " + url)}" target="_blank" rel="noopener">${L("Share on WhatsApp ↗", "Bagikan ke WhatsApp ↗")}</a>
          <button class="btn btn-dark btn-sm" data-copy="${url}">${L("Copy link", "Salin tautan")}</button>
          <button class="btn btn-dark btn-sm" onclick="window.print()">${L("Print / PDF", "Cetak / PDF")}</button>
        </div>
      </div>
      <div class="sc-summary">
        <div><strong>${issue.rows.filter(r => r.rule === 1).length}</strong><span>${L("cross-channel hits", "hit lintas kanal")}</span></div>
        <div><strong>${issue.rows.filter(r => r.rule === 2).length}</strong><span>${L("evergreens peaking", "evergreen memuncak")}</span></div>
        <div><strong>${issue.rows.filter(r => r.rule === 3).length}</strong><span>${L("local-only signals", "sinyal lokal saja")}</span></div>
        <div><strong>${issue.rows.length}</strong><span>${L("titles flagged", "judul ditandai")}</span></div>
      </div>
      ${groups.map(([n, rows]) => `
        <section class="sc-group">
          <div class="sc-group-head"><span class="sc-rule big">${n}</span><div><h3>${RULES[n][i]}</h3><p class="muted">${RULES[n][2 + i]}</p></div></div>
          ${rows.map(rowHtml).join("")}
        </section>`).join("")}
      <section class="sc-group">
        <div class="sc-group-head"><span class="sc-rule big">↑</span><div><h3>${L("Moving in our stores", "Bergerak di toko kami")}</h3><p class="muted">${issue.movers.note[i]}</p></div></div>
        <div class="sc-movers">${issue.movers.up.map(id => byId(id)).filter(Boolean).map(p => `<a class="sc-mover" href="product.html?id=${p.id}">${p.cover ? `<img src="${p.cover}" alt="">` : `<span class="sc-tile" style="background:${colorOf(p)}">${p.title}</span>`}<strong>${p.title}</strong><span>${p.sold} ${L("units", "unit")}</span></a>`).join("")}</div>
      </section>
      <section class="sc-group">
        <div class="sc-group-head"><span class="sc-rule big">∞</span><div><h3>${L("Evergreens we always stock", "Evergreen yang selalu kami stok")}</h3><p class="muted">${L("The perennial list the team maintains. Preserved every week regardless of charts.", "Daftar abadi yang dijaga tim. Dipertahankan setiap minggu apa pun isi daftar.")}</p></div></div>
        <div class="sc-movers">${issue.evergreens.map(id => byId(id)).filter(Boolean).map(p => `<a class="sc-mover" href="product.html?id=${p.id}">${p.cover ? `<img src="${p.cover}" alt="">` : `<span class="sc-tile" style="background:${colorOf(p)}">${p.title}</span>`}<strong>${p.title}</strong><span>${p.author}</span></a>`).join("")}</div>
      </section>
      <section class="sc-group sc-sources">
        <h3>${L("Sources read this week", "Sumber yang dibaca pekan ini")}</h3>
        <div class="sc-src"><strong>${L("International", "Internasional")}</strong><span>${issue.sources.intl.join(" · ")}</span></div>
        <div class="sc-src"><strong>${L("Indonesia", "Indonesia")}</strong><span>${issue.sources.local.join(" · ")}</span></div>
        <div class="sc-src"><strong>${L("Our own", "Milik sendiri")}</strong><span>${issue.sources.own.join(" · ")}</span></div>
      </section>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-scout]");
    if (!root) return;
    const num = Number(new URLSearchParams(location.search).get("issue")) || SCOUT_ISSUES[0].number;
    const issue = SCOUT_ISSUES.find(x => x.number === num) || SCOUT_ISSUES[0];
    const r = () => render(root, issue);
    r(); RERENDER.push(r);
    root.addEventListener("click", e => { const c = e.target.closest("[data-copy]"); if (c) { navigator.clipboard && navigator.clipboard.writeText(c.dataset.copy); showToast(L("Link copied", "Tautan disalin")); } });
    const sub = document.querySelector("[data-scout-subscribe]");
    if (sub) sub.addEventListener("submit", e => { e.preventDefault(); const d = Object.fromEntries(new FormData(sub).entries()); try { const list = JSON.parse(localStorage.getItem("wonder-scout-subs") || "[]"); list.push({ ...d, at: Date.now() }); localStorage.setItem("wonder-scout-subs", JSON.stringify(list)); } catch {} sub.reset(); showToast(L("You're on the list.", "Anda sudah terdaftar.")); if (window.dataLayer) window.dataLayer.push({ event: "scout_subscribe", kind: d.kind }); });
  });
})();
