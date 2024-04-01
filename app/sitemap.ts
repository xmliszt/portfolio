import { MetadataRoute } from 'next';

import { focus, hobbies, posts, tags } from '#site/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteMapContent: MetadataRoute.Sitemap = [
    {
      url: 'https://liyuxuan.dev/about',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/posts',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/tags',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/playground',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/hobbies',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/focus',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/the-why',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/contacts',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ];

  const postsSiteMap: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://liyuxuan.dev/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 1,
  }));

  const hobbiesSiteMap: MetadataRoute.Sitemap = hobbies.map((hobby) => ({
    url: `https://liyuxuan.dev/hobbies/${hobby.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
  }));

  const focusSiteMap: MetadataRoute.Sitemap = focus.map((focus) => ({
    url: `https://liyuxuan.dev/focus/${focus.slug}`,
    lastModified: focus.updated ? new Date(focus.updated) : new Date(),
    changeFrequency: 'monthly',
    priority: 1,
  }));

  const tagsSiteMap: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `https://liyuxuan.dev/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  }));

  const experimentsSiteMap: MetadataRoute.Sitemap = [
    {
      url: 'https://liyuxuan.dev/experiments/piano',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://liyuxuan.dev/experiments/dune-themed-light-dark-toggle',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ];

  return siteMapContent.concat(
    postsSiteMap,
    hobbiesSiteMap,
    focusSiteMap,
    experimentsSiteMap,
    tagsSiteMap
  );
}
