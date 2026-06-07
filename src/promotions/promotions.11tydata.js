// Applies to every Markdown file in src/promotions/
module.exports = {
  layout: "layouts/promo.njk",
  tags: "promo",
  permalink: "/promotions/{{ page.fileSlug | slugify }}/index.html",
  draft: false,
  eleventyComputed: {
    pageTitle: (data) => `${data.title} | Metro CAT`,
    pageDescription: (data) => data.excerpt || data.title,
    ogImage: (data) => data.image || "",
  },
};
