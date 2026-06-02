// ABC reference adapter — AWS Lambda@Edge (CloudFront)
//
// CloudFront has no native ESI. Attach this as an "origin-response" trigger
// on your distribution: it classifies the request at the edge and, for AI
// agents only, fetches the brand card from your provider and inlines it.
// Humans get the page unchanged and never trigger a card request.
//
// Config: set FRAGMENT_ENDPOINT below to the full URL your provider gives you
// (Lambda@Edge has no env vars — inline the value or read it from a config).
//
// Notes / limits:
//   - origin-response can modify the body; CloudFront caps a generated body
//     at ~1 MB. Brand cards are ~2 KB, so the page size is the only concern.

"use strict";
const https = require("https");

const FRAGMENT_ENDPOINT = "https://provider.example/fragment"; // your provider URL

// Agent markers — keep in sync with schema/agents.json (word-boundary, case-insensitive).
const AGENT_UA =
  /\b(GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|Google-Extended|Google-CloudVertexBot|Applebot-Extended|PerplexityBot|Perplexity-User|CCBot|Meta-ExternalAgent|meta-externalfetcher|FacebookBot|Bytespider|cohere-ai|YouBot|Diffbot|MistralAI-User|Amazonbot)\b/i;

function fetchCard(pageUrl, userAgent) {
  return new Promise((resolve) => {
    const u = new URL(FRAGMENT_ENDPOINT);
    u.searchParams.set("page_url", pageUrl);
    const req = https.get(
      u,
      { headers: { "User-Agent": userAgent || "" } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(""); // 204 = no eligible brand (no-fill)
        }
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", () => resolve("")); // never break the page
    req.setTimeout(800, () => req.destroy());
  });
}

exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;

  const ct = (response.headers["content-type"] || [{}])[0].value || "";
  if (!ct.includes("text/html") || !response.body) return response;

  const ua = (request.headers["user-agent"] || [{}])[0].value || "";
  // Classify at the edge: only AI agents get a card request. The UA is then
  // forwarded for the provider's reporting only (it does not affect the card).
  if (!AGENT_UA.test(ua)) return response;

  const host = (request.headers["host"] || [{}])[0].value || "";
  const pageUrl = `https://${host}${request.uri}`;

  const card = await fetchCard(pageUrl, ua);
  if (!card) return response;

  response.body = response.body.includes("</body>")
    ? response.body.replace("</body>", `${card}\n</body>`)
    : response.body + card;
  return response;
};
