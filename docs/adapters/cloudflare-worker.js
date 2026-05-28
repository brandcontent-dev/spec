// ABC reference adapter — Cloudflare Worker
//
// Cloudflare has no native ESI, so a small Worker plays the same role:
// fetch the brand fragment from your provider and inline it into HTML
// responses for AI agents. Humans get the page unchanged.
//
// Config (wrangler.toml [vars] / secret):
//   FRAGMENT_ENDPOINT  full URL your provider gives you (carries their
//                      auth / placement params). Example:
//                      https://provider.example/fragment?account=abc123
//
// Deploy: npx wrangler deploy

export default {
  async fetch(request, env) {
    const res = await fetch(request); // your origin
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return res;

    // Build the fragment request: provider URL + this page + forwarded UA.
    const frag = new URL(env.FRAGMENT_ENDPOINT);
    frag.searchParams.set("page_url", request.url);

    let card = "";
    try {
      const r = await fetch(frag.toString(), {
        headers: { "User-Agent": request.headers.get("User-Agent") || "" },
      });
      // 200 = a card for this AI agent; 204 = human or no eligible brand.
      if (r.status === 200) card = await r.text();
    } catch {
      // Never break the page if the provider is unreachable.
      return res;
    }
    if (!card) return res;

    // Inline the card just before </body>, streaming (no full buffering).
    return new HTMLRewriter()
      .on("body", {
        element(el) {
          el.append(card, { html: true });
        },
      })
      .transform(res);
  },
};
