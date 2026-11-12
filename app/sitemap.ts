import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only public canonical pages. Avoid inventing last-modified timestamps at build time.
  const paths = ['/', '/download', '/plugins', '/donate', ...source.getPages().map(page => page.url)];
  return [...new Set(paths)].map(path => ({ url: absoluteUrl(path) }));
}
