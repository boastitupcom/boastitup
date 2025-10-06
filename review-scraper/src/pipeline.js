// Complete automation pipeline
import { ZaloraScraper } from './scraper.js';
import { ReviewAnalyzer } from './ai-analyzer.js';
import { InsightsGenerator } from './insights-generator.js';
import { createLogger } from './logger.js';

const logger = createLogger('pipeline');

async function runPipeline(productUrl) {
    console.log('\n🚀 Starting Review Analysis Pipeline\n');
    console.log('='.repeat(60));

    // Step 1: Scrape Reviews
    console.log('\n📥 STEP 1: Scraping Reviews');
    console.log('-'.repeat(60));
    const scraper = new ZaloraScraper();
    let scrapeResult;

    try {
        await scraper.initialize();
        scrapeResult = await scraper.scrapeProductReviews(productUrl);
        console.log(`✓ Scraped ${scrapeResult.count} reviews`);
    } finally {
        await scraper.close();
    }

    if (scrapeResult.count === 0) {
        console.log('\n⚠️  No reviews found. Exiting...');
        return;
    }

    // Step 2: AI Analysis
    console.log('\n🤖 STEP 2: AI Sentiment Analysis');
    console.log('-'.repeat(60));
    const analyzer = new ReviewAnalyzer();
    const analyzed = await analyzer.processUnanalyzedReviews(scrapeResult.count);
    console.log(`✓ Analyzed ${analyzed} reviews`);

    // Step 3: Generate Insights
    console.log('\n📊 STEP 3: Generating Insights Report');
    console.log('-'.repeat(60));
    const generator = new InsightsGenerator();
    const report = await generator.generateFullReport();
    generator.printReport(report);

    console.log('\n✅ Pipeline completed successfully!\n');
}

// Main execution
const productUrl = process.argv[2] ||
    'https://www.zalora.com.my/p/fitleasure-women-s-blue-tie-n-dye-printed-running-training-sports-bra-blue-3078170.html';

runPipeline(productUrl).catch(error => {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
});
