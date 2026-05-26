const pluginBookshop = require("@bookshop/eleventy-bookshop");
const { DateTime } = require("luxon");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const { wordCountCallback } = require("./site/js/wordCount");
const MarkdownIt = require("markdown-it"),
  md = new MarkdownIt({ html: true });

module.exports = async function (eleventyConfig) {
  const { default: editableRegions } = await import(
    "@cloudcannon/editable-regions/eleventy"
  );

  // --- Built-in browser ports — must also be registered server-side so the
  //     11ty build can render templates that use them (e.g. via includeWith).
  //     The editable-regions plugin handles the browser side automatically.
  eleventyConfig.addFilter("dateToRfc3339", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("dateToRfc822", (d) => new Date(d).toUTCString());
  eleventyConfig.addFilter("htmlDateString", (d) =>
    new Date(d).toISOString().slice(0, 10),
  );
  eleventyConfig.addFilter(
    "getNewestCollectionItemDate",
    (collection) => {
      if (!Array.isArray(collection) || collection.length === 0)
        return new Date(0);
      return collection.reduce((newest, item) => {
        const d = new Date(item?.date ?? 0);
        return d > newest ? d : newest;
      }, new Date(0));
    },
  );

  // --- Existing filters ---
  eleventyConfig.addFilter("length", (input) => input.length);
  eleventyConfig.addFilter("postDate", (dateObj) =>
    DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED),
  );
  eleventyConfig.addPlugin(emojiReadTime, { showEmoji: false });
  eleventyConfig.addFilter("wordCount", wordCountCallback);
  eleventyConfig.addFilter("markdownify", (markdown) => md.render(markdown));
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // --- New: paired shortcode — auto-mirror (pure function, no imports) ---
  eleventyConfig.addPairedShortcode(
    "callout",
    (content, type = "info") =>
      `<div class="callout callout--${type}" role="note">${content}</div>`,
  );

  // --- New: paired shortcode — browser override (closes over md instance) ---
  eleventyConfig.addPairedShortcode(
    "prose",
    (content) => `<div class="prose">${md.render(content)}</div>`,
  );

  // --- New: shortcode — browser override (closes over DateTime from Luxon) ---
  eleventyConfig.addShortcode(
    "isoDate",
    () => DateTime.now().toISO(),
  );

  // --- New: portable filter (clean auto-mirror test — pure function, no imports) ---
  eleventyConfig.addFilter("excerpt", (str, len = 120) =>
    str
      ? `${String(str)
          .replace(/<[^>]+>/g, "")
          .slice(0, len)
          .trimEnd()}…`
      : "",
  );

  // --- New: custom Liquid tag (server-side factory, browser side via overrides/icon-tag.mjs) ---
  eleventyConfig.addLiquidTag("icon", function iconTagFactory() {
    return {
      parse(tagToken) {
        this.rawArg = tagToken.args.trim();
      },
      render(ctx) {
        const isQuoted = /^['"].*['"]$/.test(this.rawArg);
        const name = isQuoted
          ? this.rawArg.slice(1, -1)
          : ctx.get(this.rawArg);
        return `<span class="icon icon-${name || this.rawArg}" aria-hidden="true"></span>`;
      },
    };
  });

  // --- Editable regions plugin ---
  eleventyConfig.addPlugin(editableRegions, {
    liquid: {
      extensions: [".liquid", ".html"],
      tags: {
        icon: "./overrides/icon-tag.mjs",
      },
      filters: {
        // postDate and markdownify depend on Luxon/markdown-it, which aren't
        // available in the browser bundle — provide portable replacements.
        postDate: "./overrides/postdate-filter.mjs",
        markdownify: "./overrides/markdownify-filter.mjs",
        // wordCount references module-local helpers, so can't be auto-mirrored.
        wordCount: "./overrides/wordcount-filter.mjs",
      },
      shortcodes: {
        // isoDate closes over DateTime from Luxon.
        isoDate: "./overrides/isodate-shortcode.mjs",
      },
      pairedShortcodes: {
        // prose closes over the md (markdown-it) instance.
        prose: "./overrides/prose-shortcode.mjs",
      },
    },
  });

  // --- Existing plugins and passthrough ---
  eleventyConfig.htmlTemplateEngine = "liquid";
  eleventyConfig.addPlugin(
    pluginBookshop({
      bookshopLocations: ["component-library"],
      pathPrefix: "",
    }),
  );
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
