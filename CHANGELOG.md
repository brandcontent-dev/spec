# Changelog

All notable changes to the Agentic Brand Content spec are recorded here.
The spec follows a simple `MAJOR.MINOR` version: `MINOR` for additive or
clarifying changes, `MAJOR` once the `abc.txt` format and fragment contract
are frozen.

## 0.1 — 2026-05-28

First public draft.

- `abc.txt` declaration format (provider lines, `DIRECT`/`RESELLER`, optional directives).
- Brand **fragment** delivery: `<article role="complementary" class="abc-card">`, ~2 KB, under 1 000 tokens.
- Fragment endpoint behavior contract (`200` card / `204` no-fill, cacheable by URL).
  Classification is done at the publisher's edge, which calls the endpoint for
  AI-agent traffic only — so the response carries no `Vary: User-Agent`.
- Card JSON schema and known-agents list.
- Reference adapters: ESI (Varnish/Fastly/Akamai), Cloudflare Worker, Lambda@Edge, browser JS.
