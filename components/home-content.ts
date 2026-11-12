export const capabilities = [
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

export const startupPrograms: {
  name: string;
  logo: string;
  note: string;
  href: string;
  wordmark?: boolean;
}[] = [
  { name: 'Sentry', logo: '/badges/sentry.svg', note: 'Startup program', href: 'https://sentry.io/for/startups/' },
  { name: 'PostHog', logo: '/badges/posthog-logo-white.svg', note: 'Startup program', href: 'https://posthog.com/startups', wordmark: true },
  { name: 'Free.ai', logo: '/badges/free-ai.svg', note: 'Startup program', href: 'https://free.ai/startup/' },
  { name: 'Amplitude', logo: '/badges/amplitude.svg', note: 'Startup plan', href: 'https://amplitude.com/startups' },
  { name: 'Clerk', logo: '/badges/clerk.svg', note: 'Startup discount', href: 'https://clerk.com/startups' },
  { name: 'OpenScale', logo: '/badges/openscale.svg', note: 'Startup program', href: 'https://openscale.so/' },
  { name: 'Wiro', logo: '/badges/wiro.svg', note: 'Startup program', href: 'https://wiro.ai/startups' },
  { name: 'MongoDB', logo: '/badges/mongodb.png', note: 'Startup program', href: 'https://www.mongodb.com/startups', wordmark: true },
];

