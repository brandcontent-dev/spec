# Integration

A publisher's job in ABC is small: take the card your provider returns and
**inline it into the page before it reaches the agent**. How you inline depends on
your CDN. Every path below is copy-paste, and the real files live in
[`adapters/`](https://github.com/brandcontent-dev/spec/tree/main/docs/adapters).

Your provider gives you a **fragment endpoint URL** (it carries their auth and
placement parameters). Everywhere below, `https://provider.example/fragment` is a
placeholder for that URL.

## Which path for your CDN?

| Your CDN | Path | Effort |
|---|---|---|
| **Akamai · Fastly · Varnish** | [ESI tag](#esi-akamai-fastly-varnish) | one tag + an agent-UA gate |
| **Cloudflare** | [Worker](#cloudflare-worker) | ~30-line worker, one deploy |
| **AWS CloudFront** | [Lambda@Edge](#cloudfront-lambdaedge) | ~40-line function |
| **No CDN control / SPA** | [Browser JS](#browser-js) | ~10 lines (fallback) |

In a 2026 survey of the top ~200 French media sites, ESI-capable CDNs (Akamai,
Fastly, self-hosted Varnish) covered ~46% of live sites and Cloudflare/CloudFront
~49% — so the two main paths (ESI and a small edge worker) cover the large majority.

> Don't know your CDN? `curl -sI https://yoursite.com/ | grep -iE 'server|via|cf-ray|x-amz-cf|x-served-by'` usually reveals it.

---

## ESI (Akamai, Fastly, Varnish)

The simplest path: one tag in your template, resolved by your CDN's native Edge Side
Includes. **No code to deploy.** → [`adapters/esi-tag.html`](adapters/esi-tag.html)

```html
--8<-- "adapters/esi-tag.html"
```

Then enable ESI on your `text/html` responses:

- **Akamai** — Property Manager → behavior *Edge Side Includes* → Enable.
- **Fastly** — [`adapters/fastly.vcl`](adapters/fastly.vcl): `set beresp.do_esi = true;`
- **Varnish** — [`adapters/varnish.vcl`](adapters/varnish.vcl): `set beresp.do_esi = true;`

Gate ESI on the `User-Agent` so the `<esi:include>` resolves **only for AI agents**
(see [Agents](agents.md) for the list) — a human request never triggers a card
request. The response is then cacheable by URL with no `Vary: User-Agent`.

!!! warning "Hidden Varnish behind another CDN"
    If your public CDN is Cloudflare or CloudFront but you run a Varnish underneath,
    resolving ESI in that Varnish means the public CDN caches the *already-composed*
    HTML and the card stops refreshing. On those stacks, use the Worker / Lambda path
    instead, so each request reaches the fragment endpoint.

---

## Cloudflare Worker

Cloudflare has no native ESI. A small Worker plays the same role — fetch the card,
inline it with `HTMLRewriter`. → [`adapters/cloudflare-worker.js`](adapters/cloudflare-worker.js)

```js
--8<-- "adapters/cloudflare-worker.js"
```

Deploy with `npx wrangler deploy`. The Worker classifies the request from the
`User-Agent` (the [agent list](agents.md)) and fetches the card **only for AI
agents** — human traffic is passed straight through.

---

## CloudFront (Lambda@Edge)

Same idea as an `origin-response` Lambda: fetch the card, append it before
`</body>`. → [`adapters/lambda-edge.js`](adapters/lambda-edge.js)

```js
--8<-- "adapters/lambda-edge.js"
```

---

## Browser JS

No CDN control? A client-side fallback. Note: an agent that doesn't run JavaScript
won't see the card — prefer ESI or an edge worker when you can.
→ [`adapters/browser.js`](adapters/browser.js)

```js
--8<-- "adapters/browser.js"
```

---

## Classify at your edge

Classification happens **once, at your edge**, before the cache: match the request's
`User-Agent` against the published [agent list](agents.md) (`schema/agents.json` —
word-boundary, case-insensitive). Only a match triggers a card request; everyone
else gets the page unchanged. Keeping the decision at the edge means the response is
cacheable by URL — the same card is reused across agents — and a human request never
reaches the provider.
