const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  // Parse .yaml / .yml data files (Eleventy has no built-in YAML data support)
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Copy static assets straight through to the output folder
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

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
