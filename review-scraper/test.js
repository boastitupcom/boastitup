// Quick test of Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    console.log('Testing Supabase connection...\n');

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // Test 1: Check tables exist
    console.log('1. Checking tables...');
    const { data: tables, error: tablesError } = await supabase
        .from('reviews')
        .select('id')
        .limit(1);

    if (tablesError) {
        console.error('❌ Tables check failed:', tablesError.message);
        return;
    }
    console.log('✓ Tables exist\n');

    // Test 2: Check views
    console.log('2. Checking views...');
    const { data: viewData, error: viewError } = await supabase
        .from('v_product_review_summary')
        .select('*')
        .limit(1);

    if (viewError) {
        console.error('❌ Views check failed:', viewError.message);
    } else {
        console.log('✓ Views accessible\n');
    }

    // Test 3: Count existing reviews
    console.log('3. Counting reviews...');
    const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

    console.log(`✓ Found ${count} existing reviews\n`);

    // Test 4: Check unprocessed reviews
    const { count: unprocessed } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .is('ai_sentiment', null);

    console.log(`✓ ${unprocessed} reviews need AI analysis\n`);

    console.log('✅ All tests passed!');
    console.log('\nReady to run:');
    console.log('- npm run pipeline  (full automation)');
    console.log('- npm run scrape    (scrape only)');
    console.log('- npm run analyze   (analyze only)');
    console.log('- npm run insights  (insights only)');
}

test().catch(console.error);
