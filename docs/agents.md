# Agents

ABC serves a card **only to AI agents**, and nothing to humans. Your edge makes that
call: it matches the request's `User-Agent` against this list, and only a match
triggers a card request. The list stays conservative — only well-known,
vendor-published markers — so a human is never mistaken for an agent.

Matching is **word-boundary, case-insensitive**. The machine-readable list your edge
deploys is [`schema/agents.json`](schema/agents.json).

## Classification

Each agent carries two axes used for targeting and reporting:

- **family** — the vendor (`openai`, `anthropic`, `google`, `perplexity`…).
- **purpose** — what the agent is doing right now. The same vendor can ship several
  agents with different purposes, and pricing is expected to differ by purpose:

| purpose | meaning | intent |
|---|---|---|
| `query` | real-time fetch on behalf of a user asking now | highest |
| `search` | building / refreshing an AI search index | medium |
| `training` | bulk crawl building a training corpus | lowest |
| `unknown` | mixed-purpose or undocumented | — |

## Known agents (v0.1)

| Marker | Family | Purpose |
|---|---|---|
| `GPTBot` | openai | training |
| `ChatGPT-User` | openai | query |
| `OAI-SearchBot` | openai | search |
| `ClaudeBot` | anthropic | training |
| `Claude-Web` | anthropic | query |
| `anthropic-ai` | anthropic | unknown |
| `Google-Extended` | google | training |
| `Google-CloudVertexBot` | google | query |
| `Applebot-Extended` | apple | training |
| `PerplexityBot` | perplexity | search |
| `Perplexity-User` | perplexity | query |
| `CCBot` | commoncrawl | training |
| `Meta-ExternalAgent` | meta | training |
| `meta-externalfetcher` | meta | query |
| `FacebookBot` | meta | unknown |
| `Bytespider` | bytedance | training |
| `cohere-ai` | cohere | training |
| `YouBot` | you | search |
| `Diffbot` | diffbot | training |
| `MistralAI-User` | mistral | query |
| `Amazonbot` | amazon | unknown |

The list evolves with each spec version. Propose additions or corrections via the
[repo](https://github.com/brandcontent-dev/spec).

## Verifying agents

User-Agent matching is the **baseline** ABC classification — it is how the edge decides
whether to request a card. A `User-Agent` can be spoofed, so treating a match as
*authoritative* is the **site's responsibility**, layered on top of ABC with whatever
bot management the site already runs:

- **Reverse-DNS / forward-confirmed lookups** — several major vendors document the
  hostnames their agents resolve to (e.g. `*.googlebot.com`, `*.openai.com`).
- **Published IP ranges** — several AI vendors publish the address blocks their agents
  crawl from; match the request IP against them.
- **Verified-bot signals** from your CDN — Cloudflare, Akamai, and Fastly each expose one.

ABC defines *what to serve* to an agent, not *how hard to verify* one; the right level
of verification depends on what the site already has in place. Provider authentication
is separate — it travels in the **fragment endpoint URL** the provider issues (its auth
and placement parameters).
