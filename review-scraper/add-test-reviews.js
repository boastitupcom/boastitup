import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('Adding test reviews for AI analysis...\n');

const reviews = [
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 5,
        review_text: 'Excellent quality! Very comfortable and fits perfectly. The material is breathable and supportive. Worth every penny!',
        customer_name: 'Sarah M.',
        review_date: '2025-01-15',
        verified_purchase: true
    },
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 4,
        review_text: 'Good product overall. The sizing runs a bit small, so I had to exchange for a larger size. Once I got the right size, it was perfect!',
        customer_name: 'Jane D.',
        review_date: '2025-01-14',
        verified_purchase: true
    },
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 5,
        review_text: 'Love it! Great support during workouts and the color is beautiful. Highly recommend for anyone looking for quality sportswear.',
        customer_name: 'Lisa K.',
        review_date: '2025-01-13',
        verified_purchase: false
    },
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 2,
        review_text: 'Disappointed with the quality. The stitching came loose after just two washes. Not worth the price in my opinion.',
        customer_name: 'Amy L.',
        review_date: '2025-01-12',
        verified_purchase: true
    },
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 5,
        review_text: 'Perfect for workouts! Very breathable and comfortable. The fit is true to size and provides excellent support.',
        customer_name: 'Rachel T.',
        review_date: '2025-01-11',
        verified_purchase: true
    },
    {
        product_id: 'test-sports-bra-001',
        product_name: 'Fitleasure Women\'s Sports Bra',
        product_url: 'https://www.zalora.com.my/test-product',
        rating: 3,
        review_text: 'It\'s okay. Nothing special but does the job. Wish it had more color options available.',
        customer_name: 'Emily W.',
        review_date: '2025-01-10',
        verified_purchase: false
    }
];

let added = 0;
for (const review of reviews) {
    const { error } = await supabase
        .from('reviews')
        .insert([{ ...review, scraped_at: new Date().toISOString() }]);

    if (!error) {
        added++;
        console.log(`✓ Added review ${added}/${reviews.length}`);
    } else if (error.code !== '23505') {
        console.log(`✗ Error: ${error.message}`);
    }
}

console.log(`\n✅ Added ${added} new reviews`);

// Check total
const { count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

console.log(`📝 Total reviews in database: ${count}`);
console.log(`\nReady to run: npm run analyze\n`);
