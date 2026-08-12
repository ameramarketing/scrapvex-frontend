const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5174/login?app=true', { waitUntil: 'networkidle0' });
  
  // Wait a bit for React to mount and render completely
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.content();
  fs.writeFileSync('dom_dump.html', html);
  
  await browser.close();
  console.log('DOM dumped to dom_dump.html');
})();
