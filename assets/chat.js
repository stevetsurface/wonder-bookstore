/* "Ask the bookseller": chat panel on the finder page, talking to /api/recommend (Vercel) */
(function () {
  const API_BASE = window.WONDER_API_BASE || (location.hostname.endsWith("github.io") ? "https://wonder-bookstore.vercel.app" : "");
  const L = (en, id) => (LANG === "id" ? id : en);
  const STARTERS = [
    ["Something calm for a weekend", "Sesuatu yang tenang untuk akhir pekan"],
    ["A gift for my boss who likes business books", "Hadiah untuk bos yang suka buku bisnis"],
    ["My 7-year-old finished Dog Man, what next?", "Anak saya (7) sudah tamat Dog Man, lanjut apa?"],
    ["I loved Before the Coffee Gets Cold", "Saya suka Before the Coffee Gets Cold"],
  ];
  let history = [];
  let busy = false;

  function init() {
    const host = document.querySelector("[data-finder]");
    if (!host) return;
    const panel = document.createElement("section");
    panel.className = "chat-wrap";
    panel.innerHTML = "";
    host.insertAdjacentElement("afterend", panel);
    render(panel);
    RERENDER.push(() => render(panel));

    panel.addEventListener("submit", async e => {
      const f = e.target.closest("[data-chat-form]"); if (!f) return;
      e.preventDefault();
      const input = f.querySelector("input");
      const text = input.value.trim(); if (!text || busy) return;
      input.value = "";
      await send(panel, text);
    });
    panel.addEventListener("click", e => {
      const s = e.target.closest("[data-starter]"); if (s) { send(panel, s.dataset.starter); return; }
      if (e.target.closest("[data-chat-reset]")) { history = []; render(panel); }
    });
  }

  function render(panel) {
    const member = typeof Member !== "undefined" && Member.get();
    panel.innerHTML = `
      <div class="chat">
        <div class="chat-head">
          <div><div class="label" style="opacity:.7">${L("Or just ask", "Atau tanya langsung")}</div><h2>${L("Ask the bookseller", "Tanya penjaga toko")}</h2></div>
          ${history.length ? `<button class="btn btn-sm" data-chat-reset>${L("New chat", "Obrolan baru")}</button>` : ""}
        </div>
        <div class="chat-log" data-chat-log>
          ${history.length ? history.map(m => bubble(m)).join("") : `
            <div class="chat-msg bot"><div class="bubble">${L("Tell me what you feel like reading, who it is for, or a book you loved. I only recommend what is actually on our shelves.", "Ceritakan ingin baca apa, untuk siapa, atau buku yang Anda suka. Saya hanya merekomendasikan yang benar-benar ada di rak kami.")}</div></div>
            <div class="starters">${STARTERS.map(([en, id]) => `<button class="chip" data-starter="${L(en, id)}">${L(en, id)}</button>`).join("")}</div>`}
          ${busy ? `<div class="chat-msg bot"><div class="bubble typing"><i></i><i></i><i></i></div></div>` : ""}
        </div>
        <form class="chat-form" data-chat-form>
          <input type="text" maxlength="600" placeholder="${L("I'm looking for…", "Saya mencari…")}" ${busy ? "disabled" : ""} aria-label="${L("Message", "Pesan")}">
          <button class="btn btn-dark" type="submit" ${busy ? "disabled" : ""}>${L("Send ↗", "Kirim ↗")}</button>
        </form>
        <p class="form-note">${L("Powered by Claude. Recommendations come only from the Wonder catalogue; prices and stock are shown from our own data.", "Didukung Claude. Rekomendasi hanya dari katalog Wonder; harga dan stok ditampilkan dari data kami sendiri.")}${member ? "" : " " + L("Join Wonder Club to save your picks.", "Gabung Wonder Club untuk menyimpan pilihan Anda.")}</p>
      </div>`;
    const log = panel.querySelector("[data-chat-log]");
    log.scrollTop = log.scrollHeight;
  }

  function bubble(m) {
    if (m.role === "user") return `<div class="chat-msg user"><div class="bubble">${esc(m.content)}</div></div>`;
    const d = m.data || {};
    return `
      <div class="chat-msg bot">
        <div class="bubble">${esc(d.reply || m.content)}${d.question ? ` <strong>${esc(d.question)}</strong>` : ""}</div>
        ${d.picks && d.picks.length ? `<div class="chat-picks">${d.picks.map(p => `
          <div class="chat-pick">
            ${p.cover ? `<img src="${p.cover}" alt="">` : `<span class="mini" style="background:${colorOf({ id: p.id })}"></span>`}
            <div><strong>${esc(p.title)}</strong><span>${esc(p.author)} · ${money(p.price)}${p.inStock ? "" : " · " + t("On request")}</span><em>${esc(p.why)}</em></div>
            <button class="btn btn-dark btn-sm" data-add="${p.id}">${t("Add")}</button>
          </div>`).join("")}</div>` : ""}
        ${d.persona ? `<div class="chat-persona">${L("Reading personality:", "Kepribadian membaca:")} <strong>${esc(d.persona)}</strong></div>` : ""}
      </div>`;
  }

  async function send(panel, text) {
    history.push({ role: "user", content: text });
    busy = true; render(panel);
    try {
      const res = await fetch(API_BASE + "/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: LANG, messages: history.map(m => ({ role: m.role, content: m.role === "user" ? m.content : (m.data ? m.data.reply + (m.data.picks || []).map(p => ` [${p.id}: ${p.title}]`).join("") : m.content) })) }) });
      let data = null;
      try { data = await res.json(); } catch { throw new Error("offline"); }
      if (!res.ok) throw new Error(data && data.error ? data.error : "offline");
      history.push({ role: "assistant", content: data.reply, data });
      if (window.dataLayer) window.dataLayer.push({ event: "bookseller_reply", picks: (data.picks || []).length });
    } catch (err) {
      history.push({ role: "assistant", content: (err.message && err.message !== "offline" && !/fetch|JSON/i.test(err.message)) ? err.message : L("The bookseller is offline right now. Try the quiz above, or ask the store team on WhatsApp.", "Penjaga toko sedang offline. Coba kuis di atas, atau tanya tim toko lewat WhatsApp.") });
    }
    busy = false; render(panel);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  document.addEventListener("DOMContentLoaded", init);
})();
