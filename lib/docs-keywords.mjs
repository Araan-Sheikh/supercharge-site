/** Word aliases for the docs chat. Orama matches words, not meaning. */
export const ALIASES = [
  { when: ['install', 'installer', 'download', 'upgrade', 'binary'], add: 'curl install.sh bash irm powershell SUPERCHARGE_VERSION SUPERCHARGE_BIN_DIR' },
  { when: ['setup', 'provider', 'api key', 'apikey', 'base url', 'login'], add: '/setup /login /format /model chat_completions messages responses max_request_bytes api_backend' },
  { when: ['imagine', 'image provider'], add: '/isetup /imodels /imagine /imagine-video image_provider' },
  { when: ['daemon', 'inbox', 'sse'], add: 'agent daemon supercharge-superagent-server 6767 SUPERAGENT_BIND SUPERCHARGE_PASSWORD SUPERAGENT_API_TOKEN' },
  { when: ['acp', 'websocket', 'agent serve'], add: 'agent serve 2419 SUPERCHARGE_AGENT_SECRET server-key --remote' },
  { when: ['headless', 'one shot', 'oneshot'], add: '-p --single --output-format --tools --disallowed-tools --max-turns --yolo' },
  { when: ['resume', 'session', 'compact', 'rewind', 'dashboard'], add: '-c -r --fork-session /resume /compact /rewind /dashboard /new /export' },
  { when: ['permission', 'approve', 'yolo', 'allow rule', 'deny rule'], add: '/always-approve /auto /plan --allow --deny bypassPermissions' },
  { when: ['memory', 'remember', 'user.md', 'memory.md'], add: '/remember USER.md MEMORY.md SUPERCHARGE_MEMORY /flush /dream' },
  { when: ['config.toml', 'environment variable', 'supercharge_home'], add: 'config.toml SUPERCHARGE_HOME SUPERCHARGE_CONFIG requirements.toml' },
  { when: ['mcp', 'skill', 'plugin', 'hook'], add: '/mcps /skills /plugins /hooks /marketplace AGENTS.md' },
  { when: ['shortcut', 'keyboard', 'vim mode'], add: '/vim-mode Ctrl+C Ctrl+N Ctrl+O multiline' },
  { when: ['clipboard', 'wayland', 'wl-copy', 'data-control'], add: 'wl-copy wl-clipboard data-control /doctor' },
  { when: ['lean', 'leancharge', 'lean 4', 'theorem', 'proof'], add: '/lean --lean SUPERCHARGE_AGENT Leancharge Lean 4 lake build lake init mathlib4 grind native_decide lean-lsp-mcp proof assistant theorem prover' },
  { when: ['codecov', 'coverage', 'duplicat', 'test quality', 'untested'], add: '/codecov /codecov fix cargo-llvm-cov cargo-tarpaulin pytest-cov go test -cover duplication scan local' },
  { when: ['version', 'docs version'], add: '1.4.9 supercharge --version' },
  { when: ['studio', 'phone', 'android', 'apk', 'desktop app', 'gateway', 'relay', 'pair', 'qr'], add: 'supercharge-studio-server scstudio://pair SCS_RELAY SCS_BIND SCS_DATA SUPERCHARGE_AGENT_SECRET relay.superchargeai.in 2420 2422' },
];

export function extraKeywords(text) {
  const hay = text.toLowerCase();
  const extras = [];
  for (const alias of ALIASES) {
    if (alias.when.some((word) => hay.includes(word))) extras.push(alias.add);
  }
  return extras.join(' ');
}

const COMMAND = /\/[a-z0-9][a-z0-9-]*/gi;
const FLAG = /--[a-z0-9][a-z0-9-]*/gi;
const ENV = /SUPER[A-Z0-9_]+/g;

export function pullTokens(text) {
  return [...text.matchAll(COMMAND), ...text.matchAll(FLAG), ...text.matchAll(ENV)]
    .map((match) => match[0])
    .join(' ');
}
