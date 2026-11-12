import { StructuredData } from '@/components/structured-data';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { CopyPageButton } from '@/components/CopyPageButton';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const pageUrl = page.url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <StructuredData data={breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Documentation', path: '/docs' },
        ...(page.url === '/docs' ? [] : [{ name: page.data.title, path: page.url }]),
      ])} />
      <div className="flex items-start justify-between gap-4 mb-2">
        <DocsTitle>{page.data.title}</DocsTitle>
        <CopyPageButton pageTitle={page.data.title} pageUrl={pageUrl} />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return pageMetadata(
    page.data.title,
    page.data.description || `Learn about ${page.data.title} in the Supercharge documentation.`,
    page.url,
    getPageImage(page).url,
  );
}
