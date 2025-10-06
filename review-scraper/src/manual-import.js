// Manual review import from JSON (alternative to scraping)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('manual-import');

class ManualImporter {
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }

    async importReviews(reviews, productInfo) {
        logger.info(`Importing ${reviews.length} reviews...`);

        // Store product first
        await this.supabase.from('scraped_products').upsert({
            product_id: productInfo.product_id,
            product_name: productInfo.name,
            product_url: productInfo.url,
            platform: productInfo.platform || 'manual',
            overall_rating: productInfo.rating,
            brand: productInfo.brand,
            price: productInfo.price,
            last_scraped_at: new Date().toISOString()
        }, { onConflict: 'product_id' });

        logger.info('✓ Product stored');

        // Import reviews
        let imported = 0;
        for (const review of reviews) {
            try {
                await this.supabase.from('reviews').insert([{
                    product_id: productInfo.product_id,
                    product_name: productInfo.name,
                    product_url: productInfo.url,
                    rating: review.rating,
                    review_text: review.text,
                    customer_name: review.customer || 'Anonymous',
                    review_date: review.date || null,
                    verified_purchase: review.verified || false,
                    scraped_at: new Date().toISOString()
                }]);
                imported++;
            } catch (error) {
                if (error.code !== '23505') {
                    logger.error('Import failed:', error.message);
                }
            }
        }

        logger.info(`✓ Imported ${imported}/${reviews.length} reviews`);
        return imported;
    }
}

// Example usage with sample data
const sampleData = {
    product: {
        product_id: 'sample-123',
        name: 'Sample Product - Sports Bra',
        url: 'https://example.com/product',
        platform: 'manual',
        rating: 4.5,
        brand: 'Fitleasure',
        price: 49.90
    },
    reviews: [
        {
            rating: 5,
            text: 'Excellent quality! Very comfortable and fits perfectly. Worth every penny.',
            customer: 'Sarah M.',
            date: '2025-01-15',
            verified: true
        },
        {
            rating: 4,
            text: 'Good product overall. The material is nice but sizing runs a bit small.',
            customer: 'Jane D.',
            date: '2025-01-14',
            verified: true
        },
        {
            rating: 5,
            text: 'Love it! Great support and the color is beautiful. Highly recommend!',
            customer: 'Lisa K.',
            date: '2025-01-13',
            verified: false
        },
        {
            rating: 3,
            text: 'Decent quality but took too long to arrive. Product itself is okay.',
            customer: 'Amy L.',
            date: '2025-01-12',
            verified: true
        },
        {
            rating: 5,
            text: 'Perfect for workouts! Very breathable and comfortable. Will buy again.',
            customer: 'Rachel T.',
            date: '2025-01-11',
            verified: true
        }
    ]
};

async function main() {
    const importer = new ManualImporter();

    console.log('\n📥 Manual Review Import\n');
    console.log('Importing sample reviews for testing...\n');

    const count = await importer.importReviews(sampleData.reviews, sampleData.product);

    console.log(`\n✅ Import complete! ${count} reviews added`);
    console.log('\nNext steps:');
    console.log('1. npm run analyze   - Analyze these reviews with AI');
    console.log('2. npm run insights  - Generate insights report');
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export { ManualImporter };
