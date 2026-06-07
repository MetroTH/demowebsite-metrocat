// Applies to every Markdown file in src/posts/
module.exports = {
  layout: "layouts/post.njk",
  tags: "post",
  permalink: "/blog/{{ page.fileSlug | slugify }}/index.html",
  draft: false,
  eleventyComputed: {
    pageTitle: (data) => `${data.title} | Metro CAT`,
    pageDescription: (data) => data.excerpt || data.title,
    ogImage: (data) => data.image || "",
  },
};
