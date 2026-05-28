# Integration

A publisher's job in ABC is small: take the fragment your provider returns and
**inline it into the page before it reaches the agent**. How you inline depends on
your CDN. Every path below is copy-paste, and the real files live in
[`adapters/`](https://github.com/brandcontent-dev/spec/tree/main/docs/adapters).

Your provider gives you a **fragment endpoint URL** (it carries their auth and
placement parameters). Everywhere below, `https://provider.example/fragment` is a
placeholder for that URL.

## Which path for your CDN?

| Your CDN | Path | Effort |
|---|---|---|
| **Akamai · Fastly · Varnish** | [ESI tag](#esi-akamai-fastly-varnish) | one tag + one config toggle, no code |
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

The CDN forwards the visitor's `User-Agent` to the fragment endpoint, so the provider
classifies agent vs human and returns the card (`200`) or nothing (`204`). Honour the
response's `Vary: User-Agent` so a bot card is never served to a human.

!!! warning "Hidden Varnish behind another CDN"
    If your public CDN is Cloudflare or CloudFront but you run a Varnish underneath,
    resolving ESI in that Varnish means the public CDN caches the *already-composed*
    HTML and the card stops refreshing. On those stacks, use the Worker / Lambda path
    instead, so each request reaches the fragment endpoint.

---

## Cloudflare Worker

Cloudflare has no native ESI. A small Worker plays the same role — fetch the fragment,
inline it with `HTMLRewriter`. → [`adapters/cloudflare-worker.js`](adapters/cloudflare-worker.js)

```js
--8<-- "adapters/cloudflare-worker.js"
```

Deploy with `npx wrangler deploy`. The provider classifies the agent from the
forwarded `User-Agent`, so you don't filter traffic in the Worker.

---

## CloudFront (Lambda@Edge)

Same idea as an `origin-response` Lambda: fetch the fragment, append it before
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

## Bot detection: who decides?

Two modes, supported on every path:

- **Delegated (default)** — you pass nothing extra. The provider reads the
  `User-Agent` and decides: card for known AI agents, `204` for everyone else.
  Nothing to maintain on your side. See [Agents](agents.md) for the recognised list.
- **Explicit** — you classified the agent upstream and tell the provider so. Saves a
  round-trip on human traffic, but you maintain the bot list.

Use delegated unless you have a reason not to.
