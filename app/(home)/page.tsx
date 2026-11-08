'use client';

import Link from 'next/link';
import { ArrowRight, Download, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { androidUniversal, desktopDownloads, serverDownloads, studioLatestDownload, studioRelease } from '@/lib/studio-downloads';

// Intersection observer hook for scroll animations
const scrollObservers = new WeakMap<object, IntersectionObserver>();

function Reveal({ className, children }: { className: string; children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [key] = useState(() => ({}));
  const setNode = useCallback((node: HTMLDivElement | null) => {
    scrollObservers.get(key)?.disconnect();
    if (!node) {
      scrollObservers.delete(key);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(node);
    scrollObservers.set(key, observer);
  }, [key]);

  return (
    <div ref={setNode} className={`${className} transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {children}
    </div>
  );
}

const UNIX_INSTALL = 'curl -fsSL https://www.superchargeai.in/install.sh | bash';
const WINDOWS_INSTALL = 'irm https://www.superchargeai.in/install.ps1 | iex';

function InstallCommands() {
  const [os, setOs] = useState<'unix' | 'windows'>('unix');
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<'unix' | 'windows' | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const ua = navigator.userAgent || '';
      const platform = navigator.platform || '';
      setOs(/Win/i.test(platform) || /Windows/i.test(ua) ? 'windows' : 'unix');
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function copy(kind: 'unix' | 'windows') {
    const text = kind === 'windows' ? WINDOWS_INSTALL : UNIX_INSTALL;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  const cards = [
    {
      kind: 'unix' as const,
      label: 'macOS and Linux',
      command: UNIX_INSTALL,
    },
    {
      kind: 'windows' as const,
      label: 'Windows PowerShell',
      command: WINDOWS_INSTALL,
    },
  ].sort((a, b) => (a.kind === os ? -1 : b.kind === os ? 1 : 0));

  const active = cards[0];
  return (
    <div className="mt-8 flex w-full max-w-3xl items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-4 pr-2">
      <button
        type="button"
        onClick={() => setOs(os === 'windows' ? 'unix' : 'windows')}
        className="shrink-0 rounded-full px-2 py-1 font-mono text-[11px] text-zinc-400 hover:text-white"
      >
        {ready ? (os === 'windows' ? 'ps1' : 'bash') : '…'}
      </button>
      <button type="button" onClick={() => copy(active.kind)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <code className="truncate font-mono text-sm text-orange-100">{active.command}</code>
        <span className="ml-auto shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-black">
          {copied === active.kind ? 'Copied' : 'Copy'}
        </span>
      </button>
    </div>
  );
}

const capabilities = [
  { title: 'Terminal', command: 'supercharge', detail: 'Interactive session in the repo you open. The agent reads files, runs tools, and edits code.', href: '/docs/commands' },
  { title: 'Fully BYOK', command: '/setup', detail: 'You bring the key and the base URL. Supercharge does not sell a subscription or a credit balance. Switch the format later with /format.', href: '/docs/setup' },
  { title: 'Three API formats', command: 'chat · messages · responses', detail: 'Chat Completions, Anthropic Messages, and OpenAI Responses. The CLI adds the path from the format you pick.', href: '/docs/setup' },
  { title: 'ACP server', command: 'supercharge agent serve', detail: 'Agent Client Protocol on 127.0.0.1:2419. Editors reconnect with the same secret.', href: '/docs/modes' },
  { title: 'Inbox daemon', command: 'supercharge agent daemon', detail: 'HTTP inbox on port 8790 when the companion server is installed. Thin clients never launch the CLI.', href: '/docs/modes' },
  { title: 'One-shot runs', command: 'supercharge -p "…"', detail: 'A prompt, then exit. JSON output, tool allow lists, and --yolo for unattended runs.', href: '/docs/commands' },
  { title: 'Custom agents', command: '/new_agent', detail: 'Write your own chat agent. Shift+Tab cycles Agent, Plan, Ask, those agents, Always-Approve, and Auto-Review.', href: '/docs/agents' },
  { title: 'Sessions', command: '/resume', detail: 'Continue, rewind, compact, copy, and export conversations under ~/.supercharge/sessions.', href: '/docs/sessions' },
  { title: 'Permissions', command: '/always-approve', detail: 'Ask, Auto-Review, or Always-Approve. --allow and --deny still gate shell and file tools.', href: '/docs/permissions' },
  { title: 'Memory', command: '/remember', detail: 'Curated USER.md and MEMORY.md notes. Experimental /flush stays off unless you turn it on.', href: '/docs/memory' },
  { title: 'Extensions', command: '/mcps', detail: 'MCP servers, skills, plugins, and hooks. Project rules live in AGENTS.md.', href: '/docs/extensions' },
];

function useTypewriter(text: string, speed = 55) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    setIsComplete(false);
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

const steps = [
  { n: "01", title: "Install", body: "One command. The binary lands in ~/.local/bin as supercharge.", href: "/docs/install" },
  { n: "02", title: "Connect a model", body: "/setup takes a key, or a browser sign-in for Mistral, Nous, OpenCode Go, and OpenCode Zen.", href: "/docs/setup" },
  { n: "03", title: "Work in the repo", body: "Shift+Tab walks Agent, Plan, Ask, the agents you wrote, Always-Approve, and Auto-Review.", href: "/docs/agents" },
];

const modes = ['Agent', 'Plan', 'Ask', 'your agent', 'Always-Approve', 'Auto-Review'];

function SessionPanel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % modes.length), 1400);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_40px_120px_-48px_rgba(249,115,22,0.7)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        <span className="ml-2 font-mono text-xs text-zinc-500">supercharge</span>
      </div>
      <div className="space-y-4 px-5 py-6 font-mono text-sm">
        <p className="text-zinc-500">$ supercharge</p>
        <p className="text-zinc-300">/setup <span className="text-zinc-500">· key stays on this machine</span></p>
        <p>
          <span className="text-zinc-500">Switched to mode: </span>
          <span className="text-orange-300">{modes[index]}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {modes.map((mode, modeIndex) => (
            <span
              key={mode}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors duration-500 ${modeIndex === index ? 'bg-orange-500 text-black' : 'bg-white/5 text-zinc-400'}`}
            >
              {mode}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { displayText, isComplete } = useTypewriter('runs on your machine.');
  return (
    <div className="flex w-full flex-col bg-black text-zinc-100">
      <style jsx global>{`
        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(24px, -18px, 0) scale(1.06); }
        }
        @keyframes caret {
          50% { opacity: 0; }
        }
        .rise { animation: rise 0.7s ease both; }
        .drift { animation: drift 14s ease-in-out infinite; }
        .caret { animation: caret 1s steps(1) infinite; }
      `}</style>
      <header className="relative w-full overflow-hidden px-6 pb-16 pt-14 md:px-10 lg:px-16 lg:pb-24 lg:pt-20">
        <div className="pointer-events-none absolute left-[-8%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-orange-600/20 blur-3xl drift" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="rise font-mono text-xs uppercase tracking-[0.22em] text-orange-400">CLI 1.4.5 · no subscription</p>
            <h1 className="rise mt-5 text-6xl font-semibold leading-[0.95] tracking-tight text-white md:text-8xl" style={{ animationDelay: '0.08s' }}>
              A coding agent that
              <span className="mt-2 block text-orange-500">
                {displayText}
                {!isComplete && <span className="caret">|</span>}
              </span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-8 text-zinc-400" style={{ animationDelay: '0.16s' }}>
              It reads the repo, edits files, and runs commands. The model key stays in <span className="font-mono text-zinc-200">/setup</span>.
            </p>
            <div className="rise" style={{ animationDelay: '0.22s' }}>
              <InstallCommands />
            </div>
            <div className="rise mt-5 flex flex-wrap items-center gap-5 text-sm" style={{ animationDelay: '0.3s' }}>
              <Link href="/docs" className="inline-flex items-center gap-2 font-medium text-white">
                Read the docs <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#studio-downloads" className="text-zinc-400 hover:text-white">Studio</a>
              <Link href="/donate" className="text-zinc-400 hover:text-white">Donate</Link>
            </div>
          </div>
          <div className="rise" style={{ animationDelay: '0.2s' }}>
            <SessionPanel />
          </div>
        </div>
      </header>

      <section className="grid border-y border-white/10 md:grid-cols-3">
        {steps.map((step, index) => (
          <Link key={step.n} href={step.href} className="group px-6 py-8 md:px-10 lg:px-16" style={{ animationDelay: `${0.1 + index * 0.08}s` }}>
            <p className="font-mono text-3xl text-white/15 transition group-hover:text-orange-500/80">{step.n}</p>
            <h2 className="mt-4 text-lg font-medium text-white">{step.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{step.body}</p>
          </Link>
        ))}
      </section>

      <section className="grid items-center gap-8 px-6 py-16 md:px-10 lg:grid-cols-[1.4fr_0.8fr] lg:px-16">
        <video
          className="w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
          src="/using-supercharge.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-orange-400">In the terminal</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Shift+Tab is the whole control.</h2>
          <p className="mt-4 text-zinc-400">Agent, Plan, and Ask change the work. Always-Approve and Auto-Review change whether a tool asks you first. <span className="text-zinc-200">/new_agent</span> adds one of your own to that ring.</p>
        </div>
      </section>

      <section className="relative z-10 w-full border-t border-white/10 px-6 py-16 md:px-10 lg:px-16" aria-labelledby="studio-downloads">
        <div className="w-full">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-orange-400">Studio · {studioRelease}</p>
              <h2 id="studio-downloads" className="mt-2 text-4xl font-semibold tracking-tight text-white">The app on top of the CLI.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-500">Install the CLI first. The phone talks to the computer.</p>
          </div>
          <div className="mb-10 grid items-start gap-4">
            <img
              src="/studio-desktop.png"
              alt="Supercharge Studio on the desktop, with a phone message in the chat and the browser panel open"
              className="w-full rounded-2xl border border-zinc-800"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <img src="/studio-phone-chat.png" alt="The same chat on the phone, connected to the computer" className="w-full rounded-2xl border border-zinc-800" />
              <img src="/studio-phone-chats.png" alt="Phone chat history grouped by how recently each chat was used" className="w-full rounded-2xl border border-zinc-800" />
              <img src="/studio-phone-projects.png" alt="Phone project list while connected on Wi-Fi" className="w-full rounded-2xl border border-zinc-800" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {desktopDownloads.map((download) => (
              <a
                key={download.file}
                href={`${studioLatestDownload}/${download.file}`}
                className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 transition hover:border-orange-500/50"
              >
                <span className="text-left">
                  <span className="block font-medium text-zinc-100">{download.name}</span>
                  <span className="mt-1 block text-sm text-zinc-500">{download.note}</span>
                </span>
                <Download className="h-5 w-5 shrink-0 text-orange-400 transition group-hover:translate-y-0.5" />
              </a>
            ))}
          </div>
          <a
            href={`${studioLatestDownload}/${androidUniversal.file}`}
            className="mt-3 flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 transition hover:border-orange-500/50"
          >
            <span className="flex items-center gap-3 text-left">
              <Smartphone className="h-5 w-5 shrink-0 text-orange-400" />
              <span>
                <span className="block font-medium text-zinc-100">{androidUniversal.name}</span>
                <span className="mt-1 block text-sm text-zinc-500">{androidUniversal.note}</span>
              </span>
            </span>
            <Download className="h-5 w-5 shrink-0 text-orange-400" />
          </a>
          <h3 className="mb-3 mt-10 text-left text-xl font-semibold text-white">Server</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serverDownloads.map((download) => (
              <a
                key={download.file}
                href={`${studioLatestDownload}/${download.file}`}
                className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 transition hover:border-orange-500/50"
              >
                <span className="text-left">
                  <span className="block font-medium text-zinc-100">{download.name}</span>
                  <span className="mt-1 block text-sm text-zinc-500">{download.note}</span>
                </span>
                <Download className="h-5 w-5 shrink-0 text-orange-400 transition group-hover:translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <Reveal className="w-full border-t border-white/10 px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Same binary, different doors.</h2>
          <Link href="/docs/slash" className="hidden items-center gap-2 text-sm text-orange-300 md:inline-flex">
            Slash commands <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {capabilities.map((item) => (
            <Link key={item.title} href={item.href} className="grid gap-2 py-5 transition-colors hover:bg-white/[0.03] md:grid-cols-[180px_220px_1fr] md:items-baseline md:gap-8 md:px-2">
              <span className="font-medium text-white">{item.title}</span>
              <span className="truncate font-mono text-sm text-orange-300">{item.command}</span>
              <span className="text-sm leading-6 text-zinc-500">{item.detail}</span>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
