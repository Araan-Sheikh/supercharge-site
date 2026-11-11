import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { payuConfig } from '@/lib/payu';
import { DonateForm } from './donate-form';
export const metadata: Metadata = {title:'Support Supercharge',description:'Support Supercharge with a one-time donation through PayU.'};
export default function DonatePage(){
  const ready=payuConfig().ready;
  return <div className="wrap support-layout"><header className="page-intro"><span className="eyebrow">SUPPORT THE PROJECT</span><h1>Help keep<br/>possibility open.</h1><p>Supercharge is free to use. If it has helped you build something, you can support the project with a one-time donation.</p><Link className="text-button" style={{marginTop:25}} href="/download">Explore Supercharge <ArrowUpRight size={15}/></Link></header><section className="support-card"><h2>Make a contribution</h2><p>A one-time payment in INR through PayU. This does not buy a subscription, plan, or model credits.</p>{ready?<DonateForm/>:<p role="status">Donations are not available right now. You can keep using Supercharge for free.</p>}</section></div>;
}
