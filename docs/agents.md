# Agents

ABC serves a card **only to AI agents**, and nothing to humans. "Agent" is decided
from the request's `User-Agent`: if it matches a known AI-agent marker, the request
gets a card. The list stays conservative — only well-known, vendor-published
markers — so a human is never mistaken for an agent.

Matching is **word-boundary, case-insensitive**. The machine-readable list is
[`schema/agents.json`](schema/agents.json).

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
