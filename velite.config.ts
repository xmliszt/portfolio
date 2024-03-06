import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';
import { defineCollection, defineConfig, s } from 'velite';

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const count = s
  .object({ total: s.number(), posts: s.number() })
  .default({ total: 0, posts: 0 });

const meta = s
  .object({
    title: s.string().optional(),
    description: s.string().optional(),
    keywords: s.array(s.string()).optional(),
  })
  .default({});

const options = defineCollection({
  name: 'Options',
  pattern: 'options/index.yml',
  single: true,
  schema: s.object({
    name: s.string().max(20),
    title: s.string().max(99),
    description: s.string().max(999).optional(),
    keywords: s.array(s.string()),
    author: s.object({
      name: s.string(),
      email: s.string().email(),
      url: s.string().url(),
    }),
  }),
});

const tags = defineCollection({
  name: 'Tag',
  pattern: 'tags/index.yml',
  schema: s
    .object({
      name: s.string().max(20),
      slug: s.slug('tag'),
      cover: s.image().optional(),
      description: s.string().max(999).optional(),
      count,
    })
    .transform((data) => ({ ...data, permalink: `/${data.slug}` })),
});

const pages = defineCollection({
  name: 'Page',
  pattern: 'pages/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(99),
      subtitle: s.string().max(999).optional(),
      slug: s.slug('page'),
      body: s.mdx(),
      toc: s.toc({
        prefix: 'anchor:',
      }),
      showToc: s.boolean().default(true),
    })
    .transform((data, { meta }) => ({
      ...data,
      permalink: `/${data.slug}`,
      path: meta.path,
    })),
});

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.slug('post'),
      date: s.isodate(),
      updated: s.isodate().optional(),
      cover: s.image().optional(),
      video: s.file().optional(),
      description: s.string().max(999).optional(),
      draft: s.boolean().default(false),
      featured: s.boolean().default(false),
      tags: s.array(s.string()).default([]),
      meta: meta,
      toc: s.toc({
        prefix: 'anchor:',
      }),
      metadata: s.metadata(),
      excerpt: s.excerpt({
        length: 200,
      }),
      content: s.mdx(),
    })
    .transform((data) => ({ ...data, permalink: `/blog/${data.slug}` })),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { options, tags, pages, posts },
  mdx: {
    rehypePlugins: [
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'pre') {
            const [codeEl] = node.children;

            if (codeEl.tagName !== 'code') return;

            node.raw = codeEl.children?.[0].value;
          }
        });
      },
      [
        rehypePrettyCode,
        { theme: { light: 'vitesse-light', dark: 'vitesse-dark' } },
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'figure') {
            if (!('data-rehype-pretty-code-figure' in node.properties)) {
              return;
            }

            for (const child of node.children) {
              if (child.tagName === 'pre') {
                child.properties['raw'] = node.raw;
              }
            }
          }
        });
      },
    ],
  },
  prepare: ({ tags, posts }) => {
    const docs = posts.filter(
      (i) => process.env.NODE_ENV !== 'production' || !i.draft
    );

    const tagsFromDoc = Array.from(
      new Set(docs.map((item) => item.tags).flat())
    ).filter((i) => tags.find((j) => j.name === i) == null);
    tags.push(
      ...tagsFromDoc.map((name) => ({
        name,
        slug: slugify(name),
        permalink: '',
        count: { total: 0, posts: 0 },
      }))
    );
    tags.forEach((i) => {
      i.count.posts = posts.filter((j) => j.tags.includes(i.name)).length;
      i.count.total = i.count.posts;
      i.permalink = `/${i.slug}`;
    });

    // return false // return false to prevent velite from writing data to disk
  },
});
