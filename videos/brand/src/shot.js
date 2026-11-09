const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
 for (const l of ['en','fa']) { await p.goto('file://' + __dirname + `/banner-${l}.html`); await p.waitForTimeout(500);
   await p.screenshot({ path: __dirname + `/banner-${l}.png` }); }
 await b.close(); })();
