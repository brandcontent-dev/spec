# ABC reference adapter — Fastly (VCL service)
#
# Fastly is Varnish-based and supports a subset of ESI (esi:include,
# esi:remove, esi:comment) — enough for ABC. Enable ESI on HTML, then the
# <esi:include> tag in your template (see esi-tag.html) is resolved at the
# Fastly edge.

sub vcl_fetch {
    if (beresp.http.Content-Type ~ "text/html") {
        set beresp.do_esi = true;
    }
}

# Fastly forwards the client User-Agent on the ESI subrequest, so the
# provider can classify agent vs human and return 200 (card) or 204.
# Honour the fragment's Vary: User-Agent so a bot card is never cached
# for a human (default Fastly behaviour when Vary is present).
