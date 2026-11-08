'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Zap, Download, Terminal, Cpu, Globe, Sparkles, Rocket, Shield, Clock, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { androidUniversal, desktopDownloads, serverDownloads, studioLatestDownload, studioRelease } from '@/lib/studio-downloads';

// Animated background orbs component - NO random values to avoid hydration mismatch
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main orange glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse-slow" />

      {/* Floating orbs - using orange theme only */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float-1" />
      <div className="absolute top-40 right-[15%] w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-float-2" />
      <div className="absolute bottom-20 left-[20%] w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float-3" />
      <div className="absolute bottom-40 right-[10%] w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-float-4" />

      {/* Static particle dots - fixed positions to avoid hydration mismatch */}
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[10%] top-[20%]" style={{ animationDelay: '0s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[25%] top-[15%]" style={{ animationDelay: '0.5s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[40%] top-[30%]" style={{ animationDelay: '1s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[55%] top-[10%]" style={{ animationDelay: '1.5s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[70%] top-[25%]" style={{ animationDelay: '2s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[85%] top-[20%]" style={{ animationDelay: '2.5s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[15%] top-[60%]" style={{ animationDelay: '3s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[30%] top-[70%]" style={{ animationDelay: '3.5s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[60%] top-[65%]" style={{ animationDelay: '4s' }} />
      <div className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-particle left-[80%] top-[55%]" style={{ animationDelay: '4.5s' }} />
    </div>
  );
}

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 100) {
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

// Marquee component for tech stack
function TechMarquee() {
  const items = [
    { icon: Terminal, text: 'supercharge' },
    { icon: Cpu, text: 'Rust CLI' },
    { icon: Globe, text: 'ACP server' },
    { icon: Bot, text: 'Docs AI' },
    { icon: Zap, text: 'Inbox daemon' },
    { icon: Shield, text: 'Bring your own key' },
    { icon: Rocket, text: 'Subagents' },
    { icon: Clock, text: 'Curated memory' },
  ];

  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

      <div className="flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 mx-8 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full backdrop-blur-sm hover:border-orange-500/50 hover:bg-zinc-800/50 transition-all cursor-default group"
          >
            <item.icon className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium text-zinc-300 whitespace-nowrap group-hover:text-white transition-colors">{item.text}</span>
          </div>
        ))}
      </div>
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

  return (
    <div className="relative z-10 mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-left shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <p className="font-mono text-xs text-zinc-400">
          {ready ? (os === 'windows' ? 'Windows' : 'macOS or Linux') : 'Install'}
        </p>
        <p className="font-mono text-[11px] text-zinc-600">superchargeai.in</p>
      </div>
      {cards.map((card, index) => (
        <button
          key={card.kind}
          type="button"
          onClick={() => copy(card.kind)}
          className={`flex w-full items-center gap-4 px-4 py-3 text-left ${index === 0 ? 'bg-orange-500/5 hover:bg-orange-500/10' : 'border-t border-zinc-800 hover:bg-zinc-900'}`}
        >
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-zinc-500">
              {index === 0 ? 'This computer' : 'Other'} · {card.label}
            </p>
            <pre className="overflow-x-auto font-mono text-[13px] leading-6 text-orange-200">
              <code className="whitespace-nowrap">{card.command}</code>
            </pre>
          </div>
          <span className="shrink-0 font-mono text-xs text-zinc-400">
            {copied === card.kind ? 'Copied' : 'Copy'}
          </span>
        </button>
      ))}
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

export default function HomePage() {
  const { displayText, isComplete } = useTypewriter('Keeps the key.', 70);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden bg-black text-zinc-100">
      {/* Custom animations styles */}
      <style jsx global>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(5deg); }
          50% { transform: translate(-20px, 20px) rotate(-5deg); }
          75% { transform: translate(40px, 10px) rotate(3deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 30px) rotate(-5deg); }
          66% { transform: translate(30px, -20px) rotate(5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -40px); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes particle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0); }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          90% { opacity: 1; transform: translateY(-100px) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: translate(-50%, 0) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, 0) scale(1.1); }
        }
        @keyframes gradient-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3), 0 0 40px rgba(249, 115, 22, 0.1); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.5), 0 0 60px rgba(249, 115, 22, 0.2); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(249, 115, 22, 0.3); }
          50% { text-shadow: 0 0 30px rgba(249, 115, 22, 0.8), 0 0 60px rgba(249, 115, 22, 0.5); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes border-dance {
          0%, 100% { border-color: rgba(249, 115, 22, 0.3); }
          50% { border-color: rgba(251, 191, 36, 0.3); }
        }
        
        .animate-float-1 { animation: float-1 20s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 25s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 18s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 22s ease-in-out infinite; }
        .animate-particle { animation: particle 5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-gradient-rotate { animation: gradient-rotate 3s linear infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-border-dance { animation: border-dance 3s ease-in-out infinite; }
        
        .text-gradient-animate {
          background: linear-gradient(90deg, #fff, #fdba74, #fff, #fdba74, #fff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* 1. Hero Section */}
      <div
        ref={heroRef}
        className="relative w-full max-w-7xl mx-auto px-4 pt-24 pb-20 md:pt-36 md:pb-32 flex flex-col items-center text-center z-10"
      >
        <FloatingOrbs />

        {/* VectraDocs Logo */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-white">Super</span>
            <span className="text-orange-500">charge</span>
          </span>
        </div>

        {/* Badge: Credits - Animated entrance */}
        <div
          className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-[12px] font-mono text-zinc-400 backdrop-blur-sm animate-fade-in-up animate-border-dance"
          style={{ animationDelay: '0.2s' }}
        >
          <Terminal className="w-4 h-4 text-orange-500 animate-pulse" />
          <span>Built by <strong className="text-zinc-200">R3AP3R Editz</strong> · free, bring your own key</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>

        {/* Headline with parallax */}
        <h1
          className="text-5xl md:text-8xl font-bold tracking-tight mb-8 animate-fade-in-up"
          style={{
            animationDelay: '0.4s',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            The coding agent that
          </span>
          <br />
          <span className="text-orange-500 animate-text-glow inline-block">
            {displayText}
            {!isComplete && <span className="animate-pulse">|</span>}
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up opacity-0"
          style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
        >
          A free, fully bring-your-own-key Rust coding agent. In <span className="font-mono text-zinc-200">/setup</span> you choose Chat Completions, Messages, or Responses, then use the terminal, a script, or an inbox.
        </p>

        <InstallCommands />

        {/* CTA Buttons with glow effects */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up opacity-0"
          style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
        >
          <Link
            href="/docs"
            className="group relative flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-semibold transition-colors overflow-hidden"
          >
            <span className="relative z-10">Read the docs</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 animate-shimmer" />
          </Link>
          <Link
            href="/download"
            className="group flex items-center gap-2 px-10 py-4 bg-zinc-900/80 border border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800 text-zinc-300 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm"
          >
            <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
            <span>Download Studio</span>
          </Link>
          <Link
            href="/donate"
            className="px-8 py-3 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:border-orange-500/50 hover:text-white transition-colors"
          >
            Donate
          </Link>
        </div>
        <video
          className="relative z-0 mt-16 w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
          src="/using-supercharge.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      </div>

      <section className="relative z-10 w-full border-t border-zinc-900 px-6 py-20 lg:px-10" aria-labelledby="studio-downloads">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
              <Download className="h-4 w-4" />
              Supercharge Studio · {studioRelease}
            </span>
            <h2 id="studio-downloads" className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Download Studio
            </h2>
            <p className="mx-auto max-w-xl text-zinc-400">
              Studio is an app that runs on the CLI, so the CLI has to be installed for it to run. The mobile app connects to the PC app.
            </p>
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

      {/* 2. Features Grid */}
      <Reveal className="w-full px-6 py-20 border-t border-zinc-900 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What the CLI can do
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            One binary. These are the ways it runs and the controls around it. Docs for CLI 1.4.5.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {capabilities.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 hover:border-orange-500/50"
            >
              <h3 className="text-lg font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-3 overflow-x-auto font-mono text-xs text-orange-300">{item.command}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.detail}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* 4. Updates Section */}
      <Reveal className="w-full px-6 py-12 border-t border-zinc-900 lg:px-10">
        <div className="group flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 transition-all duration-300 backdrop-blur-sm">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Provider, memory, commands
            </h3>
            <p className="text-zinc-400">/setup, slash commands, config, and the local daemon.</p>
          </div>
          <Link
            href="/docs/setup"
            className="group/btn flex items-center gap-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full font-medium transition-all duration-300 hover:scale-105 border border-zinc-700 hover:border-orange-500/50"
          >
            Open setup docs
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Reveal>

      {/* 5. Tech Stack Marquee */}
      <div className="w-full border-t border-zinc-900 bg-zinc-950/50 py-8">
        <div className="text-center mb-6">
          <span className="text-zinc-600 text-sm uppercase tracking-widest">On this site</span>
        </div>
        <TechMarquee />
      </div>

    </div>
  );
}
