# Get started

A publisher goes live with ABC in three steps. None of them touch your content or
your human visitors.

## 1. Pick a provider

A [provider](index.md#the-provider) runs the fragment endpoint, selects the brand,
renders the card, and handles the brand deals and reporting. It gives you a
**fragment endpoint URL** (carrying its auth and placement parameters).

The spec is provider-neutral — any service implementing a compatible
[fragment endpoint](schema/fragment.openapi.yaml) works.

## 2. Inline the fragment

Add the fragment to your pages on the path that matches your CDN — see
[Integration](integration.md):

- **Akamai / Fastly / Varnish** → one `<esi:include>` tag, no code.
- **Cloudflare** → a ~30-line Worker.
- **CloudFront** → a Lambda@Edge function.
- **No CDN control** → a browser-JS fallback.

Your edge classifies each request from the `User-Agent` (the [agent list](agents.md))
and fetches a card for AI agents only. Your human visitors never trigger a fragment
call and see the page unchanged.

## 3. Declare it (optional)

Once you're live, publish an [`abc.txt`](index.md#the-declaration-abctxt) at your
site root listing your provider(s):

```text
# abc.txt - Agentic Brand Content
# Spec: https://brandcontent.dev
provider.example, acct-123, RESELLER
```

This is optional — fragments are delivered without it — but it makes your
participation and authorized providers public, the same way `ads.txt` does.

## Verify

```bash
# As a human — expect no card:
curl -s https://yoursite.com/some-article | grep -c 'abc-card'

# As an AI agent — expect one card:
curl -s -A "Mozilla/5.0 (compatible; GPTBot/1.0)" \
  https://yoursite.com/some-article | grep -c 'abc-card'
```

A `0` then a `1` means it's working: humans untouched, agents enriched.
