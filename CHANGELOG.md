# Changelog

All notable changes to the Agentic Brand Content spec are recorded here.
The spec follows a simple `MAJOR.MINOR` version: `MINOR` for additive or
clarifying changes, `MAJOR` once the `abc.txt` format and fragment contract
are frozen.

## 0.2 — 2026-06-03

- Vocabulary: the deliverable is the **card**; "fragment" now refers only to the
  provider's **fragment endpoint** (the channel the edge calls).
- Correct the known-agents list against current vendor docs: drop robots.txt-only
  control tokens (`Google-Extended`, `Applebot-Extended`), drop deprecated/unconfirmed
  tokens (`Claude-Web`, `anthropic-ai`, `cohere-ai`, `FacebookBot`), add `Claude-User`
  and `Claude-SearchBot`, and reclassify `Google-CloudVertexBot` as `search`.
- Fix the fragment-endpoint contract: `format=both` returns a JSON envelope
  `{ card, html }` (the card stays a pure object; rendered HTML is a sibling field).
- Add agent-verification guidance (reverse-DNS, published IP ranges, CDN verified-bot
  signals) as the site's responsibility.
- Surface the Integration guide from the home page; number the How-it-works diagram.
- Pin `mkdocs-material`; add a build-check CI workflow.

## 0.1 — 2026-05-28

First public draft.

- `abc.txt` declaration format (provider lines, `DIRECT`/`RESELLER`, optional directives).
- Brand **card** delivery: `<article role="complementary" class="abc-card">`, ~2 KB, under 1 000 tokens.
- Fragment endpoint behavior contract (`200` card / `204` no-fill, cacheable by URL).
  Classification is done at the publisher's edge, which calls the endpoint for
  AI-agent traffic only — so the response carries no `Vary: User-Agent`.
- Card JSON schema and known-agents list.
- Reference adapters: ESI (Varnish/Fastly/Akamai), Cloudflare Worker, Lambda@Edge, browser JS.
