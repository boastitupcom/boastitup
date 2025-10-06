// Basic scraper test
import { chromium } from 'playwright';

async function testBrowser() {
    console.log('1. Testing browser launch...');
    const browser = await chromium.launch({ headless: true });
    console.log('✓ Browser launched');

    console.log('2. Creating page...');
    const page = await browser.newPage();
    console.log('✓ Page created');

    console.log('3. Navigating to Zalora...');
    await page.goto('https://www.zalora.com.my/p/fitleasure-women-s-blue-tie-n-dye-printed-running-training-sports-bra-blue-3078170.html', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });
    console.log('✓ Page loaded');

    console.log('4. Getting page title...');
    const title = await page.title();
    console.log(`✓ Title: ${title}`);

    console.log('5. Looking for product name...');
    const productName = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
    console.log(`✓ Product: ${productName || 'Not found'}`);

    console.log('6. Looking for reviews...');
    const reviewsExist = await page.$('.review-item') !== null;
    console.log(`✓ Reviews found: ${reviewsExist}`);

    if (!reviewsExist) {
        console.log('\n⚠️  No reviews section found. Website structure may have changed.');
        console.log('Taking screenshot for debugging...');
        await page.screenshot({ path: 'page-screenshot.png', fullPage: false });
        console.log('✓ Screenshot saved as page-screenshot.png');

        // Try to find what elements exist
        const bodyText = await page.$eval('body', el => el.textContent.substring(0, 500));
        console.log('\nFirst 500 chars of page:', bodyText);
    }

    await browser.close();
    console.log('\n✅ Basic test complete');
}

testBrowser().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});
