# Agentic Brand Content

**A declarative standard for publishers to serve structured brand context to AI
agents — instead of giving their content away for free.**

!!! info "Spec v0.1 · 2026-05-28"
    Early public draft. The format is usable today and open to feedback; details
    may change before v1.0.

## The problem

AI agents (GPTBot, ClaudeBot, PerplexityBot…) read publisher pages to answer user
questions. Publishers get nothing in return. Today's only options are to block the
crawlers (`robots.txt`) or to let them take everything.

**Agentic Brand Content (ABC)** is a third path: when an AI agent reads a page, the
publisher serves it a compact, structured *brand card* — sponsored context an agent
can surface in its answer. Humans see the page unchanged. The publisher gets paid
for bot traffic it was giving away.

## The fragment

The core of ABC is the **brand fragment**: a provider exposes an endpoint that
returns a brand card for AI-agent traffic and nothing for humans. The publisher
inlines it on its existing CDN — a single `<esi:include>` tag (Akamai, Fastly,
Varnish), or a small edge function (Cloudflare Worker, Lambda@Edge). No platform
lock-in.

A card is a single self-contained `<aside>` — a brand label, a short factual
summary, a bullet block built for LLM ingestion, and source links. ~2 KB, under
1 000 tokens, designed to fit an agent's context window. See the
[card schema](schema/card.schema.json).

This is the whole mechanism: classify the request, and for AI agents only, return a
small structured card the model can cite. Everything else is convention around it.

## The declaration — `abc.txt`

Once a site serves fragments, it can declare participation publicly with a small
file at the site root, `/abc.txt`. It lists which **providers** are authorized to
supply brand content for AI agents on that site — the same transparency model as
`ads.txt` / `sellers.json`, applied to the agentic web.

```text
# abc.txt — Agentic Brand Content
# Declares which providers may serve AI-agent brand context on this site.
# Spec: https://brandcontent.dev

# provider_domain, relationship
doubleshift.to, DIRECT
```

!!! note "Optional by design"
    The file is not required — fragments are delivered without it. Its presence is a
    participation signal and the seed of a declarative, multi-provider ecosystem.

### Fields

| Field | Required | Meaning |
|---|---|---|
| `provider_domain` | yes | Root domain of an authorized brand-content provider. |
| `relationship` | yes | `DIRECT` (contracted directly) or `RESELLER`. |

Optional `key=value` lines a publisher may add: `endpoint=` (a discovery URL for the
fragment endpoint), `contact=`, `updated=`.

## The provider

A **provider** is the service a publisher authorizes to supply brand content for its
AI-agent traffic. A provider:

- runs the fragment endpoint and decides which brand is relevant to the page;
- renders the card and keeps it within the token budget;
- manages the brand relationships and the reporting behind it.

A publisher lists its authorized providers in `abc.txt`. The standard is
provider-neutral: any service implementing `abc.txt` and a compatible fragment
endpoint is a provider.

---

ABC is an open convention. Anyone may implement `abc.txt` and a compatible fragment
endpoint. The standard is free to adopt; reference implementations are open-source.
