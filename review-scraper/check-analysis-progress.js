import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('Checking analysis progress...\n');

const { data: allReviews } = await supabase
    .from('product_reviews')
    .select('id, rating, ai_sentiment, processed_at')
    .order('processed_at', { ascending: false });

if (!allReviews || allReviews.length === 0) {
    console.log('No reviews found');
} else {
    const total = allReviews.length;
    const processed = allReviews.filter(r => r.ai_sentiment).length;
    const unprocessed = total - processed;

    console.log(`📊 Total Reviews: ${total}`);
    console.log(`✓ Processed: ${processed}`);
    console.log(`⏳ Remaining: ${unprocessed}\n`);

    if (processed > 0) {
        console.log('Recently processed reviews:');
        allReviews
            .filter(r => r.ai_sentiment)
            .slice(0, 5)
            .forEach((r, i) => {
                const time = r.processed_at ? new Date(r.processed_at).toLocaleTimeString() : 'N/A';
                console.log(`${i + 1}. Rating: ${r.rating}/5 | Sentiment: ${r.ai_sentiment} | Time: ${time}`);
            });
    }
}
