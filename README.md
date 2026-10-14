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
- **Checkout** and the **newsletter / contact forms** are front-end only (they show a confirmation and do not send anything).
- **FAQ answers** are drafts; confirm them with the store team.
- **Social proof lines** now read from real data: "N sold last month" and "#1 in <category> last month". Refresh `assets/products.js` monthly so they stay true.
- **Ticker messages** live at the top of each HTML file; edit them there.
- Photos are cropped from the deck PDF at screen resolution; replace with the original files for best quality.
