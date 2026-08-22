# Urban Nest Estates — marketing site

A dependency-free marketing and portfolio site for a London short-let management
company. Nineteen pages, no framework, no build step: plain HTML, one stylesheet,
two small JavaScript files.

Built with Claude, directed and shipped by me. See [How this was built](#how-this-was-built).

**Live site:** https://urbannestestates.co.uk

---

## About this repository

This is a sanitised public copy of a site built for a real client. It is here as a
code sample.

- All photography has been replaced with generated placeholders. No property or
  personal images are included.
- Team members and reviewers appear under generic labels.
- The form provider access key has been removed. See *Running locally* below.
- The code, layout, styling and copy structure are unchanged from production.

The Urban Nest Estates brand, name and marks belong to the client and are shown
with permission. They are not covered by the licence on the source code.

---

## What it does

**Nineteen static pages** — a home page, nine individual property pages, a homes
index, a property-management service page, plus about, collaborations, contact,
privacy and a 404.

**No dependencies.** No React, no Tailwind, no bundler, no `npm install`. Roughly
1,000 lines of CSS and 600 of JavaScript. Open `index.html` in a browser and it
runs.

**Progressive enhancement.** Every page is fully readable and navigable with
JavaScript disabled. The scripts add a scroll-aware header, a mobile menu, image
galleries with keyboard support, a reviews carousel, scroll-triggered reveals and
client-side form handling. Nothing essential depends on them.

**Accessibility and motion.** Reveal animations and the carousel respect
`prefers-reduced-motion`. Interactive controls carry proper ARIA labelling and
work from the keyboard.

**SEO.** Per-page meta and Open Graph tags, JSON-LD structured data describing
the business and each property, a `sitemap.xml` and `robots.txt`.

**Design system.** A single `:root` block defines the whole visual language:
an ivory-led palette with pine, terracotta and brass accents, a serif/sans
type pairing, and fluid `clamp()`-based spacing so layouts scale without
breakpoint stacking.

---

## How this was built

The code was generated with Claude across an extended back-and-forth. I wrote the
brief, made the architectural calls, reviewed and corrected the output, supplied
and organised the real content and imagery, tested across devices, and deployed it.

The decisions that shaped the result were mine: static HTML over a framework,
given a nine-property site that changes a few times a year and needed to be
maintainable by a non-developer; progressive enhancement so nothing breaks with
JavaScript off; a token-driven stylesheet rather than utility classes; Netlify
over a CMS. Several rounds went back for rework on layout, motion and accessibility
before it was right.

I am describing this openly because it is how the site was actually made, and
because the interesting part of the work was direction and judgement rather than
typing.

---

## Structure

```
├── index.html                 Home
├── homes.html                 Property index
├── home-*.html                Nine individual property pages
├── property-management.html   Service page
├── about.html  contact.html  collaborations.html  privacy.html  404.html
├── css/
│   └── styles.css             Design tokens + all styling
├── js/
│   ├── main.js                Navigation, galleries, carousel, forms
│   └── motion.js              Scroll reveals, reduced-motion handling
├── assets/
│   ├── brand/                 Logo, favicons, platform and badge marks
│   ├── images/                Placeholder imagery
│   └── brochures/             Placeholder PDFs
├── netlify.toml               Deploy config and clean-URL redirects
├── sitemap.xml  robots.txt
└── .env.example
```

---

## Running locally

Clone it and serve the folder:

```bash
git clone https://github.com/DadoCode/urban-nest-estates.git
cd urban-nest-estates
python3 -m http.server 8000
```

Then open http://localhost:8000

There is no build step. Editing a file and refreshing is the whole workflow.

### Enquiry form

The form posts to [Web3Forms](https://web3forms.com), which needs no server. With
no key set, it falls back to opening the visitor's mail client with the message
pre-filled, so the page still works out of the box.

To wire it up, get a free access key and set it near the top of `js/main.js`:

```js
window.UNE_FORM_ENDPOINT   = "https://api.web3forms.com/submit";
window.UNE_FORM_ACCESS_KEY = "your-access-key-here";
```

Do not commit a real key. See `.env.example`.

---

## Deployment

Built for static hosting. `netlify.toml` handles clean URLs (`/about` rather than
`/about.html`), the 404 fallback and cache headers. Drag the folder into Netlify,
or connect the repository and deploy from `main` with no build command.

GitHub Pages, Cloudflare Pages and Vercel all work too, though clean URLs would
need their own equivalent config.

---

## Licence

Source code is MIT. Brand assets are not. See [LICENSE](LICENSE).
