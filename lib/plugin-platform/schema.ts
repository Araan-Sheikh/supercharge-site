import { z } from 'zod';
export const slug = z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens');
export const version = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/, 'Use a semantic version such as 1.0.0');
const envName = z.string().regex(/^[A-Z_][A-Z0-9_]*$/);
const server = z.object({
  url: z.string().url().optional(), command: z.string().min(1).max(512).optional(),
  args: z.array(z.string().max(2048)).max(100).optional(),
  env: z.record(z.string().max(2048)).optional(),
  headers: z.record(z.string().max(2048)).optional(),
  bearer_token_env_var: envName.optional(),
  oauth: z.object({ clientId: z.string().min(1).max(512).optional(), clientSecretEnvVar: envName.optional(), scopes: z.array(z.string().max(200)).max(40).optional(), callbackPort: z.number().int().min(1).max(65535).optional() }).strict().optional(),
}).strict().superRefine((s, ctx) => {
  if (!!s.url === !!s.command) ctx.addIssue({ code: 'custom', message: 'Each MCP server needs exactly one URL or command' });
  if (s.url) { const u = new URL(s.url); if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash) ctx.addIssue({ code: 'custom', message: 'MCP URLs must be HTTPS without credentials, query or fragment' }); }
  for (const [k, v] of Object.entries(s.headers ?? {})) {
    if (/authorization|api[-_]?key|token|secret|cookie/i.test(k) && !/^\$\{[A-Z_][A-Z0-9_]*\}$/.test(v)) ctx.addIssue({ code: 'custom', message: 'Secret headers must reference ${ENVIRONMENT_VARIABLE}; never paste credentials into a plugin' });
  }
  for (const [k, v] of Object.entries(s.env ?? {})) {
    if (/key|token|secret|password|credential/i.test(k) && !/^\$\{[A-Z_][A-Z0-9_]*\}$/.test(v)) ctx.addIssue({ code: 'custom', message: 'Secret environment values must reference ${ENVIRONMENT_VARIABLE}' });
  }
});
export const pluginDocument = z.object({
  name: slug, displayName: z.string().trim().min(1).max(100), version,
  description: z.string().trim().min(1).max(1000),
  author: z.string().trim().min(1).max(100).default('Supercharge'),
  visibility: z.enum(['private', 'public']).default('private'),
  homepage: z.string().url().optional().or(z.literal('')),
  mcpServers: z.record(slug, server).refine((v) => Object.keys(v).length <= 30, 'Maximum 30 MCP servers'),
  skills: z.array(z.object({ name: slug, description: z.string().min(1).max(1000), instructions: z.string().min(1).max(100000) }).strict()).max(30),
}).strict().superRefine((d, ctx) => {
  if (!d.skills.length && !Object.keys(d.mcpServers).length) ctx.addIssue({ code: 'custom', message: 'Add at least one skill or MCP server' });
  if (new Set(d.skills.map((s) => s.name)).size !== d.skills.length) ctx.addIssue({ code: 'custom', message: 'Skill names must be unique' });
  if (new TextEncoder().encode(JSON.stringify(d)).length > 700000) ctx.addIssue({ code: 'custom', message: 'Plugin package is too large' });
});
export type PluginDocument = z.infer<typeof pluginDocument>;
export type PluginRecord = { name: string; revision: number; draft: PluginDocument; archived: boolean; publishedVersion: string | null; publishedRevoked: boolean; createdAt: number; updatedAt: number };
export function packageText(d: PluginDocument): string {
  const manifest = { name: d.name, version: d.version, description: d.description, author: { name: d.author }, ...(d.homepage ? { homepage: d.homepage } : {}) };
  const files: Record<string, string> = { 'plugin.json': JSON.stringify(manifest, null, 2) + '\n', 'mcp.json': JSON.stringify({ mcpServers: d.mcpServers }, null, 2) + '\n' };
  for (const skill of [...d.skills].sort((a, b) => a.name.localeCompare(b.name))) files[`skills/${skill.name}/SKILL.md`] = `---\nname: ${JSON.stringify(skill.name)}\ndescription: ${JSON.stringify(skill.description)}\n---\n\n${skill.instructions}\n`;
  return JSON.stringify({ format: 'supercharge-plugin-package-v1', name: d.name, version: d.version, files });
}
