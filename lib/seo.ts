import type { Metadata } from 'next';

export const SITE_URL = 'https://www.superchargeai.in';
export const SITE_NAME = 'Supercharge';
export const SITE_DESCRIPTION = 'An AI coding agent for your terminal and desktop. Bring your own model provider, work in your local repository, and extend your workflow with tools and skills.';
export const absoluteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString();

export function pageMetadata(title: string, description: string, path: string, image = '/og/site'): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: 'website', siteName: SITE_NAME, locale: 'en_US',
      title: `${title} | ${SITE_NAME}`, description, url: absoluteUrl(path),
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description,
      images: [absoluteUrl(image)],
    },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}
