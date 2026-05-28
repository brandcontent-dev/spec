# Contributing

Agentic Brand Content is an open spec. Proposals, corrections, and new reference
adapters are welcome.

## How to propose a change

- **Spec or wording** — open an issue or PR against `docs/`. Explain the problem
  before the fix.
- **A new agent** — add it to `docs/schema/agents.json` (and the table in
  `docs/agents.md`) with a vendor-published source for the User-Agent marker.
- **A new adapter** — add a self-contained file under `docs/adapters/` and reference
  it from `docs/integration.md`. Keep it provider-neutral (no hard-coded endpoint).

## Versioning

`MINOR` bumps for additive or clarifying changes; `MAJOR` once the `abc.txt` format
and the fragment contract are frozen. Record every change in `CHANGELOG.md`.

## Local preview

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # http://127.0.0.1:8000
mkdocs build --strict   # must pass before merge
```

## Scope

This repo is the **spec** and its reference implementations — all provider-neutral.
A provider's serving engine, brand catalog, and reporting are out of scope here.

## License

By contributing you agree your contribution is licensed under
[Apache-2.0](LICENSE).
