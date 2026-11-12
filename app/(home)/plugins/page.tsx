import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { catalog } from '@/lib/plugin-platform/store';
import { PluginCatalog } from '@/components/plugin-catalog';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata = pageMetadata('Plugins & Skills', 'Discover MCP tools and reusable skills for the Supercharge CLI and Studio. Extend your AI coding workflow.', '/plugins');
export default async function PluginsPage(){
  let plugins:Awaited<ReturnType<typeof catalog>>=[]; let unavailable=false;
  try{plugins=await catalog(false);}catch{unavailable=true;}
  return <div className="wrap"><header className="page-intro"><span className="eyebrow">EXTEND YOUR WORKSPACE</span><h1>Your tools.<br/>Working together.</h1><p>Add MCP tools and reusable skills to Supercharge. Find a plugin, install it once, and bring it into your workflow.</p></header><PluginCatalog plugins={plugins.map(p=>({name:p.name,displayName:p.displayName,description:p.description,version:p.version,source:p.source,serverCount:p.serverCount,skillCount:p.skillCount}))} unavailable={unavailable}/><div style={{paddingBottom:30}}><Link href="/admin/plugins" className="text-button">Manage catalog ↗</Link></div></div>;
}
