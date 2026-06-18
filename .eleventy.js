const { DateTime } = require("luxon");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const { wordCountCallback } = require("./site/js/wordCount");
const MarkdownIt = require("markdown-it"),
  md = new MarkdownIt({ html: true });
const editableRegions = require("@cloudcannon/editable-regions/eleventy");
const { Tokenizer, evalToken, toPromise } = require("liquidjs");
const fs = require("node:fs");

// Module-level value the `stamp` filter below closes over. The plugin bundles
// the real config and replays it in the browser, so this closure survives into
// the browser bundle. The old fn.toString() approach couldn't capture
// `buildInfo` (a free identifier with no browser-side scope), so the browser
// render would throw — this is the closure-survival auto-mirror probe.
const buildInfo = { label: "build-closure-ok" };

module.exports = function (eleventyConfig) {
  // --- Built-in browser ports — must also be registered server-side so the
  //     11ty build can render templates that use them (e.g. via includeWith).
  //     The editable-regions plugin handles the browser side automatically.
  eleventyConfig.addFilter("dateToRfc3339", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("dateToRfc822", (d) => new Date(d).toUTCString());
  eleventyConfig.addFilter("htmlDateString", (d) =>
    new Date(d).toISOString().slice(0, 10),
  );
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    if (!Array.isArray(collection) || collection.length === 0)
      return new Date(0);
    return collection.reduce((newest, item) => {
      const d = new Date(item?.date ?? 0);
      return d > newest ? d : newest;
    }, new Date(0));
  });

  // --- Existing filters. These all AUTO-MIRROR: config-replay bundles the real
  //     config, so closures and ordinary npm imports (luxon, markdown-it)
  //     survive into the browser bundle. No overrides needed. ---
  eleventyConfig.addFilter("length", (input) => input.length);
  // postDate uses Luxon (bundles for the browser). Coerce strings to Date so a
  // front-matter value like "2023-11-22" works, and pin the locale so the
  // server render and the auto-mirrored browser render produce identical output.
  eleventyConfig.addFilter("postDate", (dateObj) =>
    DateTime.fromJSDate(dateObj instanceof Date ? dateObj : new Date(dateObj))
      .setLocale("en-US")
      .toLocaleString(DateTime.DATE_MED),
  );
  eleventyConfig.addPlugin(emojiReadTime, { showEmoji: false });
  // wordCount imports a local module (site/js/wordCount.js) — bundled too.
  eleventyConfig.addFilter("wordCount", wordCountCallback);
  // markdownify closes over the module-level markdown-it instance — both the
  // closure and markdown-it itself survive bundling, so it auto-mirrors.
  eleventyConfig.addFilter("markdownify", (markdown) => md.render(markdown));
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // --- Paired shortcode — auto-mirror (pure function, no imports) ---
  eleventyConfig.addPairedShortcode(
    "callout",
    (content, type = "info") =>
      `<div class="callout callout--${type}" role="note">${content}</div>`,
  );

  // --- Paired shortcode — auto-mirror. Closes over the same markdown-it
  //     instance as markdownify; both survive bundling. ---
  eleventyConfig.addPairedShortcode(
    "prose",
    (content) => `<div class="prose">${md.render(content)}</div>`,
  );

  // --- Shortcode — auto-mirror. Uses Luxon's DateTime (bundles for the
  //     browser). Display-only: build time vs render time differ. ---
  eleventyConfig.addShortcode("isoDate", () => DateTime.now().toISO());

  // --- New: auto-mirror filter that CLOSES OVER a module-level value ---
  //     Verifies the config-replay mirror (not fn.toString()) carries closures
  //     into the browser bundle. No override needed; browser must match server.
  eleventyConfig.addFilter("stamp", (str) => `${str} [${buildInfo.label}]`);

  // --- New: portable filter (clean auto-mirror test — pure function, no imports) ---
  eleventyConfig.addFilter("excerpt", (str, len = 120) =>
    str
      ? `${String(str)
          .replace(/<[^>]+>/g, "")
          .slice(0, len)
          .trimEnd()}…`
      : "",
  );

  // --- Custom Liquid tag — auto-mirror. The factory uses liquidjs's
  //     Tokenizer/evalToken (pulled via require; liquidjs bundles for the
  //     browser), so the same `{% icon %}` tag works server- and browser-side
  //     with no override. (`addLiquidTag` is mirrored like any other helper.) ---
  eleventyConfig.addLiquidTag("icon", function iconTagFactory() {
    return {
      parse(tagToken) {
        const tokenizer = new Tokenizer(
          tagToken.args,
          this.liquid.options.operatorsTrie,
        );
        this.nameToken = tokenizer.readValue();
        if (!this.nameToken) throw new Error("icon: missing name argument");
      },
      async render(context) {
        const name = await toPromise(evalToken(this.nameToken, context));
        return `<span class="icon icon-${name}" aria-hidden="true"></span>`;
      },
    };
  });

  // --- Genuinely non-portable filter — the ONLY override case. Reads a file
  //     size from disk via fs.statSync; `node:fs` is stubbed in the browser
  //     bundle (it can't run there), so this REQUIRES a browser override
  //     (overrides/filesize-filter.mjs). This is the real trigger for an
  //     override: invoking a Node/build-time API at render time. ---
  eleventyConfig.addFilter(
    "fileSize",
    (filePath) => fs.statSync(filePath).size,
  );

  // --- CUSTOM global data via addGlobalData ---
  //     The four globals 11ty ships (`page`, `collections`, `eleventy`, `pkg`)
  //     are shimmed by the plugin automatically — no passthrough needed. This is
  //     a *custom* global the project defines itself. Config-replay only mirrors
  //     helper registrations (addFilter/addShortcode/addLiquidTag), NOT
  //     addGlobalData — so a custom global like this is invisible to the browser
  //     engine unless it's handed over explicitly (see `globals` below).
  const buildEnv = {
    siteName: "Sendit — ed-regions integration test",
    nodeEnv: process.env.NODE_ENV || "development",
  };
  eleventyConfig.addGlobalData("buildEnv", buildEnv);

  // --- Editable regions plugin ---
  eleventyConfig.addPlugin(editableRegions, {
    liquid: {
      extensions: [".liquid", ".html"],
      // The only browser override needed: `fileSize` calls fs.statSync, which
      // can't run in the browser. Everything else — filters, shortcodes, the
      // custom tag — auto-mirrors via config-replay; closures and bundled npm
      // imports (luxon, markdown-it, liquidjs) survive into the browser bundle.
      filters: {
        fileSize: "./overrides/filesize-filter.mjs",
      },
    },
    // `globals` is the passthrough for CUSTOM global data (values added with
    // addGlobalData that aren't one of 11ty's auto-shimmed built-ins). Hand the
    // same `buildEnv` object to the browser engine so live editing resolves it.
    globals: { buildEnv },
  });

  // --- Existing plugins and passthrough ---
  eleventyConfig.htmlTemplateEngine = "liquid";
  eleventyConfig.addPassthroughCopy("site/css");
  eleventyConfig.addPassthroughCopy("site/fonts");
  eleventyConfig.addPassthroughCopy("site/images");
  eleventyConfig.addPassthroughCopy("site/js");
  eleventyConfig.addPassthroughCopy("site/vendor");

  return {
    dir: {
      input: "site",
      pages: "pages",
    },
  };
};
