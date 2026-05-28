// ABC reference adapter — browser JS (fallback)
//
// For sites with no CDN/edge control. Drop this once in your page template.
// It fetches the card (JSON form) and appends it to the page client-side.
//
// Trade-off: an AI agent that does NOT execute JavaScript won't see the
// card. This path is the fallback — prefer ESI or an edge worker when you
// can. Use it for SPAs or when edge access isn't available.
//
// Set FRAGMENT_ENDPOINT to the full URL your provider gives you. Request
// the JSON form (format=json|both per your provider) so you can render it
// without trusting raw HTML injection if you prefer.

(async () => {
  const endpoint = "https://provider.example/fragment"; // your provider URL
  const u = new URL(endpoint);
  u.searchParams.set("page_url", location.href);
  u.searchParams.set("format", "both"); // JSON envelope incl. ready-to-inline html

  try {
    const r = await fetch(u.toString());
    if (r.status !== 200) return; // 204 = human / no-fill
    const data = await r.json();
    if (data && typeof data.html === "string") {
      document.body.insertAdjacentHTML("beforeend", data.html);
    }
  } catch {
    /* never break the page */
  }
})();
