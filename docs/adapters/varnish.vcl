# ABC reference adapter — Varnish (self-hosted)
#
# Enable ESI processing on HTML responses. The <esi:include> tag in your
# template (see esi-tag.html) is then resolved by Varnish at the edge.
#
# Drop this into your existing VCL.

sub vcl_backend_response {
    if (beresp.http.Content-Type ~ "text/html") {
        set beresp.do_esi = true;
    }
}

# Varnish forwards the client User-Agent to the ESI subrequest by default,
# so the provider can classify agent vs human. If your setup strips it,
# re-attach it explicitly on the fragment subrequest:
#
# sub vcl_backend_fetch {
#     if (bereq.url ~ "/fragment") {
#         set bereq.http.User-Agent = req.http.User-Agent;
#     }
# }
