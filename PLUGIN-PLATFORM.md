# Plugin control panel and API

The existing Supercharge Next.js site now also owns the plugin catalog. The marketing site, documentation, donations and terminal routes remain in the same application.

- `/admin/plugins`: owner sign-in, drafts, MCP JSON and skills, publication, release history/revocation, archive/restore and activity.
- `/plugins`: public published plugins only.
- `/api/plugins/v1`: catalog and management API.
- `/api/plugins/v1/openapi.json`: machine-readable endpoint reference.

## Owner setup

Use Node 22.13+ (Node 24 LTS recommended for deployment). Install with `npm ci`. Generate independent keys without printing them into command output:

```sh
npm run plugins:setup -- --origin https://superchargeai.in
```

This appends plugin settings to `.env.local` atomically, preserves unrelated settings, makes the file owner-only, and refuses to replace an existing administrator key. It does not deploy anything. Read the administrator key locally from that file, restart the site, and sign in at `/admin/plugins`. Never commit or distribute this file.

The three keys have different purposes:

- `PLUGIN_ADMIN_KEY`: owner access, including all management API operations.
- `PLUGIN_SESSION_SECRET`: signs eight-hour HttpOnly, SameSite=Strict sessions. Rotating it invalidates sessions.
- `PLUGIN_CATALOG_READ_TOKEN`: read-only access to private published packages. Distribute this token to your own agents, not the administrator key.

`PLUGIN_PUBLIC_ORIGIN` must match the actual HTTPS origin behind your proxy; it is used for same-origin checks. Loopback HTTP works for development. Admin bearer requests support automation; browser mutations require the matching Origin. There is no public first-admin signup endpoint. Sign-in attempts are rate limited. Protect the owner key as a high-entropy secret rather than a memorable password.

## Storage and hosting

**Existing VPS / Node server:** set `PLUGIN_DATABASE_PATH` to an absolute path on persistent storage, for example `/var/lib/supercharge-site/plugins.sqlite`. The default is `.data/plugins.sqlite` for local development. SQLite uses WAL and atomic SQL updates. Include the database and WAL in consistent backups using SQLite backup tooling.

**Cloudflare data:** set all of `CLOUDFLARE_ACCOUNT_ID`, `PLUGIN_D1_DATABASE_ID`, and `CLOUDFLARE_D1_API_TOKEN` to use D1 instead. The API token needs access to the selected D1 database. Calls use [Cloudflare's HTTPS query API](https://developers.cloudflare.com/d1/) on the server; credentials never reach the browser. The plugin tables/triggers are initialized idempotently on first use. Do not configure only part of this group; partial configuration fails closed.

The current site uses a custom Node server and `node-pty` for `/terminal`. This change does not port that runtime to Workers. You can run it on your existing VPS behind Cloudflare, with plugin data in D1. Vercel can host the Next.js plugin pages/API with D1, but the native terminal still requires its separate Node host. A Vercel deployment without D1 is refused for the plugin database because local function storage is ephemeral. Cloudflare-native hosting of the entire existing site would require a separate runtime migration.

No D1 database, domain, production secret or deployment is created by this implementation. SQLite and D1 use the same parameterized statements. Live D1 requires your account configuration. Automated tests exercise SQLite and a mocked D1 HTTPS adapter using the actual parameterized SQL, not a live Cloudflare database.

## Plugin lifecycle

Create a draft (or use Add starter plugins). Configure metadata and visibility, add an MCP endpoint/command and/or skills, then Save draft. Private is the default. The website stores definitions, not connected-account credentials. Use environment-variable references for secret MCP headers/env values; do not paste tokens or OAuth client secrets into a package. Public OAuth client IDs are allowed; client secrets refer to an agent environment variable or are entered through the agent's connection manager.

Publish explicitly after review. A release stores an immutable `supercharge-plugin-package-v1` JSON file map and SHA-256 of the exact downloadable bytes. Each skill becomes a standard `skills/<name>/SKILL.md`; the package includes `plugin.json` and `mcp.json`. Edit the draft and bump the semantic version to publish again. Reusing a version is refused even after revocation. Concurrent edits require the matching revision and fail with HTTP 409 instead of overwriting another session.

Revoke stops new downloads of one release. Archive removes the plugin from the catalog and blocks all new downloads. Restore makes unrevoked releases accessible again. Already installed copies stay on their agents; this is not a remote kill switch. Changing the latest release to private does not rewrite the visibility of older immutable releases; revoke older public versions when withdrawing them.

Export downloads drafts and release metadata, not every historical package. Back up the database to preserve all releases. Package size is bounded for D1 row limits; arbitrary script/binary uploads are not supported. MCP stdio commands may reference reviewed executables/packages available on the target.

## Connect the CLI and desktop

Use a CLI built with central-catalog support:

```sh
supercharge plugin catalog configure --url https://superchargeai.in/api/plugins/v1
supercharge plugin catalog
supercharge plugin install catalog:github@1.0.0 --trust
```

For private plugins, add `--token-stdin` to configure and supply the read token through a protected input stream. The target saves it in an owner-only `plugin-catalog.json`; it is never included in status output. Empty token input clears the saved token. Alternatively set `SUPERCHARGE_PLUGIN_CATALOG_URL` and `SUPERCHARGE_PLUGIN_CATALOG_TOKEN` in the agent environment; this override takes precedence over the saved file.

In Studio, `/plugins` has a Catalog URL and read-token form. Both go to the selected local or remote agent over authenticated ACP. That agent, not the browser, fetches the catalog and verifies package hashes. The app does not save the read token in localStorage. Catalog configuration is independent for each execution target.

Read descriptors at `GET /api/plugins/v1/plugins`; fetch a pinned descriptor at `/plugins/<name>/releases/<version>` and package bytes at the same path plus `/package`. Send `Authorization: Bearer <catalog-read-token>` for private releases. Anonymous clients can only read explicitly public releases. An invalid supplied token is rejected, rather than silently downgrading to anonymous access.

Catalog packages go through the native plugin installer and permission gates. Studio installs remain disabled until reviewed/enabled; CLI `--trust` is explicit activation. `plugin update <name>` refreshes a catalog source to the newest accessible published version before the native snapshot update. Archived/revoked/unavailable catalog entries fail update visibly. MCP/account credentials remain on the execution target.

## Management API

Use the administrator bearer key for programmatic changes. JSON request bodies:

- `POST /admin/plugins`: `{ "document": { name, displayName, version, description, author, visibility, homepage?, mcpServers, skills } }`.
- `PUT /admin/plugins/<name>`: `{ "revision": number, "document": ... }`.
- `POST /admin/plugins/<name>/publish`: `{ "revision": number }`.
- `DELETE /admin/plugins/<name>`: `{ "revision": number }` (archive).
- `POST /admin/plugins/<name>/restore`: `{ "revision": number }`.
- `POST /admin/plugins/<name>/revoke`: `{ "version": "1.0.0" }`.
- `GET /admin/plugins`, `GET /admin/plugins/<name>`, `GET /admin/audit`, `GET /admin/export`.

All paths above are relative to `/api/plugins/v1`. Names are immutable lowercase slugs. Skill objects contain `name`, `description`, and `instructions`. See the starter definitions and endpoint reference for examples. Errors are JSON with an `error` field and appropriate HTTP status; request bodies and secrets are not logged.

## Verification

```sh
npm run test:plugins
npm run types:check
npm run build
npm run test:plugins:e2e
```

The Playwright setup uses temporary test data and fixture keys, never the live database. Close other Next dev instances in this checkout first. The test exercises sign-in, create/edit, private publication, exact digest verification, immutable old releases, archive/restore, revocation, mobile layout and sign-out. Live GitHub OAuth and production D1 are separate checks requiring configured accounts.

Build the actual CLI executable from the main workspace with `cargo build -p supercharge-pager-bin`. To verify it against the website, start the isolated fixture server in one terminal, then run:

```sh
node scripts/plugin-test-server.mjs
# In another terminal, from this site checkout:
SUPERCHARGE_TEST_BINARY=/absolute/path/to/target/debug/supercharge-pager node scripts/verify-plugin-agent.mjs
```

This checks private catalog discovery/download, installation, version updates, archive rejection and uninstall with a temporary agent home. It refuses non-loopback test hosts and never uses production credentials.
