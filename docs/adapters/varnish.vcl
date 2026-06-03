# ABC reference adapter — Varnish (self-hosted)
#
# Resolve the <esi:include> tag (see esi-tag.html) ONLY for AI agents, so a
# human request never triggers a card request. Classification is a single
# User-Agent match against the published agent list (schema/agents.json) —
# keep this regex in sync with that file.
#
# Drop this into your existing VCL.

sub vcl_backend_response {
    if (beresp.http.Content-Type ~ "text/html" &&
        bereq.http.User-Agent ~ "(?i)(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|Google-CloudVertexBot|PerplexityBot|Perplexity-User|CCBot|Meta-ExternalAgent|meta-externalfetcher|Bytespider|YouBot|Diffbot|MistralAI-User|Amazonbot)") {
        set beresp.do_esi = true;
    }
}

# The client User-Agent is forwarded to the card subrequest by default
# (the provider may use it for reporting, not classification). If your setup
# strips it, re-attach it on the /fragment subrequest:
#
# sub vcl_backend_fetch {
#     if (bereq.url ~ "/fragment") {
#         set bereq.http.User-Agent = req.http.User-Agent;
#     }
# }
