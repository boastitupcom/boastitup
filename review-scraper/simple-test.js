import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting simple test...');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

console.log('Supabase client created');

// Insert one test review
const testReview = {
    product_id: 'test-123',
    product_name: 'Test Product',
    product_url: 'https://test.com',
    rating: 5,
    review_text: 'This is a test review. Great product, very comfortable and good quality!',
    customer_name: 'Test User',
    review_date: '2025-01-15',
    verified_purchase: true,
    scraped_at: new Date().toISOString()
};

console.log('Inserting test review...');

const { data, error } = await supabase
    .from('reviews')
    .insert([testReview])
    .select();

if (error) {
    console.error('Error:', error);
} else {
    console.log('✓ Success! Review inserted:', data[0].id);
}

// Check count
const { count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

console.log(`Total reviews in database: ${count}`);
