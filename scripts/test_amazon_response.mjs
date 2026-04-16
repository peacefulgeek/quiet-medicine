import https from 'https';

const url = 'https://www.amazon.com/dp/B0CRKX1VV7';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

https.get(url, { headers }, (res) => {
  let body = '';
  res.on('data', c => { body += c; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body length:', body.length);
    
    // Title extraction
    const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/s);
    if (titleMatch) {
      console.log('Page title:', titleMatch[1].replace(/\s+/g, ' ').trim().substring(0, 150));
    }
    
    // Key indicators
    console.log('Has productTitle id:', body.includes('id="productTitle"'));
    console.log('Has Add to Cart:', body.includes('Add to Cart'));
    console.log('Has add-to-cart-button:', body.includes('add-to-cart-button'));
    console.log('Has Sorry we couldnt:', body.includes("Sorry, we couldn"));
    console.log('Has validateCaptcha:', body.includes('validateCaptcha'));
    console.log('Has Type the characters:', body.includes('Type the characters'));
    
    // The real check: page size. Real product pages are 500KB+. CAPTCHA is <50KB. 404 dog pages are <100KB.
    const isLikelyReal = body.length > 100000;
    const isLikelyCaptcha = body.length < 50000 && body.includes('validateCaptcha');
    const isLikely404 = body.includes("Sorry, we couldn") || body.includes('looking for something');
    
    console.log('\nVerdict:');
    console.log('  Likely real product page:', isLikelyReal);
    console.log('  Likely CAPTCHA:', isLikelyCaptcha);
    console.log('  Likely 404/dog:', isLikely404);
    
    // Check where 'robot' appears if at all
    const robotIdx = body.toLowerCase().indexOf('robot');
    if (robotIdx >= 0) {
      // Get surrounding context but avoid shell escaping issues
      const start = Math.max(0, robotIdx - 30);
      const end = Math.min(body.length, robotIdx + 30);
      const context = body.substring(start, end).replace(/[\n\r]/g, ' ');
      console.log('\n  "robot" found at index', robotIdx, '- context:', context);
    } else {
      console.log('\n  "robot" not found in page');
    }
  });
});
