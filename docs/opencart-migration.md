# Moving the Wonder site onto OpenCart 4

This static site is the design and content reference. The production store will run on OpenCart 4 (same platform Kafi Digital Studios is building for Sinar Starbooks). This note maps what exists here to OpenCart and lists the extensions needed.

## Catalogue import

Run `node tools/export-opencart.mjs` to produce:

- `opencart/products.csv`: one row per product with model/SKU (ISBN where known), bilingual name and description, price, quantity (1 = in stock), manufacturer (brand group), category path, image path, tags, author, publisher and last month's unit sales.
- `opencart/categories.csv`: the category tree with English and Indonesian names.

Copy `assets/covers/*.jpg` to `image/catalog/covers/` on the OpenCart server. Import with a CSV import extension (for example "Product Import/Export" from the marketplace) or Kafi's migration script.

Manufacturers = brands (`brands.html`). Create them first so the `manufacturer` column resolves.

## Page mapping

| Static page | OpenCart |
|---|---|
| `index.html` | Home layout: slideshow module, product carousels (bestsellers by sales, store favourites), HTML modules for concept, coffee, stores, journal teaser, Wonder Club, FAQ |
| `shop.html` | `product/category` with filters (category, manufacturer, in stock), list/grid switch; "Trending" strip = bestseller module |
| `stores.html` | `information/information` page per store, plus the contact form (`information/contact`) |
| `brands.html` | `product/manufacturer` list with logos |
| `journal.html`, `post.html` | Blog extension (for example "Blog Manager" or "Journal theme blog") with categories Event / News / Reading list; reading lists embed products |
| `faq.html` | FAQ extension or an information page with accordion HTML |
| `account.html` | `account/register`, `account/login`, `account/reward` (built-in reward points), `account/order` |
| `checkout.html` | `checkout/checkout` with the shipping and payment extensions below |
| ID / EN toggle | OpenCart languages: English + Bahasa Indonesia packs; all product and category text has both columns in the CSV |

## Extensions to install

**Payment (Midtrans)** – the official Midtrans OpenCart plugin (Snap) covers QRIS, GoPay, ShopeePay, BCA/Mandiri/BNI/BRI/Permata virtual accounts, cards and Indomaret/Alfamart. Sandbox keys first, production keys after the Midtrans merchant review. Alternative: Xendit's OpenCart plugin.

**Shipping** – RajaOngkir or Biteship extension for live JNE, J&T, SiCepat rates by origin store and destination district, plus Gojek Instant where available. Add a free-shipping threshold (Rp 350.000 in the prototype). Set each store as a shipping origin.

**Store pickup** – a "Store pickup" / "Pickup from store" shipping extension listing the six stores (OpenCart's built-in Pickup From Store method handles one address; the multi-location version is a marketplace extension). Order status flow: Pending → Processing (being picked) → Ready for pickup → Complete.

**Wonder Club** – OpenCart's built-in reward points: set points per product or use the "reward points on total" extension for 1 point per Rp 1.000; customer groups for the tiers (Reader / Bookworm / Wonderer); a birthday-discount extension or a monthly coupon campaign for the 30% birthday treat. Decide and document the rules in `faq.html` first.

**Live stock and prices from Jubelio** – Jubelio connects to webstores through its integrations list (Shopify, WooCommerce and others). Check with Jubelio whether an OpenCart connector exists for your plan; if not, run `tools/sync-jubelio.mjs` style sync against the OpenCart REST API, or export from Jubelio to CSV on a schedule. Until then the static site syncs via the GitHub Action in `docs/sync-jubelio.workflow.yml` (to be moved into `.github/workflows/`).

**Also** – Google Analytics / Meta pixel modules, SEO URL settings (already in the CSV `seo_keyword`), a sitemap feed, and WhatsApp chat button.

## Content to carry over as-is

- Copy for all pages, in both languages, is in the HTML files and `assets/i18n.js`.
- Store photos: `assets/img/`. Event photos: `assets/img/events/`. Logos: `assets/logos/`.
- Journal posts: the `JOURNAL` array in `assets/script.js` (bilingual title, excerpt, body and book references).
- FAQ: `faq.html`.
