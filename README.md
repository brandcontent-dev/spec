# Agentic Brand Content (ABC)

An open spec for publishers to serve AI agents sponsored **brand content** matched to
the page — and get paid for bot traffic. It adds a paid layer; the agent still reads
the page.

- **The delivery** — the publisher's edge classifies the request and, for AI agents
  only, fetches a compact brand card from a provider's *fragment endpoint* and inlines
  it on its existing CDN via `<esi:include>` or a small edge function. Humans see the
  page unchanged. No platform lock-in.
- **The declaration** — `abc.txt` at the site root declares which *providers* may
  serve AI-agent brand content on the site (the `ads.txt` model, applied to the
  agentic web).

The published spec lives at **https://brandcontent.dev** and is built from this repo
with MkDocs Material.

## Local preview

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # preview at http://127.0.0.1:8000
mkdocs build --strict   # output to ./site
```

## Contents

```
mkdocs.yml                        site config (Material theme)
CHANGELOG.md  CONTRIBUTING.md      governance
docs/
├── index.md                      the spec (problem, diagram, card, provider, abc.txt)
├── integration.md                4 reference architectures + which-CDN decision tree
├── agents.md                     AI-agent classification (family / purpose)
├── getting-started.md            publisher adoption path
├── adapters/                     real, copyable reference implementations
│   ├── esi-tag.html              the <esi:include> tag
│   ├── varnish.vcl  fastly.vcl   enable ESI
│   ├── cloudflare-worker.js      Worker shim
│   ├── lambda-edge.js            CloudFront origin-response
│   └── browser.js                client-side fallback
└── schema/
    ├── card.schema.json          a brand card
    ├── fragment.openapi.yaml     the fragment endpoint contract
    └── agents.json               known AI-agent markers
```

## Status

ABC is a proposed spec (v0.1). Anyone may implement `abc.txt` and a compatible
fragment endpoint; reference implementations here are provider-neutral. First
provider: [DoubleShift](https://doubleshift.to).

## License

[Apache-2.0](LICENSE).
