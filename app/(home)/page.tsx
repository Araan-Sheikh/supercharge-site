import HomePage from '@/components/home-page';
import { StructuredData } from '@/components/structured-data';
import { absoluteUrl, pageMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata = pageMetadata('AI Coding Agent for CLI & Studio', SITE_DESCRIPTION, '/');

export default function Page() {
  return <>
    <StructuredData data={{
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME,
          url: SITE_URL, logo: absoluteUrl('/logo.png'),
        },
        {
          '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME,
          url: SITE_URL, description: SITE_DESCRIPTION, inLanguage: 'en',
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
        {
          '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`,
          name: 'Supercharge', url: SITE_URL, description: SITE_DESCRIPTION,
          applicationCategory: 'DeveloperApplication', operatingSystem: 'Windows, macOS, Linux, Android',
          screenshot: absoluteUrl('/studio-desktop.png'), downloadUrl: absoluteUrl('/download'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', url: absoluteUrl('/download'), description: 'Supercharge is free to use. Your model provider may charge for usage.' },
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
      ],
    }} />
    <HomePage />
  </>;
}
