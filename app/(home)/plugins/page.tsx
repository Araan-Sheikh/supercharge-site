import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { catalog } from '@/lib/plugin-platform/store';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata = { title: 'Plugins · Supercharge', description: 'Tools and reusable workflows for the Supercharge CLI and desktop app.' };
export default async function PluginsPage() {
  let plugins: Awaited<ReturnType<typeof catalog>> = []; let unavailable = false;
  try { plugins = await catalog(false); } catch { unavailable = true; }
  return <div className="mx-auto w-full max-w-5xl px-6 py-20"><div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><h1 className="mb-4 text-4xl font-semibold tracking-tight">More tools. Ready-made workflows.</h1><p className="max-w-xl text-fd-muted-foreground">Install a plugin once to give Supercharge MCP tools and the skills to use them. Available in the CLI and desktop app.</p></div><Link className="inline-flex items-center gap-2 text-sm text-orange-400" href="/admin/plugins">Manage catalog <ArrowRight size={16}/></Link></div>
    <div className="mb-8 rounded-lg border border-fd-border p-5"><p className="mb-2 text-sm text-fd-muted-foreground">Connect this catalog to your agent:</p><code className="break-all text-sm">supercharge plugin catalog configure --url https://www.superchargeai.in/api/plugins/v1</code></div>
    {unavailable ? <p role="status" className="text-fd-muted-foreground">The catalog is temporarily unavailable. Please try again later.</p> : !plugins.length ? <div className="py-16 text-center"><Package className="mx-auto mb-4 text-orange-400" size={32}/><h2 className="mb-2 text-xl font-medium">The catalog is getting started.</h2><p className="text-fd-muted-foreground">Public plugins will appear here when the catalog owner publishes them.</p></div> : <div>{plugins.map((p) => <article className="flex flex-wrap justify-between gap-6 border-b border-fd-border py-8" key={p.name}><div className="max-w-xl"><div className="mb-2 flex items-center gap-3"><h2 className="text-xl font-semibold">{p.displayName}</h2><span className="text-xs text-fd-muted-foreground">{p.version}</span></div><p className="mb-3 text-fd-muted-foreground">{p.description}</p><p className="text-xs text-fd-muted-foreground">{p.serverCount} MCP servers · {p.skillCount} skills</p></div><code className="self-center break-all rounded-md border border-fd-border bg-fd-card px-4 py-3 text-xs">supercharge plugin install {p.source} --trust</code></article>)}</div>}
  </div>;
}
