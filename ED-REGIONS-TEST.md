# Editable Regions Integration Test

**Test page:** `/ed-regions-test/`
**Source:** `site/pages/ed-regions-test.html`
**Layout:** `site/_includes/layouts/test-shell.liquid`

Open this page in the CloudCannon Visual Editor to test all features. The page has two independently-editable component blocks. Click each block to open its data panel in the sidebar, edit a field, and confirm the component re-renders.

---

## Block 1: Custom Features

**Component:** `site/_includes/ed-regions-custom-features.liquid`
**Front matter key:** `customFeaturesDemo`

### Re-render probe

- [ ] Edit `customFeaturesDemo.note` → confirm the italic text at the top of Block 1 updates without a page reload

### Filters

| Filter | Type | Drive it by editing | Expected output |
|--------|------|---------------------|-----------------|
| `excerpt` | auto-mirror | `sampleText` | First 60 chars of text, truncated with `…` |
| `length` | auto-mirror | `sampleText` | Character count of the string |
| `stamp` | auto-mirror (closure) | `sampleText` | `sampleText` with a `[build-closure-ok]` suffix |
| `wordCount` | browser override | `sampleText` | Word count of the string |
| `postDate` | browser override | `sampleDate` | Date in `MMM D, YYYY` format (e.g. `Nov 22, 2023`) |
| `markdownify` | browser override | `sampleMarkdown` | Rendered HTML — bold, italic, code |

- [ ] `excerpt` renders a truncated version of `sampleText`
- [ ] `length` renders a number matching the character count of `sampleText`
- [ ] `stamp` renders `sampleText` followed by `[build-closure-ok]` — and the browser re-render matches the server output (proves the closure over the module-level `buildInfo` survived auto-mirror; under `fn.toString()` the browser re-render would break)
- [ ] `wordCount` renders a number matching the word count of `sampleText`
- [ ] `postDate` renders `sampleDate` formatted as `Nov 22, 2023` (or equivalent)
- [ ] `markdownify` renders `**bold**` as `<strong>bold</strong>`, `_italic_` as `<em>italic</em>`, `` `code` `` as `<code>code</code>`
- [ ] Edit `sampleText` → `excerpt`, `length`, `stamp`, and `wordCount` all update
- [ ] Edit `sampleDate` → `postDate` updates
- [ ] Edit `sampleMarkdown` → `markdownify` output updates

### Shortcodes

| Shortcode | Type | Notes |
|-----------|------|-------|
| `year` | auto-mirror | Pure function — display only |
| `isoDate` | browser override | Closes over Luxon `DateTime` — display only |

- [ ] `{% year %}` renders a 4-digit current year
- [ ] `{% isoDate %}` renders an ISO 8601 timestamp — the value will differ between the server render (build time) and the browser render (re-render time), which is expected behaviour

### Paired shortcodes

| Shortcode | Type | Drive it by editing |
|-----------|------|---------------------|
| `callout` (variable arg) | auto-mirror | `calloutType` |
| `callout` (literal `"info"`) | auto-mirror | display only |
| `prose` | browser override | `sampleMarkdown` |

- [ ] `{% callout calloutType %}` renders with the correct CSS class (`callout--warning` for `"warning"`, etc.)
- [ ] Edit `calloutType` to `"error"` → callout border/background changes colour
- [ ] Literal-arg variant always renders with `callout--info` style regardless of `calloutType`
- [ ] `{% prose %}{{ sampleMarkdown }}{% endprose %}` renders markdown wrapped in `<div class="prose">`
- [ ] Edit `sampleMarkdown` → the prose output updates (driven by the same field as `markdownify`)

### Custom tag

| Tag | Type | Drive it by editing |
|-----|------|---------------------|
| `icon` (variable arg) | browser override | `iconName` |
| `icon` (literal `"envelope"`) | browser override | display only |

- [ ] `{% icon iconName %}` renders `<span class="icon icon-star">` (or whatever `iconName` is)
- [ ] Edit `iconName` to a different value → the `class` attribute on the span updates
- [ ] Literal-arg variant always renders `<span class="icon icon-envelope">`

### `includeWith` tag

The page-level `{% includeWith %}` call is server-side only — the browser engine re-renders component templates directly, it doesn't re-execute the page. To test `includeWith` in the browser engine, a second `{% includeWith "ed-regions-date-display", dateDisplay %}` call lives inside `ed-regions-custom-features.liquid` itself, rendering a sub-partial with `dateDisplay` props spread into scope.

| Sub-partial | Drive it by editing |
|-------------|---------------------|
| `ed-regions-date-display` (date + label props) | `customFeaturesDemo.dateDisplay.date` or `.label` |

- [ ] Sub-partial renders inside the browser engine — four date formats visible below the `includeWith` section
- [ ] Edit `customFeaturesDemo.dateDisplay.date` → all four date formats in the sub-partial update
- [ ] Edit `customFeaturesDemo.dateDisplay.label` → the label text in the sub-partial updates

### Built-in browser ports — date filters

| Filter | Drive it by editing |
|--------|---------------------|
| `dateToRfc3339` | `sampleDate` |
| `dateToRfc822` | `sampleDate` |
| `htmlDateString` | `sampleDate` |
| `postDate` (browser override) | `sampleDate` |

- [ ] All four formats render non-empty values for the initial `sampleDate: "2023-11-22"`
- [ ] Edit `sampleDate` → all four update to the new date

### Built-in browser ports — slug and url filters

Inputs are hardcoded literals — display only.

- [ ] `"Hello World & More" | slug` → `hello-world-and-more` (or similar simov/slugify output)
- [ ] `"Hello World & More" | slugify` → `hello-world-more` (or similar sindresorhus/slugify output)
- [ ] `"/some/path/" | url` → `/some/path/` (pass-through, no path prefix configured)

---

## Block 2: Derived Globals

**Component:** `site/_includes/ed-regions-derived-globals.liquid`
**Front matter key:** `derivedGlobalsDemo`

These values are derived from the CloudCannon API and the build — they are not driven by user-editable content. Confirm each value looks correct and non-empty in the visual editor.

### Re-render probe

- [ ] Edit `derivedGlobalsDemo.note` → confirm the italic text at the top of Block 2 updates

### `page` object (browser proxy)

The proxy resolves against the file currently open in the Visual Editor.

- [ ] `page.url` → `/ed-regions-test/`
- [ ] `page.inputPath` → something like `./site/pages/ed-regions-test.html`
- [ ] `page.fileSlug` → `ed-regions-test`
- [ ] `page.filePathStem` → `/pages/ed-regions-test` (or similar)
- [ ] `page.outputFileExtension` → `html`
- [ ] `page.outputPath` → something like `_site/ed-regions-test/index.html`
- [ ] `page.date | htmlDateString` → `2024-06-15`
- [ ] `page.date | dateToRfc3339` → ISO 8601 string for 2024-06-15

### `collections.blog` (browser proxy)

Fetched lazily from the CloudCannon API when the component renders.

- [ ] Blog post list is non-empty (6 posts expected)
- [ ] Each post item shows a title, a formatted date, and a `fileSlug`
- [ ] Post URLs are well-formed (e.g. `/blog/email-delivery-tips/`)
- [ ] "Newest post date" renders a valid RFC 822 date string (`getNewestCollectionItemDate | dateToRfc822`)

### `eleventy` global (static, embedded at build time)

- [ ] `eleventy.version` → non-empty version string
- [ ] `eleventy.generator` → string starting with `Eleventy`
- [ ] `eleventy.env.runMode` → `build` (or `serve` if running dev server)
- [ ] `eleventy.env.source` → `cli`
- [ ] `eleventy.directories.input` → `site`
- [ ] `eleventy.directories.includes` → `_includes` (or full path)
- [ ] `eleventy.directories.output` → `_site` (or full path)

### `pkg` global (package.json mirrored verbatim, build-time)

11ty exposes the project's `package.json` as the `pkg` global; the browser bundle mirrors it verbatim.

- [ ] `pkg.name` → `sendit_eleventy`
- [ ] `pkg.version` → `1.0.1`
- [ ] `pkg.description` → non-empty (the Sendit description string)
- [ ] `pkg.author` → `CloudCannon`
- [ ] `pkg.license` → `MIT`

### `buildEnv` global (globals passthrough)

Registered server-side via `addGlobalData("buildEnv", …)` and mirrored into the browser bundle via the plugin's `globals: { buildEnv }` option.

- [ ] `buildEnv.siteName` → `Sendit — ed-regions integration test`
- [ ] `buildEnv.nodeEnv` → `development` (or whatever `NODE_ENV` was at build)
- [ ] Both values are identical between the server render and the browser re-render (confirms the passthrough wired the same object into both halves)

### `inputPathToUrl` (browser port over the page map)

11ty's built-in filter; the browser port resolves an input path against the build-time page map.

- [ ] `"./site/pages/ed-regions-test.html" | inputPathToUrl` → `/ed-regions-test/`
- [ ] `"./site/pages/ed-regions-templated-permalink.html" | inputPathToUrl` → `/ed-regions-templated/templated-permalink-probe/` — resolves a **templated** permalink, which only the page map can supply

---

## Block 3: Templated permalink probe

**Test page:** `/ed-regions-templated/templated-permalink-probe/`
**Source:** `site/pages/ed-regions-templated-permalink.html`
**Front matter key:** `derivedGlobalsDemo` (reuses the Block 2 component)

This page's `permalink` is a Liquid template (`/ed-regions-templated/{{ title | slug }}/`), not a literal string. The live front-matter read can't compute that URL, so the page/collections proxies must fall back to the build-time page map. Open **this page** (not `/ed-regions-test/`) in the Visual Editor to test.

- [ ] Page builds and is reachable at `/ed-regions-templated/templated-permalink-probe/`
- [ ] In the editor, `page.url` in the embedded Block 2 component resolves to `/ed-regions-templated/templated-permalink-probe/` (not the raw `{{ title | slug }}` template, and not empty)
- [ ] `page.outputPath` → something like `_site/ed-regions-templated/templated-permalink-probe/index.html`
- [ ] Editing `derivedGlobalsDemo.note` re-renders the component (confirms the browser engine is running on this page too)

---

## What was built and why

### `package.json`

Added `"@cloudcannon/editable-regions": "github:cloudcannon/editable-regions#fix/11ty-follow-up"` to pull from the branch directly without a published package.

### `.eleventy.js`

Made the config function `async` so it can `await import(...)` the ESM plugin. The CJS wrapper (`index.cjs`) can't `require()` an ESM file, but dynamic `import()` in Node.js resolves the `"import"` export condition correctly.

Also registers `dateToRfc3339`, `dateToRfc822`, `htmlDateString`, and `getNewestCollectionItemDate` server-side. The editable-regions plugin provides browser-side ports for these automatically, but the 11ty build also needs them registered to render any template that uses them at build time (e.g. via `includeWith`). Without this, the build throws `Unknown filter "dateToRfc3339"`.

Added to give a balanced mix of auto-mirror and browser override examples across all three types:

| Registration | Type | Why |
|---|---|---|
| `excerpt` filter | auto-mirror | Pure function, no closure — cleanest possible auto-mirror case |
| `stamp` filter | auto-mirror (closure) | Closes over a module-level `buildInfo` — proves config-replay preserves closures (would break under `fn.toString()`) |
| `callout` paired shortcode | auto-mirror | Pure function, no closure |
| `buildEnv` global | globals passthrough | `addGlobalData` + plugin `globals` option — mirrors a build-time global into the browser |
| `isoDate` shortcode | browser override | Closes over Luxon's `DateTime` — not in the browser bundle |
| `prose` paired shortcode | browser override | Closes over the `md` (markdown-it) instance — not serialisable |
| `icon` custom tag | browser override | Tags are never auto-mirrored |
| Plugin config | — | Explicit overrides for all non-portable registrations (existing filters + new shortcodes) |

### Why browser overrides are needed

**Filters (`postDate`, `markdownify`, `wordCount`):**
- `postDate` references `DateTime` from Luxon, which is not in the browser bundle
- `markdownify` closes over `md = new MarkdownIt(...)`, which can't be serialised
- `wordCount` calls `htmlToPlainText` and `plainTextMetadata` defined in the same CJS module — those names don't exist in the browser bundle

**Shortcodes (`isoDate`, `prose`):**
- `isoDate` closes over Luxon's `DateTime.now()` — not in the browser bundle
- `prose` closes over the same `md` (markdown-it) instance as `markdownify`

### Override files

| File | Purpose |
|------|---------|
| `overrides/icon-tag.mjs` | Full LiquidJS tag factory (ESM) — uses `Tokenizer`/`evalToken`/`toPromise` from liquidjs |
| `overrides/postdate-filter.mjs` | Browser `postDate` using `Intl.DateTimeFormat` to match Luxon's DATE_MED output |
| `overrides/markdownify-filter.mjs` | Inline implementation covering bold, italic, and inline code patterns |
| `overrides/wordcount-filter.mjs` | Self-contained word counter without the module-local helpers |
| `overrides/isodate-shortcode.mjs` | Browser `isoDate` using `new Date().toISOString()` instead of Luxon |
| `overrides/prose-shortcode.mjs` | Browser `prose` using the same inline markdown logic as `markdownify` |

### Test page structure

Two `data-editable="component"` blocks on a single page:

1. **Custom Features** — filters, shortcodes, paired shortcodes, custom tags, `includeWith`. All sections are data-driven by `customFeaturesDemo` front matter. Edit any field and the component re-renders in the browser via the liquid engine.
2. **Derived Globals** — `page` proxy, `collections` proxy, `eleventy` static global. Values come from the CMS/build, not user-editable content. Still wrapped in a component block so the re-render mechanism is exercised (the probe field drives it).

### `includeWith` tag

The page-level `{% includeWith %}` calls are server-side only — the browser engine re-renders component templates directly, it doesn't re-execute the page template. To actually test `includeWith` in the browser engine, a second `{% includeWith "ed-regions-date-display", dateDisplay %}` call is placed inside `ed-regions-custom-features.liquid` itself. That call runs every time the browser engine re-renders Block 1, and the sub-partial (`ed-regions-date-display.liquid`) receives `dateDisplay`'s `date` and `label` props spread into its scope.

---

## Files created or modified

| File | Change |
|------|--------|
| `package.json` | Added `@cloudcannon/editable-regions` GitHub dependency |
| `.eleventy.js` | Registered plugin + `excerpt`, `stamp` (closure), `callout`, `isoDate`, `prose`, `icon`, and `buildEnv` global (mirrored via the plugin's `globals` option) |
| `overrides/icon-tag.mjs` | Browser implementation of `icon` custom tag |
| `overrides/postdate-filter.mjs` | Browser-compatible `postDate` filter |
| `overrides/markdownify-filter.mjs` | Browser-compatible `markdownify` filter |
| `overrides/wordcount-filter.mjs` | Browser-compatible `wordCount` filter |
| `overrides/isodate-shortcode.mjs` | Browser-compatible `isoDate` shortcode |
| `overrides/prose-shortcode.mjs` | Browser-compatible `prose` paired shortcode |
| `site/_includes/layouts/test-shell.liquid` | Minimal layout that loads `register-components.js` |
| `site/_includes/ed-regions-custom-features.liquid` | Block 1 component template |
| `site/_includes/ed-regions-derived-globals.liquid` | Block 2 component template |
| `site/_includes/ed-regions-date-display.liquid` | Sub-partial rendered via `includeWith` inside Block 1 |
| `site/pages/ed-regions-test.html` | Test page with two `data-editable="component"` blocks |
| `site/pages/ed-regions-templated-permalink.html` | Block 3 — page with a templated permalink; forces page-map URL resolution |
