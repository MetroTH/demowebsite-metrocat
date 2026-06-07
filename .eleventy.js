const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  // Parse .yaml / .yml data files (Eleventy has no built-in YAML data support)
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Copy static assets straight through to the output folder
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // ---- Collections: Blog posts & Promotions (newest first, skip drafts) ----
  eleventyConfig.addCollection("post", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => item.data.draft !== true)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("promo", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/promotions/*.md")
      .filter((item) => item.data.draft !== true)
      .sort((a, b) => b.date - a.date)
  );

  // ---- Filters ----
  // Format a date for display (Thai uses Buddhist era via th-TH locale)
  eleventyConfig.addFilter("formatDate", (value, lang = "th") => {
    if (!value) return "";
    const locale = lang === "th" ? "th-TH" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  });

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("byLang", (arr, lang) =>
    (arr || []).filter((item) => item.data.lang === lang)
  );

  // Strip the trailing .th / .en from a fileSlug to get the shared base slug
  eleventyConfig.addFilter("baseSlug", (slug) =>
    String(slug).replace(/\.(th|en)$/, "")
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
