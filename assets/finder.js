/* Wonder Book Finder: a 60-second quiz that recommends from the real catalogue.
   Shareable results (?a=...), reading personality, and a Wonder Club capture. */
(function () {
  const TAGS = (typeof window !== "undefined" ? window : globalThis).BOOK_TAGS;
  const has = (tag, p) => TAGS[tag] && TAGS[tag].has(p.id);
  const L = (en, id) => (LANG === "id" ? id : en);

  const QUESTIONS = [
    { key: "who", q: ["Who is this book for?", "Buku ini untuk siapa?"], opts: [
      ["me", "📖", ["Me", "Saya"], ["Something for my own shelf", "Sesuatu untuk rak saya sendiri"]],
      ["gift", "🎁", ["A gift", "Hadiah"], ["For someone I want to impress", "Untuk seseorang yang ingin saya buat terkesan"]],
      ["kid", "🧒", ["A kid", "Anak"], ["Picture books, comics, first novels", "Buku bergambar, komik, novel pertama"]] ] },
    { key: "age", when: a => a.who === "kid", q: ["How old are they?", "Berapa umurnya?"], opts: [
      ["kid0", "🍼", ["0–4", "0–4"], ["Board books, bedtime, stickers", "Buku karton, dongeng tidur, stiker"]],
      ["kid5", "🐶", ["5–8", "5–8"], ["Dog Man, early readers", "Dog Man, pembaca awal"]],
      ["kid9", "🎒", ["9–12", "9–12"], ["Wimpy Kid, graphic novels", "Wimpy Kid, novel grafis"]],
      ["teen", "🎧", ["Teen", "Remaja"], ["YA, manga, fantasy", "YA, manga, fantasi"]] ] },
    { key: "mood", when: a => a.who !== "kid", q: ["What do you want from it?", "Apa yang Anda cari?"], opts: [
      ["grow", "🌱", ["Grow & get things done", "Bertumbuh & produktif"], ["Habits, focus, confidence", "Kebiasaan, fokus, percaya diri"]],
      ["calm", "🍵", ["Feel calm", "Merasa tenang"], ["Slow down, breathe, reflect", "Melambat, bernapas, merenung"]],
      ["escape", "🌊", ["Escape into a story", "Tenggelam dalam cerita"], ["Fiction that swallows weekends", "Fiksi yang menelan akhir pekan"]],
      ["think", "🔭", ["Understand the world", "Memahami dunia"], ["History, ideas, big questions", "Sejarah, gagasan, pertanyaan besar"]],
      ["heart", "💛", ["Something for the heart", "Sesuatu untuk hati"], ["Love, loss, being human", "Cinta, kehilangan, menjadi manusia"]],
      ["money", "📈", ["Money & career", "Uang & karier"], ["Investing, work, decisions", "Investasi, kerja, keputusan"]],
      ["laugh", "😄", ["Make me laugh", "Bikin tertawa"], ["Light, funny, sharp", "Ringan, lucu, tajam"]] ] },
    { key: "kidmood", when: a => a.who === "kid", q: ["What are they into?", "Mereka suka apa?"], opts: [
      ["laugh", "😂", ["Laughs", "Lucu-lucuan"], ["Comics, silly heroes", "Komik, pahlawan konyol"]],
      ["escape", "🐉", ["Adventure", "Petualangan"], ["Big stories, other worlds", "Cerita besar, dunia lain"]],
      ["calm", "🌙", ["Bedtime", "Waktu tidur"], ["Gentle stories to wind down", "Cerita lembut sebelum tidur"]],
      ["grow", "✏️", ["Learning", "Belajar"], ["Activities, first facts", "Aktivitas, fakta pertama"]] ] },
    { key: "time", when: a => a.who !== "kid", q: ["How much time do you have?", "Berapa banyak waktu Anda?"], opts: [
      ["short", "☕", ["A weekend", "Satu akhir pekan"], ["Under 300 pages", "Di bawah 300 halaman"]],
      ["medium", "🌤", ["A few evenings", "Beberapa malam"], ["The normal amount", "Jumlah yang wajar"]],
      ["long", "🏔", ["I'm in it for the long haul", "Siap yang panjang"], ["Big, slow, worth it", "Besar, pelan, sepadan"]] ] },
    { key: "era", when: a => a.who !== "kid", q: ["Your taste?", "Selera Anda?"], opts: [
      ["modern", "✨", ["Modern & fresh", "Modern & segar"], ["Written this decade", "Ditulis dekade ini"]],
      ["classic", "🏛", ["Classic & timeless", "Klasik & abadi"], ["The ones that last", "Yang bertahan lama"]],
      ["any", "🎲", ["Surprise me", "Kejutkan saya"], ["I trust the store team", "Saya percaya tim toko"]] ] },
    { key: "budget", q: ["Budget per book?", "Anggaran per buku?"], opts: [
      ["200", "🪙", ["Under Rp 200.000", "Di bawah Rp 200.000"], ["", ""]],
      ["350", "💳", ["Under Rp 350.000", "Di bawah Rp 350.000"], ["", ""]],
      ["any", "🙌", ["No limit", "Tanpa batas"], ["", ""]] ] }
  ];

  const PERSONA = {
    gift: ["The Thoughtful Giver", "Si Pemberi Hadiah Bijak", "You pick books that say something about the person receiving them.", "Anda memilih buku yang bercerita tentang penerimanya."],
    kid: ["The Story Parent", "Orang Tua Pendongeng", "You are raising a reader. Dog Man is only the beginning.", "Anda sedang membesarkan seorang pembaca. Dog Man baru permulaan."],
    grow: ["The Builder", "Sang Pembangun", "You read to change something about tomorrow.", "Anda membaca untuk mengubah sesuatu di hari esok."],
    calm: ["The Quiet Afternoon Reader", "Pembaca Sore yang Tenang", "A slow chapter and a cup of coffee is your idea of a good day.", "Satu bab pelan dan secangkir kopi adalah hari baik versi Anda."],
    escape: ["The Deep Diver", "Sang Penyelam", "You want a world to disappear into, preferably for a whole weekend.", "Anda ingin dunia untuk ditenggelami, idealnya seharian penuh."],
    think: ["The Question Asker", "Sang Penanya", "You read to understand why things are the way they are.", "Anda membaca untuk memahami mengapa segala sesuatu seperti adanya."],
    heart: ["The Open Heart", "Hati yang Terbuka", "You read for the people in the pages.", "Anda membaca demi orang-orang di dalam halaman."],
    money: ["The Strategist", "Sang Ahli Strategi", "You like a book that pays for itself.", "Anda suka buku yang membayar dirinya sendiri."],
    laugh: ["The Good Company", "Teman yang Menyenangkan", "You want a book that is fun to be around.", "Anda ingin buku yang asyik ditemani."]
  };

  function score(p, a) {
    if (has("skip", p) || p.type !== "Books") return -1;
    let s = 0; const why = [];
    if (a.who === "kid") {
      if (!has(a.age, p)) return -1;
      s += 5;
      if (has(a.kidmood, p)) { s += 4; why.push(L("matches what they are into", "sesuai yang mereka suka")); }
    } else {
      if (has("kid0", p) || has("kid5", p) || (has("kid9", p) && !has("teen", p))) return -1;
      if (has(a.mood, p)) { s += 5; why.push({ grow: L("built to change a habit", "dibuat untuk mengubah kebiasaan"), calm: L("slow, warm, reflective", "pelan, hangat, reflektif"), escape: L("a story that swallows weekends", "cerita yang menelan akhir pekan"), think: L("asks the big questions", "mengajukan pertanyaan besar"), heart: L("written for the heart", "ditulis untuk hati"), money: L("about money and decisions", "tentang uang dan keputusan"), laugh: L("funny and sharp", "lucu dan tajam") }[a.mood]); }
      if (a.time === "short" && has("short", p)) { s += 2; why.push(L("finishable in a weekend", "selesai dalam satu akhir pekan")); }
      if (a.time === "long" && has("long", p)) { s += 2; why.push(L("big and worth the time", "besar dan sepadan waktunya")); }
      if (a.time === "medium" && !has("long", p)) s += 1;
      if (a.time === "short" && has("long", p)) s -= 2;
      if (a.era === "classic" && has("classic", p)) { s += 2; why.push(L("a classic that lasts", "klasik yang bertahan")); }
      if (a.era === "modern" && !has("classic", p)) s += 1;
      if (a.era === "classic" && !has("classic", p)) s -= 1;
      if (a.who === "gift" && has("gift", p)) { s += 2; why.push(L("a favourite to give", "favorit untuk dihadiahkan")); }
    }
    const cap = a.budget === "200" ? 200000 : a.budget === "350" ? 350000 : Infinity;
    if (p.price > cap) return -1;
    if (p.sold > 30) { s += 1.5; why.push(L("a store bestseller", "terlaris di toko")); } else if (p.sold > 10) s += 0.5;
    if (p.cover) s += 0.5;
    if (!p.inStock) s -= 1;
    return { s, why };
  }
  function recommend(a) {
    return PRODUCTS.map(p => ({ p, r: score(p, a) })).filter(x => x.r !== -1 && x.r.s > 0).sort((x, y) => y.r.s - x.r.s || y.p.sold - x.p.sold).slice(0, 6);
  }
  const encode = a => ["who", "age", "mood", "kidmood", "time", "era", "budget"].map(k => a[k] || "").join(".");
  const decode = s => { const v = s.split("."); const a = {}; ["who", "age", "mood", "kidmood", "time", "era", "budget"].forEach((k, i) => { if (v[i]) a[k] = v[i]; }); return a; };

  function init() {
    const root = document.querySelector("[data-finder]");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    let a = params.get("a") ? decode(params.get("a")) : {};
    let step = 0;
    const steps = () => QUESTIONS.filter(q => !q.when || q.when(a));
    const done = () => steps().every(q => a[q.key]);

    function renderQuiz() {
      const list = steps();
      if (step >= list.length) step = list.length - 1;
      const q = list[step];
      root.innerHTML = `
        <div class="quiz">
          <div class="quiz-top">
            <div class="quiz-progress">${list.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}</div>
            <div class="label" style="opacity:.7">${step + 1} / ${list.length}</div>
          </div>
          <h2 class="quiz-q">${q.q[LANG === "id" ? 1 : 0]}</h2>
          <div class="quiz-opts ${q.opts.length > 4 ? "many" : ""}">
            ${q.opts.map(([v, ic, lab, sub]) => `<button class="quiz-opt ${a[q.key] === v ? "on" : ""}" data-opt="${v}"><span class="ic">${ic}</span><strong>${lab[LANG === "id" ? 1 : 0]}</strong>${sub[0] ? `<span>${sub[LANG === "id" ? 1 : 0]}</span>` : ""}</button>`).join("")}
          </div>
          <div class="quiz-nav">${step > 0 ? `<button class="btn btn-sm" data-back>← ${L("Back", "Kembali")}</button>` : "<span></span>"}<span class="muted" style="font-size:.8rem">${L("Takes about 60 seconds", "Sekitar 60 detik")}</span></div>
        </div>`;
    }
    function renderResults() {
      const recs = recommend(a);
      const pk = a.who === "kid" ? "kid" : a.who === "gift" ? "gift" : a.mood;
      const persona = PERSONA[pk] || PERSONA.escape;
      const i = LANG === "id" ? 1 : 0;
      const url = location.origin + location.pathname + "?a=" + encode(a);
      const member = typeof Member !== "undefined" && Member.get();
      root.innerHTML = `
        <div class="result-head">
          <div class="label" style="opacity:.7">${L("Your reading personality", "Kepribadian membaca Anda")}</div>
          <h2 class="persona">${persona[i]}</h2>
          <p class="muted" style="max-width:520px;margin:6px auto 0">${persona[2 + i]}</p>
          <div class="share-row">
            <a class="btn btn-solid btn-sm" href="https://wa.me/?text=${encodeURIComponent(L("My Wonder reading personality is", "Kepribadian membaca Wonder saya:") + " " + persona[i] + " — " + url)}" target="_blank" rel="noopener">${L("Share on WhatsApp ↗", "Bagikan ke WhatsApp ↗")}</a>
            <button class="btn btn-sm" data-copy="${url}">${L("Copy link", "Salin tautan")}</button>
            <button class="btn btn-sm" data-restart>${L("Start again", "Ulangi")}</button>
          </div>
        </div>
        <div class="result-picks">
          <div class="container">
            <div class="section-head"><div><div class="label muted" style="margin-bottom:10px">${L("Picked for you from six stores", "Dipilih untuk Anda dari enam toko")}</div><h2>${recs.length ? L("Your next reads", "Bacaan berikutnya") : L("Nothing matched that budget", "Tidak ada yang cocok dengan anggaran itu")}</h2></div></div>
            <div class="picks">
              ${recs.map(({ p, r }, n) => `
                <div class="pick">
                  <div class="pick-n">${n + 1}</div>
                  ${p.cover ? `<img class="pick-cover" src="${p.cover}" alt="${p.title}">` : `<div class="pick-cover tile" style="background:${colorOf(p)}">${p.title}</div>`}
                  <div class="pick-body">
                    <div class="cat-row"><span class="cat">${t(p.category)}</span>${rankPill(p)}</div>
                    <h3>${p.title}</h3>
                    <div class="author">${p.author} · ${p.publisher}</div>
                    <p class="why">${L("Why:", "Alasan:")} ${r.why.length ? r.why.slice(0, 3).join(", ") : L("a good fit for your answers", "cocok dengan jawaban Anda")}.</p>
                    <div class="book-foot"><span class="price">${money(p.price)}</span><button class="btn btn-dark btn-sm" data-add="${p.id}">${t("Add")}</button></div>
                  </div>
                </div>`).join("")}
            </div>
            <div class="save-picks">
              ${member ? `<h3>${L("Saved to your Wonder Club account", "Tersimpan di akun Wonder Club Anda")}</h3><p class="muted">${L("We will keep these picks on your profile and tell you when they are on promotion.", "Pilihan ini kami simpan di profil Anda dan beri tahu saat ada promo.")}</p><a class="btn btn-dark btn-sm" href="account.html">${L("My account ↗", "Akun saya ↗")}</a>`
              : `<h3>${L("Save these picks", "Simpan pilihan ini")}</h3><p class="muted">${L("Join Wonder Club and we will keep your list, message you when a pick is on promotion, and start your points.", "Gabung Wonder Club dan kami simpan daftar Anda, kabari saat ada promo, dan mulai poin Anda.")}</p>
                <form data-save-picks class="save-form">
                  <input name="name" placeholder="${L("Name", "Nama")}" required>
                  <input name="phone" placeholder="WhatsApp (08…)" required>
                  <input name="email" type="email" placeholder="Email" required>
                  <button class="btn btn-dark" type="submit">${L("Save & join free ↗", "Simpan & gabung gratis ↗")}</button>
                </form>
                <p class="form-note">${L("No spam. You can leave any time.", "Tanpa spam. Bisa keluar kapan saja.")}</p>`}
            </div>
          </div>
        </div>`;
      try { localStorage.setItem("wonder-finder-last", JSON.stringify({ a, picks: recs.map(x => x.p.id), at: Date.now() })); } catch {}
      if (window.dataLayer) window.dataLayer.push({ event: "finder_complete", persona: persona[0], answers: encode(a) });
    }
    function render() { if (done()) renderResults(); else renderQuiz(); window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); }

    root.addEventListener("click", e => {
      const opt = e.target.closest("[data-opt]");
      if (opt) {
        const q = steps()[step]; a[q.key] = opt.dataset.opt;
        Object.keys(a).forEach(k => { const qq = QUESTIONS.find(x => x.key === k); if (qq && qq.when && !qq.when(a)) delete a[k]; });
        if (done()) { history.replaceState(null, "", "?a=" + encode(a)); render(); } else { step = Math.min(step + 1, steps().length - 1); render(); }
        return;
      }
      if (e.target.closest("[data-back]")) { step = Math.max(0, step - 1); render(); return; }
      if (e.target.closest("[data-restart]")) { a = {}; step = 0; history.replaceState(null, "", location.pathname); render(); return; }
      const cp = e.target.closest("[data-copy]");
      if (cp) { navigator.clipboard && navigator.clipboard.writeText(cp.dataset.copy); showToast(L("Link copied", "Tautan disalin")); }
    });
    root.addEventListener("submit", e => {
      const f = e.target.closest("[data-save-picks]"); if (!f) return;
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f).entries());
      const picks = recommend(a).map(x => x.p.id);
      Member.set({ name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone.trim(), birthday: "", store: "ashta", joined: new Date().toISOString(), redeemed: 0, picks, finder: encode(a) });
      showToast(L("Welcome to Wonder Club!", "Selamat datang di Wonder Club!"));
      if (window.renderHeaderMember) renderHeaderMember();
      render();
    });
    if (done()) step = steps().length; render();
    RERENDER.push(render);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
