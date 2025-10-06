import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const { data: products } = await supabase
    .from('brand_products')
    .select('id, name, sku');

console.log('\nAvailable Products:\n');
products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.sku})`);
    console.log(`   ID: ${p.id}\n`);
});
