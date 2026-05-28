# Agentic Brand Content (ABC)

An open, declarative standard for publishers to serve structured **brand context**
to AI agents — instead of giving their content away for free.

- **The declaration** — `abc.txt` at the site root declares which *providers* may
  serve AI-agent brand content on the site (the `ads.txt` model, applied to the
  agentic web).
- **The delivery** — a provider's *fragment endpoint* returns a compact brand card
  for AI-agent traffic and nothing for humans. The publisher inlines it on its
  existing CDN via `<esi:include>` or a small edge function. No platform lock-in.

The published standard lives at **https://brandcontent.dev** and is built from this
repo with MkDocs Material.

## Develop

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # preview at http://127.0.0.1:8000
mkdocs build --strict   # output to ./site
```

## Contents

```
mkdocs.yml                   site config (Material theme)
docs/index.md               the standard (single page → brandcontent.dev)
docs/abc.txt                canonical example declaration
docs/schema/card.schema.json JSON schema for a brand card
```

Reference edge adapters (ESI snippets, Cloudflare Worker, Lambda@Edge) and the
bot-detection list will be published in sibling repos under
[github.com/brandcontent-dev](https://github.com/brandcontent-dev).

## Status

ABC is a proposed convention (spec v0.1). Anyone may implement `abc.txt` and a
compatible fragment endpoint. First provider:
[DoubleShift](https://doubleshift.to).

## License

[Apache-2.0](LICENSE).
