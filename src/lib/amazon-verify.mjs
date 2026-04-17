/**
 * Amazon ASIN Verification Library
 * ─────────────────────────────────
 * Lightweight HTTP-based verification of Amazon product ASINs.
 * No API keys needed — uses browser-like GET requests with soft-404 detection.
 */

const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const SOFT_404 = [
  /<title>[^<]*Page Not Found[^<]*<\/title>/i,
  /<title>[^<]*Sorry[^<]*<\/title>/i,
  /Looking for something\?[\s\S]{0,600}We're sorry/i,
  /The Web address you entered is not a functioning page/i,
  /Dogs of Amazon/i
];

const PRODUCT_SIG = [
  /id="productTitle"/,
  /id="titleSection"/,
  /name="ASIN"[^>]*value="[A-Z0-9]{10}"/,
  /data-asin="[A-Z0-9]{10}"/
];

export async function verifyAsin(asin) {
  if (!/^[A-Z0-9]{10}$/i.test(asin)) return { asin, valid: false, reason: 'malformed' };
  const url = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      redirect: 'follow'
    });
    if (res.status !== 200) return { asin, valid: false, reason: `http-${res.status}`, url };
    if (res.url.includes('/s?k=') || res.url.match(/amazon\.com\/?(\?|$)/)) {
      return { asin, valid: false, reason: 'redirected-to-search', url };
    }
    const html = await res.text();

    // Real CAPTCHA pages are small and have validateCaptcha form
    if (html.length < 50000 && html.includes('validateCaptcha')) {
      return { asin, valid: false, reason: 'captcha', url };
    }

    // Real product pages are large (500KB+). Small pages with soft-404 markers are dead.
    if (html.length < 200000 && SOFT_404.some(p => p.test(html))) {
      return { asin, valid: false, reason: 'soft-404', url };
    }

    // For large pages, check product signatures
    if (html.length > 100000 || PRODUCT_SIG.some(p => p.test(html))) {
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]
        ?.replace(/\s*:?\s*Amazon\.com.*$/i, '').trim();
      return { asin, valid: true, title: title || 'Unknown', url };
    }

    return { asin, valid: false, reason: 'no-product-signature', url };
  } catch (err) {
    return { asin, valid: false, reason: `fetch-error: ${err.message}`, url };
  }
}

export function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

const LINK_RE = /https:\/\/www\.amazon\.com\/dp\/([A-Za-z0-9]{10})(?:\/[^"\s?]*)?(?:\?[^"\s]*)?/g;

export function countAmazonLinks(text) {
  return (text.match(LINK_RE) || []).length;
}

export function extractAsinsFromText(text) {
  const asins = new Set();
  let m;
  const re = new RegExp(LINK_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    asins.add(m[1]);
  }
  return [...asins];
}

export async function verifyAsinBatch(asins, delayMs = 2500) {
  const out = [];
  for (let i = 0; i < asins.length; i++) {
    out.push(await verifyAsin(asins[i]));
    if (i < asins.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return out;
}
