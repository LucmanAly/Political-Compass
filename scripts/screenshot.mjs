import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('qa-screenshots');
await mkdir(outDir, { recursive: true });

const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

const browser = await chromium.launch();
const base = 'http://127.0.0.1:4173/';

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const file = path.join(outDir, `${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('wrote', file);
  await page.close();
}

// Mobile with browse sheet open
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Browse', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '390x844-browse.png'), fullPage: false });
  console.log('wrote browse sheet');
  await page.close();
}

// Desktop with selection
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const marker = page.locator('[data-entity-marker]').first();
  if (await marker.count()) {
    await marker.click({ force: true });
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(outDir, '1440x900-selected.png'), fullPage: false });
  console.log('wrote selected desktop');
  await page.close();
}

await browser.close();
