// ABC reference adapter — Cloudflare Worker
//
// Cloudflare has no native ESI, so a small Worker plays the same role:
// classify the request at the edge and, for AI agents only, fetch the brand
// fragment from your provider and inline it. Humans get the page unchanged
// and never trigger a fragment call.
//
// Config (wrangler.toml [vars] / secret):
//   FRAGMENT_ENDPOINT  full URL your provider gives you (carries their
//                      auth / placement params). Example:
//                      https://provider.example/fragment?account=abc123
//
// Deploy: npx wrangler deploy

// Agent markers — keep in sync with schema/agents.json (word-boundary, case-insensitive).
const AGENT_UA =
  /\b(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|Google-Extended|Google-CloudVertexBot|Applebot-Extended|PerplexityBot|Perplexity-User|CCBot|Meta-ExternalAgent|meta-externalfetcher|FacebookBot|Bytespider|cohere-ai|YouBot|Diffbot|MistralAI-User|Amazonbot)\b/i;

export default {
  async fetch(request, env) {
    const res = await fetch(request); // your origin
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return res;

    // Classify at the edge: only AI agents get a fragment call.
    const ua = request.headers.get("User-Agent") || "";
    if (!AGENT_UA.test(ua)) return res;

    // Build the fragment request: provider URL + this page. The UA is
    // forwarded for the provider's reporting only (it does not affect the card).
    const frag = new URL(env.FRAGMENT_ENDPOINT);
    frag.searchParams.set("page_url", request.url);

    let card = "";
    try {
      const r = await fetch(frag.toString(), {
        headers: { "User-Agent": ua },
      });
      // 200 = a card for this page; 204 = no eligible brand (no-fill).
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
