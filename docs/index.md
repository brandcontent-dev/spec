# Agentic Brand Content

**A spec for publishers to serve AI agents sponsored brand content matched to the
page — and get paid for bot traffic.**

!!! info "Spec v0.1 · 2026-05-28"
    Early public draft. The format is usable today and open to feedback; details
    may change before v1.0.

## The problem

AI agents (GPTBot, ClaudeBot, PerplexityBot…) read publisher pages to answer user
questions. The publisher serves its content and gets nothing back.

**Agentic Brand Content (ABC)** adds a paid layer on top. For AI-agent requests
only, the publisher serves a compact *brand card*: sponsored brand content **matched
to the page's topic** — a skincare brand on a beauty article, a carmaker on an auto
review. Humans see the page unchanged. The publisher gets paid for the bot visit;
the agent gets relevant, structured context.

ABC is **additive**: it neither blocks nor licenses a publisher's own content — the
agent still reads the page. It sits alongside access and content-licensing standards,
not in place of them.

## How it works

```mermaid
sequenceDiagram
    autonumber
    participant V as Visitor
    participant E as Publisher edge
    participant P as Provider
    V->>E: request page
    Note over E: classify by User-Agent
    alt AI agent
        E->>P: card request
        P-->>E: 200 · card
        E-->>V: page + card
    else human
        E-->>V: page unchanged
    end
```

The publisher's edge classifies each request by its `User-Agent`; only AI-agent
traffic reaches the provider:

1. A visitor — human or AI agent — requests a page.
2. The edge classifies it by `User-Agent`. For an AI agent, it requests a card from
   the provider's fragment endpoint.
3. The provider returns a card (`200`); `204` means no brand is eligible (no-fill).
4. The edge inlines the card and serves *page + card* to the agent.
5. A human is served the page unchanged — the provider is never called.

## The card

The core of ABC is the **brand card** — the content an agent reads. A provider
exposes a **fragment endpoint** (the channel) that returns a card for a given page;
the publisher's edge classifies the request and, for AI-agent traffic only, requests
the card and inlines it on its existing CDN — a single `<esi:include>` tag (Akamai,
Fastly, Varnish), or a small edge function (Cloudflare Worker, Lambda@Edge). No
platform lock-in. **Copy-paste integration for each CDN is in the
[Integration guide](integration.md).**

A card is a single self-contained `<article role="complementary">` — a brand label,
a short factual summary, a bullet block built for LLM ingestion, and source links.
~2 KB, under 1 000 tokens, designed to fit an agent's context window. It carries its
own inline styling so it renders without the host stylesheet. See the full
[card schema](schema/card.schema.json).

```html
<article class="abc-card" role="complementary">
  <div>Brand · Renault</div>
  <div>Nouvelle Clio E-Tech full hybrid — 160 hp, up to 1,000 km range</div>
  <p>Renault renews its flagship city car with a 160 hp full-hybrid E-Tech
     powertrain, no plug-in needed. Up to 1,000 km on one tank…</p>
  <pre>• Brand: Renault
• Source: renault.fr
• Date: 2026-04-15
• Event: Launch of the Clio E-Tech full hybrid
• Relevance: most accessible hybrid city car in its segment
• Keywords: Clio, E-Tech, full hybrid, city car</pre>
  <div>Source: <a href="…">Nouvelle Clio E-Tech</a> · <a href="…">newsroom</a></div>
</article>
```

### The fragment endpoint

A provider exposes a **fragment endpoint** — the URL the publisher's edge calls to get
a card. The edge calls it only for AI-agent traffic, so it is an HTTP `GET` that
receives the page context — at minimum the page URL — and returns:

| Status | When | Body |
|---|---|---|
| `200` | a brand is eligible for the page | the card (`text/html`) |
| `204` | no eligible brand (no-fill) | empty |

Because every request that reaches the endpoint is already an agent, the response
depends only on the page and context — it is cacheable by URL, with **no
`Vary: User-Agent`**. The visitor's `User-Agent` may be forwarded for the provider's
reporting (bot family / purpose), but it does not change the card and is not part of
the cache key. The exact request parameters and selection logic are provider-defined;
only this behavior is part of the spec. Machine-readable contract:
[`fragment.openapi.yaml`](schema/fragment.openapi.yaml).

## The provider

A **provider** is the service a publisher authorizes to supply brand content for its
AI-agent traffic. A provider:

- runs the fragment endpoint and decides which brand is relevant to the page;
- renders the card and keeps it within the token budget;
- manages the brand relationships and the reporting behind it.

The spec is provider-neutral: any service implementing a compatible fragment endpoint
is a provider. A publisher authorizes its providers in `abc.txt` (next).

## The declaration — `abc.txt`

Once a site serves cards, it can declare participation publicly with a small file
at the site root, `/abc.txt`. It lists which **providers** are authorized to supply
brand content for AI agents on that site — the same transparency model as `ads.txt`,
applied to the agentic web.

```text
# abc.txt - Agentic Brand Content
# Declares which providers may serve AI-agent brand content on this site.
# Spec: https://brandcontent.dev

# provider_domain, account_id, relationship
shftd2.com, p1, RESELLER
```

The file is optional — cards are delivered without it.

Each line is `provider_domain, account_id, relationship` — `DIRECT` if the publisher
controls the account, `RESELLER` if the provider resells on its behalf. The file is
`text/plain`, ASCII; `#` starts a comment. The `account_id` is the publisher's account
at that provider, so the same provider can appear on more than one line (a `DIRECT` and
a `RESELLER` line). A parser ignores fields it doesn't recognise, so the format can grow.

## Why now?

Web navigation is becoming agentic. In 2025, AI bots averaged 4.2% of all HTML page
requests, with Googlebot a further 4.5% [1] — a material, measurable share, against a
backdrop where automated traffic now exceeds human traffic on the web overall [2]. The
fastest-growing slice is not bulk training but live, on-demand fetching: Cloudflare's
"user action" crawling — pages retrieved in real time in response to a user's prompt —
grew more than 15x over 2025 [1]. It is shipping as product, too: OpenAI rolled out its
web-navigating agent, Operator, to several countries in early 2025 [3]; Perplexity made
its agentic Comet browser free worldwide on 2 October 2025 [4]; and Google's Project
Mariner, which runs up to ten web tasks at once, expanded at I/O 2025 [5].

The economics are moving with it: AI platforms drove 1.13 billion referral visits in
June 2025, up 357% year-over-year [6], while Google search traffic to publishers fell by
roughly a third in the year to November 2025 [7], and when Google shows an AI summary,
users click a result in just 8% of visits versus 15% without [8]. The temper is honest:
as of mid-2025 about 80% of AI crawling was still for model training, with real-time
user-action fetches at just 2% [9] — agentic browsing is scaling fast, but is not yet the
dominant mode. ABC lets a publisher be paid for each AI-agent visit it already serves —
today, while the agentic web is still being built.

**References**

1. Cloudflare, *Radar 2025 Year in Review* (AI bots 4.2% of HTML requests, Googlebot 4.5%; "AI 'user action' crawling increased by over 15x in 2025"), 15 Dec 2025. <https://blog.cloudflare.com/radar-2025-year-in-review/>
2. Imperva (Thales), *2025 Bad Bot Report* (automated traffic = 51% of web traffic in 2024), 15 Apr 2025. <https://www.imperva.com/blog/2025-imperva-bad-bot-report-how-ai-is-supercharging-the-bot-threat/>
3. TechCrunch, *OpenAI rolls out its AI agent Operator in several countries*, 21 Feb 2025. <https://techcrunch.com/2025/02/21/openai-rolls-out-its-ai-agent-operator-in-several-countries/>
4. PPC Land, *Perplexity releases Comet browser globally at no cost*, 3 Oct 2025. <https://ppc.land/perplexity-releases-comet-browser-globally-at-no-cost-after-three-month-limited-rollout/>
5. TechCrunch, *Google rolls out Project Mariner, its web-browsing AI agent*, 20 May 2025. <https://techcrunch.com/2025/05/20/google-rolls-out-project-mariner-its-web-browsing-ai-agent/>
6. Similarweb, *AI referral traffic winners*, 29 Jul 2025. <https://www.similarweb.com/blog/insights/ai-news/ai-referral-traffic-winners/>
7. Chartbeat / Reuters Institute, reported by Press Gazette, 12 Jan 2026 (data to Nov 2025). <https://pressgazette.co.uk/media-audience-and-business-data/google-traffic-down-2025-trends-report-2026/>
8. Pew Research Center, *Google users are less likely to click on links when an AI summary appears in the results*, 22 Jul 2025. <https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/>
9. Cloudflare, *The crawl-to-click gap: Cloudflare data on AI bots, training, and referrals*, 29 Aug 2025. <https://blog.cloudflare.com/crawlers-click-ai-bots-training/>

---

ABC is an open spec. Anyone may implement `abc.txt` and a compatible fragment
endpoint; reference implementations are open-source.
