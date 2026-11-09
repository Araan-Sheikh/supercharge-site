import { getLLMText, source } from '@/lib/source';

export const revalidate = false;

/** Plain markdown for one docs page. Share actions point models here. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await ctx.params;
  const page = source.getPage(slug);
  if (!page) return new Response('Not found\n', { status: 404 });
  const text = await getLLMText(page);
  return new Response(text, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
