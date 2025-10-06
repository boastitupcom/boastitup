import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('Debug: Testing database operations\n');

// Test 1: Simple select
console.log('1. Testing select...');
const { data: selectData, error: selectError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1);

if (selectError) {
    console.log('Select error:', selectError);
} else {
    console.log('✓ Select works, rows:', selectData?.length || 0);
}

// Test 2: Count
console.log('\n2. Testing count...');
const { count, error: countError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

if (countError) {
    console.log('Count error:', countError);
} else {
    console.log('✓ Count:', count);
}

// Test 3: Insert one simple review
console.log('\n3. Testing insert...');
const { data: insertData, error: insertError } = await supabase
    .from('reviews')
    .insert([{
        product_id: 'debug-test',
        product_name: 'Debug Test Product',
        product_url: 'https://test.com',
        rating: 5,
        review_text: 'Debug test review',
        customer_name: 'Debug User'
    }])
    .select();

if (insertError) {
    console.log('Insert error:', insertError);
    console.log('Error details:', JSON.stringify(insertError, null, 2));
} else {
    console.log('✓ Insert works, inserted ID:', insertData[0]?.id);
}
