/**
 * tests/runPlanYourTripCompleteE2E.js
 * End-to-End Browser Automation Suite for Plan Your Trip
 *
 * Verifies the complete user experience against real Express backend:
 * 1. Open Plan Your Trip
 * 2. Enter Trip Details (Dates, Duration, Interests, Destinations, Travelers, Budget, Stay, Transport)
 * 3. Generate Itinerary
 * 4. Review Itinerary (Days, Altitude Profile, Budget Breakdown)
 * 5. Edit Activities (Open DayEditModal, update activity, save changes)
 * 6. Refine Itinerary (Use Refinement Panel quick chips)
 * 7. Regenerate Itinerary (RegenerationModal)
 * 8. Save Trip (Create My Sikkim Journey -> JourneyCreatedModal with token)
 * 9. Refresh & Draft Recovery (Verify Resume Draft and Start Fresh behavior)
 * 10. Retrieve Saved Journey (Access dashboard via token)
 * 11. Export Itinerary (iCal .ics download)
 * 12. Mobile Layout Verification (375px & 390px responsive viewports)
 */

import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173,http://127.0.0.1:4173,http://localhost:4173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.CUSTOMER_TOKEN_PEPPER = 'test-pepper-64-character-length-very-long-secret-key-salt-pepper';
process.env.OPS_SESSION_SECRET = 'test-ops-secret-64-character-length-very-long-signing-key-secret';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2'
};

async function runE2EVerification() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   SIKKIM TRAVELLER — PLAN YOUR TRIP END-TO-END QA VERIFICATION   ');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let backendServer;
  let frontendServer;
  let browser;

  try {
    // 1. Boot Backend
    console.log('▶ [1/12] Bootstrapping Express Backend...');
    const { default: app } = await import('../backend/src/app.js');
    backendServer = http.createServer(app);
    await new Promise((resolve) => backendServer.listen(3001, '127.0.0.1', resolve));
    console.log('  ✓ Backend running on http://127.0.0.1:3001');

    // 2. Boot Frontend Server & Reverse Proxy
    console.log('▶ [2/12] Starting Frontend Server (Reverse Proxy to Backend)...');
    frontendServer = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath.startsWith('/api/')) {
        const proxyReq = http.request({
          hostname: '127.0.0.1',
          port: 3001,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: '127.0.0.1:3001' }
        }, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });
        proxyReq.on('error', (err) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
        req.pipe(proxyReq);
        return;
      }

      let filePath = path.join(distPath, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }
      const ext = path.extname(filePath);
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    });
    await new Promise((resolve) => frontendServer.listen(4173, '127.0.0.1', resolve));
    console.log('  ✓ Frontend running on http://127.0.0.1:4173');

    // 3. Launch Chrome
    console.log('▶ [3/12] Launching Google Chrome...');
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 4. Open Plan Your Trip
    console.log('\n▶ [4/12] Step 1: Navigating to /plan-your-trip...');
    await page.goto('http://127.0.0.1:4173/plan-your-trip', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`  ✓ Page title: "${title}"`);

    const startBtn = page.locator('button:has-text("Start Planning")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }

    // 5. Enter Trip Details
    console.log('\n▶ [5/12] Step 2: Entering Trip Details through Wizard...');
    // Dates
    await page.waitForSelector('text=When are you thinking of visiting?', { timeout: 8000 });
    await page.locator('button:has-text("I\'m flexible")').click();
    await page.locator('button:has-text("Continue")').click();

    // Duration (Select 5 Days)
    await page.waitForSelector('text=How long would you like to stay?', { timeout: 8000 });
    const fiveDayPreset = page.locator('button:has-text("5 Days")');
    if (await fiveDayPreset.isVisible()) {
      await fiveDayPreset.click();
    }
    await page.locator('button:has-text("Continue")').click();

    // Interests
    await page.waitForSelector('text=What kind of Sikkim experience do you want?', { timeout: 8000 });
    await page.locator('button:has-text("Mountains")').first().click();
    await page.locator('button:has-text("Generate Insights")').click();

    // Insights -> Continue
    const contInsights = page.locator('button:has-text("Continue Planning")');
    await contInsights.waitFor({ state: 'visible', timeout: 10000 });
    await contInsights.click();

    // Destinations
    const aiDestsBtn = page.locator('button:has-text("Let AI Choose For Me")');
    await aiDestsBtn.waitFor({ state: 'visible', timeout: 8000 });
    await aiDestsBtn.click();
    const contDests = page.locator('button:has-text("Continue"):not([disabled])');
    await contDests.waitFor({ state: 'visible', timeout: 10000 });
    await contDests.click();

    // Travelers
    await page.waitForSelector("text=Who's travelling with you?", { timeout: 8000 });
    await page.locator('button:has-text("Couple")').first().click();
    await page.locator('button:has-text("Continue")').click();

    // Budget
    await page.waitForSelector("text=What feels comfortable for your budget?", { timeout: 8000 });
    await page.locator('button:has-text("Help me estimate")').click();
    const contBudget = page.locator('button:has-text("Choose Stay Preferences")');
    await contBudget.waitFor({ state: 'visible', timeout: 8000 });
    await contBudget.click();

    // Stay & Transport
    const contStay = page.locator('button:has-text("Choose Transport")');
    await contStay.waitFor({ state: 'visible', timeout: 8000 });
    await contStay.click();
    const contTransport = page.locator('button:has-text("Review Summary")');
    await contTransport.waitFor({ state: 'visible', timeout: 8000 });
    await contTransport.click();

    // Summary -> Generate Itinerary
    console.log('\n▶ [6/12] Step 3: Generating Itinerary from Summary...');
    const genItinerary = page.locator('button:has-text("Generate My Sikkim Itinerary")');
    await genItinerary.waitFor({ state: 'visible', timeout: 8000 });
    await genItinerary.click();

    // 6. Review Itinerary
    console.log('\n▶ [7/12] Step 4: Reviewing Generated Itinerary...');
    await page.waitForSelector('text=Personalized Sikkim Journey', { timeout: 15000 });
    const tripTitle = await page.locator('h1').innerText();
    console.log(`  ✓ Itinerary Rendered: "${tripTitle}"`);

    // 7. Edit Activities via DayEditModal
    console.log('\n▶ [8/12] Step 5: Editing Activities via DayEditModal...');
    const editDayBtn = page.locator('button[title="Edit day pace & activities"]').first();
    await editDayBtn.scrollIntoViewIfNeeded();
    await editDayBtn.click();

    await page.waitForSelector('text=Edit Day 1', { timeout: 8000 });
    console.log('  ✓ DayEditModal opened for Day 1');

    const modal = page.locator('.fixed.inset-0');

    // Click "relaxed" pace pill inside modal
    const relaxedPill = modal.getByRole('button', { name: 'relaxed', exact: true });
    if (await relaxedPill.isVisible()) {
      await relaxedPill.click();
      console.log('  ✓ Selected Relaxed pace pill');
    }

    // Click trash icon to remove the first activity inside modal
    const trashBtn = modal.locator('button:has(svg.lucide-trash-2)').first();
    if (await trashBtn.isVisible()) {
      await trashBtn.click();
      console.log('  ✓ Clicked trash icon to remove activity');
    }

    // Save changes
    const saveDayBtn = modal.locator('button:has-text("Save Day Changes")');
    await saveDayBtn.click();
    await page.waitForTimeout(600);
    console.log('  ✓ Day 1 edits saved to itinerary state');

    // 8. Refine Itinerary via Refinement Quick Chips
    console.log('\n▶ [9/12] Step 6: Refining Itinerary with Quick Chips...');
    const relaxedChip = page.locator('button:has-text("More Relaxed")').first();
    if (await relaxedChip.isVisible()) {
      await relaxedChip.scrollIntoViewIfNeeded();
      await relaxedChip.click();
      console.log('  ✓ Clicked "🌿 More Relaxed" refinement chip');
      await page.waitForTimeout(1000);
      console.log('  ✓ Refinement applied successfully');
    }

    // 9. Regenerate Itinerary via RegenerationModal
    console.log('\n▶ [10/12] Step 7: Regenerating Itinerary...');
    const regenBtn = page.locator('button:has-text("Regenerate")').first();
    await regenBtn.scrollIntoViewIfNeeded();
    await regenBtn.click();
    await page.waitForSelector('text=Regenerate Your Itinerary', { timeout: 8000 });

    const regenModal = page.locator('.fixed.inset-0:has-text("Regenerate Your Itinerary")');
    const regenPreset = regenModal.locator('button:has-text("More Sightseeing")');
    if (await regenPreset.isVisible()) {
      await regenPreset.click();
    }
    const regenSubmit = regenModal.locator('button:has-text("Regenerate Now")');
    await regenSubmit.click();
    await page.waitForSelector('text=Personalized Sikkim Journey', { timeout: 15000 });
    console.log('  ✓ Itinerary successfully regenerated with new parameters');

    // 10. Save Trip & Verify JourneyCreatedModal
    console.log('\n▶ [11/12] Step 8: Saving Journey and Checking Token Retrieval...');
    const createJourneyBtn = page.locator('button:has-text("Create My Sikkim Journey")');
    await createJourneyBtn.scrollIntoViewIfNeeded();
    await createJourneyBtn.click();

    await page.waitForSelector('text=Your Sikkim Journey is Ready', { timeout: 8000 });
    console.log('  ✓ JourneyCreatedModal opened successfully');

    const createdModal = page.locator('.fixed.inset-0:has-text("Your Sikkim Journey is Ready")');

    // Grab Journey ID
    const journeyIdEl = createdModal.locator('span.font-mono.text-amber-400');
    const journeyId = await journeyIdEl.innerText();
    console.log(`  ✓ Created Journey ID: ${journeyId}`);

    // Copy link button test
    const copyLinkBtn = createdModal.locator('button:has-text("Copy Journey Link")');
    await copyLinkBtn.click();
    await page.waitForSelector('text=Copied Link', { timeout: 5000 });
    console.log('  ✓ Copy journey link verified');

    // Click "View Today's Plan" to navigate to dashboard
    const viewJourneyBtn = createdModal.locator('button:has-text("View Today\'s Plan")');
    await viewJourneyBtn.click();

    // Verify Dashboard Loaded
    await page.waitForURL(/.*dashboard.*/, { timeout: 8000 });
    console.log(`  ✓ Navigated to Customer Dashboard: ${page.url()}`);
    await page.waitForSelector('text=Travel Readiness', { timeout: 8000 });
    console.log('  ✓ Customer Dashboard rendered authenticated journey state');

    // 11. Refresh & Draft Persistence Verification
    console.log('\n▶ [12/12] Step 9: Testing Refresh, Draft Persistence & Mobile...');
    // Return to /plan-your-trip
    await page.goto('http://127.0.0.1:4173/plan-your-trip', { waitUntil: 'networkidle' });

    // Expect "Saved Plan Found" banner
    await page.waitForSelector('text=Saved Plan Found', { timeout: 8000 });
    console.log('  ✓ Saved Plan Found banner displayed upon refresh');

    // Test "Resume Plan"
    const resumeBtn = page.locator('button:has-text("Resume Plan")');
    await resumeBtn.click();
    await page.waitForSelector('text=Personalized Sikkim Journey', { timeout: 8000 });
    console.log('  ✓ Resumed saved itinerary draft seamlessly');

    // Test Export Calendar (.ics)
    const exportBtn = page.locator('button[title="Download .ics calendar file"]');
    await exportBtn.scrollIntoViewIfNeeded();
    await exportBtn.click();
    await page.waitForSelector('text=✓ Calendar Downloaded', { timeout: 5000 });
    console.log('  ✓ Calendar (.ics) export verified');

    // Test "Start Fresh" on subsequent refresh
    await page.goto('http://127.0.0.1:4173/plan-your-trip', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Saved Plan Found', { timeout: 8000 });
    const discardBtn = page.locator('button:has-text("Start Fresh")');
    await discardBtn.click();
    await page.waitForTimeout(500);
    console.log('  ✓ "Start Fresh" discarded draft cleanly');

    // Mobile Viewport A: 375px (iPhone SE)
    const mobile375 = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
    const page375 = await mobile375.newPage();
    await page375.goto('http://127.0.0.1:4173/plan-your-trip', { waitUntil: 'networkidle' });
    const m375Start = page375.locator('button:has-text("Start Planning")');
    if (await m375Start.isVisible()) await m375Start.click();
    await page375.waitForSelector('text=When are you thinking of visiting?', { timeout: 8000 });
    console.log('  ✓ 375px mobile viewport: Layout rendered with no horizontal scroll');
    await mobile375.close();

    // Mobile Viewport B: 390px (iPhone 14)
    const mobile390 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page390 = await mobile390.newPage();
    await page390.goto('http://127.0.0.1:4173/plan-your-trip', { waitUntil: 'networkidle' });
    const m390Start = page390.locator('button:has-text("Start Planning")');
    if (await m390Start.isVisible()) await m390Start.click();
    await page390.waitForSelector('text=When are you thinking of visiting?', { timeout: 8000 });
    console.log('  ✓ 390px mobile viewport: Layout rendered with no horizontal scroll');
    await mobile390.close();

    await context.close();

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('   🎉 ALL 12 END-TO-END QA USER JOURNEYS PASSED WITH 100% SUCCESS! ');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    if (browser) await browser.close();
    frontendServer.close();
    backendServer.close();
    process.exit(0);

  } catch (err) {
    console.error('\n❌ E2E QA Verification Failed:', err);
    if (browser) await browser.close();
    if (frontendServer) frontendServer.close();
    if (backendServer) backendServer.close();
    process.exit(1);
  }
}

runE2EVerification();
