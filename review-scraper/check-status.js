// Check scraping status
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkStatus() {
    // Check scraping jobs
    const { data: jobs } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('\n📋 Recent Scraping Jobs:');
    console.log('─'.repeat(60));
    if (jobs && jobs.length > 0) {
        jobs.forEach(job => {
            console.log(`Status: ${job.status} | Reviews: ${job.reviews_scraped} | ${new Date(job.created_at).toLocaleString()}`);
            if (job.error_message) console.log(`  Error: ${job.error_message}`);
        });
    } else {
        console.log('No jobs found yet');
    }

    // Check reviews
    const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📝 Total Reviews: ${reviewCount}`);

    // Check products
    const { data: products } = await supabase
        .from('scraped_products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (products && products.length > 0) {
        console.log('\n📦 Recent Products:');
        console.log('─'.repeat(60));
        products.forEach(p => {
            console.log(`${p.product_name} (${p.total_reviews} reviews)`);
        });
    }

    // Check unprocessed
    const { count: unprocessed } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .is('ai_sentiment', null);

    console.log(`\n🤖 Unprocessed Reviews: ${unprocessed}`);
    console.log('');
}

checkStatus().catch(console.error);
