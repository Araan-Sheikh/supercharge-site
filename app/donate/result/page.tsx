import Link from 'next/link';

export default async function DonateResult({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; txnid?: string; amount?: string }>;
}) {
  const params = await searchParams;
  const ok = params.status === 'success';
  return (
    <div className="wrap result-card">
      <span className="eyebrow">SUPPORT SUPERCHARGE</span>
      <h1 style={{marginTop:20}}>{ok ? 'Thank you for your support.' : 'Payment not completed.'}</h1>
      <p>{ok ? `PayU confirmed ₹${params.amount ?? ''} for ${params.txnid ?? 'this donation'}.` : 'PayU did not confirm this payment. You can return to the donation page to try again.'}</p>
      <Link href="/donate" className="button">Back to support →</Link>
    </div>
  );
}
