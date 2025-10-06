// Web scraper for Zalora reviews
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('scraper');

class ZaloraScraper {
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        this.browser = null;
        this.page = null;
        this.jobId = null;
    }

    async initialize() {
        logger.info('Initializing browser...');
        this.browser = await chromium.launch({
            headless: false, // Run in visible mode to avoid detection
            args: [
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage'
            ]
        });

        const context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
            timezoneId: 'Asia/Kuala_Lumpur'
        });

        this.page = await context.newPage();

        // Remove webdriver property
        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        logger.info('Browser ready');
    }

    async createScrapingJob(productUrl) {
        const { data } = await this.supabase.from('scraping_jobs').insert([{
            product_url: productUrl, status: 'in_progress', started_at: new Date().toISOString()
        }]).select().single();
        this.jobId = data.id;
        return data;
    }

    async updateJob(status, updates = {}) {
        if (!this.jobId) return;
        await this.supabase.from('scraping_jobs')
            .update({ status, ...updates, completed_at: new Date().toISOString() })
            .eq('id', this.jobId);
    }

    extractProductId(url) {
        const match = url.match(/-(\d+)(\.html)?$/);
        return match ? match[1] : url.split('/').pop();
    }

    async scrapeProductReviews(productUrl) {
        try {
            await this.createScrapingJob(productUrl);
            logger.info(`Scraping: ${productUrl}`);
            await this.page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 });
            await this.page.waitForTimeout(2000);

            const productInfo = await this.extractProductInfo(productUrl);
            await this.storeProduct(productInfo);

            const reviews = await this.extractReviews(productInfo);
            logger.info(`Found ${reviews.length} reviews`);

            let stored = 0;
            for (const review of reviews) {
                try {
                    await this.storeReview(review);
                    stored++;
                } catch (e) {}
            }

            await this.updateJob('completed', { reviews_scraped: stored });
            logger.info(` Scraped ${stored} reviews`);
            return { success: true, count: stored };
        } catch (error) {
            logger.error('Scraping failed:', error);
            await this.updateJob('failed', { error_message: error.message });
            throw error;
        }
    }

    async extractProductInfo(productUrl) {
        const name = await this.page.$eval('h1', el => el.textContent.trim()).catch(() => 'Unknown');
        const rating = await this.page.$eval('.rating-score', el => parseFloat(el.textContent)).catch(() => null);
        const price = await this.page.$eval('.product-price', el => parseFloat(el.textContent.replace(/[^0-9.]/g, ''))).catch(() => null);
        const brand = await this.page.$eval('.product-brand', el => el.textContent.trim()).catch(() => null);
        return { product_id: this.extractProductId(productUrl), name, url: productUrl, rating, price, brand };
    }

    async extractReviews(productInfo) {
        try {
            await this.page.waitForSelector('.review-item', { timeout: 5000 }).catch(() => {});
            return await this.page.$$eval('.review-item', (elements, info) => {
                return elements.map(el => {
                    const rating = parseInt(el.querySelector('.rating')?.textContent.match(/\d+/)?.[0] || '0');
                    const text = el.querySelector('.review-text')?.textContent.trim() || '';
                    const name = el.querySelector('.customer-name')?.textContent.trim() || 'Anonymous';
                    const date = el.querySelector('.review-date')?.textContent.trim() || null;
                    const verified = el.querySelector('.verified-badge') !== null;
                    return {
                        rating, review_text: text, customer_name: name, review_date: date,
                        verified_purchase: verified, product_id: info.product_id,
                        product_name: info.name, product_url: info.url
                    };
                }).filter(r => r.review_text.length > 0);
            }, productInfo);
        } catch (error) {
            return [];
        }
    }

    async storeProduct(info) {
        await this.supabase.from('scraped_products').upsert({
            product_id: info.product_id, product_name: info.name, product_url: info.url,
            platform: 'zalora', overall_rating: info.rating, brand: info.brand,
            price: info.price, last_scraped_at: new Date().toISOString()
        }, { onConflict: 'product_id' });
    }

    async storeReview(review) {
        const { error } = await this.supabase.from('reviews').insert([{
            ...review, scraped_at: new Date().toISOString()
        }]);
        if (error && error.code !== '23505') throw error;
    }

    async close() {
        if (this.browser) await this.browser.close();
    }
}

async function main() {
    const scraper = new ZaloraScraper();
    try {
        await scraper.initialize();
        const url = process.argv[2] || 'https://www.zalora.com.my/p/fitleasure-women-s-blue-tie-n-dye-printed-running-training-sports-bra-blue-3078170.html';
        const result = await scraper.scrapeProductReviews(url);
        console.log('\n Success! Scraped', result.count, 'reviews');
        console.log('Next: npm run analyze');
    } finally {
        await scraper.close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
export { ZaloraScraper };
