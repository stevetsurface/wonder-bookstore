# Wonder Bookstore — website

Static website for Wonder Bookstore, the lifestyle bookstore of the Sinar Starbooks family (books, gifts, stationery, toys and coffee; six stores in Jakarta and Bali). No build step.

The look follows the "Wonder Bookstore Airport Proposal" deck: signature forest green, white uppercase Helvetica-style headlines (Archivo), the ↗ arrow motif, pill-shaped outlined buttons and real store photography.

## Live site

https://stevetsurface.github.io/wonder-bookstore/ (GitHub Pages, built from the `main` branch)

## Layout patterns

The home page borrows store-site patterns from storminggravity.com, restyled for Wonder: an announcement ticker, header search with a full-width Shop mega menu, a hero slideshow, product rails with arrows and a progress bar, quick-add on hover, curated "shelf" story tiles, a big impact number, an FAQ accordion with a WhatsApp button, and a newsletter block with a photo.

## Languages

The site is bilingual (ID / EN) with a toggle in the header. The browser language picks the default and the choice is remembered. Static page copy is translated in `assets/i18n.js` (keyed by the English text as written in the HTML, so edit the HTML and the dictionary together). Dynamic labels (cards, filters, bag) are translated in the `UI` object at the top of `assets/script.js`.

## Shop features

- Bestseller rank pills ("BEST SELLER #1" / "TERLARIS #1") on the top five by units sold
- Collections: All titles / Bestsellers / Store favourites / In stock, plus a brand filter
- Views: grid, list and compact (remembered per browser)
- "Trending in store" strip with a "Just bought" line, on the shop and home pages
- Hover mini-cart on the bag button (desktop), plus the slide-in bag drawer

## Catalogue data

`assets/products.js` holds the catalogue: 104 books from the Sinar Starbooks catalogue (title, author, publisher, retail price, category, units sold in April, stock, ISBN) plus six gift and stationery items. Cover images are in `assets/covers/` (80 of the 104 titles have one; the rest show a coloured tile). Brand logos are in `assets/logos/`. Bestseller ranks, the trending strip, "sold last month" lines and "store favourites" (the top seller per category) are all computed from the real unit sales.

## Checkout, Wonder Club and journal (front-end flows)

- `checkout.html`: contact, delivery (free pickup at any of the six stores, or shipping with JNE / J&T / SiCepat / Gojek Instant by zone, free from Rp 350.000) and payment (QRIS, GoPay, ShopeePay, BCA / Mandiri / BNI / BRI virtual accounts, cards, Indomaret / Alfamart, pay in store on pickup). Places a demo order in the browser; no payment is taken until Midtrans is connected.
- `order.html`: confirmation with pickup or courier details and payment instructions.
- `account.html`: Wonder Club join and member dashboard: points, tier, birthday-month treat, order history. Stored in the browser only.
- `journal.html` / `post.html`: events, store news and reading lists. Reading-list posts embed catalogue books with Add buttons. Posts live in the `JOURNAL` array in `assets/script.js`.
- `faq.html`: grouped FAQ (orders and shipping, pickup, payment, Wonder Club, books and stock, events).

Loyalty rules in the prototype (drafts for the team): 1 point per Rp 1.000, 100 points = Rp 10.000 off, birthday month 30% off one order (from the in-store poster), tiers Reader / Bookworm / Wonderer by yearly spend, points expire after 12 months.

## Going live: OpenCart, payments, shipping, Jubelio

- `docs/opencart-migration.md` maps every page and feature to OpenCart 4 and lists the extensions: Midtrans (payments), RajaOngkir or Biteship (shipping rates), multi-store pickup, reward points and customer groups (Wonder Club), a blog extension (journal), language packs (ID / EN).
- `node tools/export-opencart.mjs` writes `opencart/products.csv` and `opencart/categories.csv` for import.
- `tools/sync-jubelio.mjs` pulls items, prices and stock from Jubelio into `assets/products.js`; `docs/sync-jubelio.workflow.yml` (move it to `.github/workflows/` after running `gh auth refresh -s workflow`) runs it every 3 hours once the `JUBELIO_EMAIL` and `JUBELIO_PASSWORD` repository secrets are set. Endpoint paths and field names are configurable at the top of the script and must be checked against developer.jubelio.com for your account.

## Book finder (top-of-funnel tool)

`finder.html` is a 60-second quiz: who the book is for (me / gift / kid, with age for kids), what you want from it, time available, taste and budget. It scores the real catalogue with hand-set tags in `assets/finder.js` (mood, length, classic, gift, kid age bands) and shows six picks with a one-line "why", Add buttons, a shareable reading-personality result (`?a=` in the URL encodes the answers, so results can be shared on WhatsApp or embedded in ads and Instagram bios), and a "save these picks" form that joins Wonder Club. Completions push a `finder_complete` event to `dataLayer` for GA4 when a tag manager is added.

To tune recommendations, edit the id sets in `TAGS` at the top of `assets/finder.js` (ids are the product ids in `assets/products.js`).

## AI bookseller

The finder page also has an "Ask the bookseller" chat powered by Claude through a Vercel serverless function (`api/recommend.js`). It recommends only catalogue titles, returns structured picks that are validated against our data, and caches the catalogue prompt. Setup and tuning: `docs/ai-bookseller.md`.

## Pages

- `index.html` — home: ticker, slideshow, bestseller rail, curated shelves, concept, coffee shop, gifts rail, impact number, store grid, FAQ, community, newsletter
- `shop.html` — catalogue with Books / Gifts / Stationery tabs, category chips, search and sort
- `stores.html` — all six stores with Google Maps links, plus the contact section
- `brands.html` — publishers and brands with logos, linking to the shop filtered by brand
- `about.html` — "A life of wonder": who we are, customers, store timeline, publishers and brands

## Files

- `assets/styles.css` — design system and layout
- `assets/script.js` — product data, shopping bag (saved in localStorage), filters, forms
- `assets/logo-mark.svg` — the circular "W" mark, drawn from the storefront sign
- `assets/img/` — store and lifestyle photos cropped from the proposal deck

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Facts used (from the proposal deck and Sinar Starbooks notes)

- Stores and opening dates: Hublife (2022), Ashta District 8 (Jan 2024), TSM Cibubur (Dec 2024), Berawa (May 2025), TSM Bali (Jul 2025), Pondok Indah Mall 5 (Mar 2026)
- Wonder Coffee at Ashta and Berawa
- Instagram @wonderbookstoreofficial; website www.wonderstore.co.id
- Publishers and brands list from the deck

## Placeholders to replace before launch

- **Book prices and sales** are real (Sinar Starbooks catalogue, April units). **Gift and stationery prices** are still placeholders.
- **Opening hours** are written as "open daily during mall hours"; replace with real hours per store.
- **Google Maps links** are search links by store name; swap for the exact place links from the deck.
- **WhatsApp numbers** per store are not on the site yet; add them in the contact section of `stores.html`.
- **Checkout, orders and Wonder Club** are front-end demos in the browser. Points are credited immediately in the demo; in production they are credited after payment.
- **Shipping rates and delivery times** are estimates until a rate API is connected.
- **Journal event dates** are approximate; confirm them with the team. Event photos come from the proposal deck.
- **Newsletter / contact forms** show a confirmation and do not send anything.
- **FAQ answers** are drafts; confirm them with the store team.
- **Social proof lines** now read from real data: "N sold last month" and "#1 in <category> last month". Refresh `assets/products.js` monthly so they stay true.
- **Ticker messages** live at the top of each HTML file; edit them there.
- Photos are cropped from the deck PDF at screen resolution; replace with the original files for best quality.
