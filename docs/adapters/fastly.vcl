# ABC reference adapter — Fastly (VCL service)
#
# Fastly is Varnish-based and supports a subset of ESI (esi:include,
# esi:remove, esi:comment) — enough for ABC. Resolve the <esi:include> tag
# (see esi-tag.html) ONLY for AI agents, so a human request never triggers a
# fragment call. Classification is a single User-Agent match against the
# published agent list (schema/agents.json) — keep this regex in sync with it.

sub vcl_fetch {
    if (beresp.http.Content-Type ~ "text/html" &&
        req.http.User-Agent ~ "(?i)(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|Google-Extended|Google-CloudVertexBot|Applebot-Extended|PerplexityBot|Perplexity-User|CCBot|Meta-ExternalAgent|meta-externalfetcher|FacebookBot|Bytespider|cohere-ai|YouBot|Diffbot|MistralAI-User|Amazonbot)") {
        set beresp.do_esi = true;
    }
}

# The fragment response is cacheable by URL with no Vary: User-Agent — the
# edge has already filtered to agents, so the same card is reused across them.
# Fastly forwards the client User-Agent on the subrequest; the provider may
# use it for reporting only.
