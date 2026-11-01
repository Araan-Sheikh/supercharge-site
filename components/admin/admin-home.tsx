'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, LockKeyhole, LogOut, Package } from 'lucide-react';
import styles from './admin-home.module.css';

const SESSION = '/api/plugins/v1/admin/session';

async function session(method = 'GET', key?: string) {
  const response = await fetch(SESSION, {
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: key === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: key === undefined ? undefined : JSON.stringify({ key }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Unable to complete the request.');
  return body as { authenticated: boolean };
}

export function AdminHome() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void session().then(result => { if (active) setAuthenticated(result.authenticated); }, err => {
      if (active) { setAuthenticated(false); setError(err instanceof Error ? err.message : 'Unable to check your session.'); }
    });
    return () => { active = false; };
  }, []);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await session('POST', password);
      setPassword(''); setAuthenticated(result.authenticated);
    } catch (err) {
      setPassword(''); setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true); setError('');
    try { await session('DELETE'); setAuthenticated(false); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign out.'); }
    finally { setBusy(false); }
  }

  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/"><Image src="/logo.png" width={28} height={28} alt=""/>Supercharge</Link>
      <span className={styles.divider}/><span className={styles.headerLabel}>Admin</span>
      {authenticated && <button className={styles.signOut} disabled={busy} onClick={() => void signOut()}><LogOut size={16}/>Sign out</button>}
    </header>
    <main className={authenticated ? styles.dashboard : styles.login}>
      {authenticated === null ? <p className={styles.muted}>Checking your session…</p> : authenticated ? <>
        <p className={styles.eyebrow}>SUPERCHARGE ADMIN</p>
        <h1>Welcome to your control center.</h1>
        <p className={styles.intro}>Manage your Supercharge services from one place.</p>
        {error && <div className={styles.error} role="alert"><AlertCircle size={18}/>{error}</div>}
        <h2>Your tools</h2>
        <Link className={styles.card} href="/admin/plugins">
          <span className={styles.cardIcon}><Package size={23}/></span>
          <span className={styles.cardText}><strong>Plugins</strong><span>Create and publish plugins, skills, and MCP servers for your agents.</span></span>
          <ArrowRight className={styles.arrow} size={20}/>
        </Link>
      </> : <>
        <div className={styles.lock}><LockKeyhole size={22}/></div>
        <p className={styles.eyebrow}>SUPERCHARGE ADMIN</p>
        <h1>Sign in to admin.</h1>
        <p className={styles.intro}>Enter your administrator password to manage your Supercharge services.</p>
        {error && <div className={styles.error} role="alert"><AlertCircle size={18}/>{error}</div>}
        <form className={styles.form} onSubmit={signIn}>
          <label htmlFor="admin-password">Administrator password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/>
          <button disabled={busy || !password}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17}/></button>
        </form>
        <p className={styles.hint}>Use the administrator access key configured on your site server.</p>
      </>}
    </main>
  </div>;
}
