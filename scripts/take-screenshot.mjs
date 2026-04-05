import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 2400 } });
const page = await ctx.newPage();

// Set localStorage to skip onboarding tour
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('time-scroll-onboarding-complete', 'true');
});

// Navigate to event
await page.goto('http://localhost:5173/explore?event=fall-of-rome', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(6000);

await page.screenshot({ path: 'C:/Users/33769/Desktop/ss-fall-hero.png' });
console.log('Hero screenshot saved');

// Scroll to see illustrations in the event story
const scrollable = await page.$('.overflow-y-auto');
if (scrollable) {
  await scrollable.evaluate(el => el.scrollTop = 600);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/33769/Desktop/ss-fall-overview.png' });
  console.log('Overview screenshot saved');

  await scrollable.evaluate(el => el.scrollTop = 1400);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/33769/Desktop/ss-fall-impact.png' });
  console.log('Impact section screenshot saved');
} else {
  console.log('No scrollable container found');
}

await browser.close();
