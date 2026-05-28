// ABC reference adapter — AWS Lambda@Edge (CloudFront)
//
// CloudFront has no native ESI. Attach this as an "origin-response" trigger
// on your distribution: it fetches the brand fragment from your provider and
// inlines it into HTML responses for AI agents. Humans get the page unchanged.
//
// Config: set FRAGMENT_ENDPOINT below to the full URL your provider gives you
// (Lambda@Edge has no env vars — inline the value or read it from a config).
//
// Notes / limits:
//   - origin-response can modify the body; CloudFront caps a generated body
//     at ~1 MB. Brand cards are ~2 KB, so the page size is the only concern.
//   - The viewer User-Agent is available on the event; forward it so the
//     provider can classify agent vs human.

"use strict";
const https = require("https");

const FRAGMENT_ENDPOINT = "https://provider.example/fragment"; // your provider URL

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
          return resolve(""); // 204 = human / no-fill
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
  const host = (request.headers["host"] || [{}])[0].value || "";
  const pageUrl = `https://${host}${request.uri}`;

  const card = await fetchCard(pageUrl, ua);
  if (!card) return response;

  response.body = response.body.includes("</body>")
    ? response.body.replace("</body>", `${card}\n</body>`)
    : response.body + card;
  return response;
};
