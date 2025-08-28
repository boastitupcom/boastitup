// Test the fixed template fetching with correct industry slug
const { createClient } = require('@boastitup/supabase/client');

async function testTemplateFix() {
  console.log('🧪 Testing Template Fetching Fix\n');

  const supabase = createClient();

  try {
    // Test the exact same query that useOKRTemplates hook uses
    console.log('1️⃣ Testing with industry slug "fitness" (the fix)...');
    
    const { data: templatesWithSlug, error: slugError } = await supabase
      .from('okr_master')
      .select(`
        id,
        industry,
        category,
        objective_title,
        objective_description,
        suggested_timeframe,
        priority_level,
        is_active,
        tags
      `)
      .eq('is_active', true)
      .eq('industry', 'fitness')  // Using slug as per fix
      .order('priority_level', { ascending: true })
      .order('category', { ascending: true });

    if (slugError) {
      console.error('❌ Query with slug failed:', slugError.message);
    } else {
      console.log(`✅ Found ${templatesWithSlug?.length || 0} templates with slug "fitness"`);
      if (templatesWithSlug && templatesWithSlug.length > 0) {
        console.log('📋 Templates found:');
        templatesWithSlug.forEach((template, index) => {
          console.log(`  ${index + 1}. ${template.objective_title}`);
          console.log(`     Category: ${template.category}`);
          console.log(`     Priority: ${template.priority_level}`);
        });
      }
    }
    console.log('');

    // Compare with old broken approach (using full name)
    console.log('2️⃣ Testing with full name "Fitness & Nutrition" (the old broken way)...');
    
    const { data: templatesWithName, error: nameError } = await supabase
      .from('okr_master')
      .select('id, objective_title, industry')
      .eq('is_active', true)
      .eq('industry', 'Fitness & Nutrition');  // Using full name (broken)

    if (nameError) {
      console.error('❌ Query with name failed:', nameError.message);
    } else {
      console.log(`✅ Found ${templatesWithName?.length || 0} templates with name "Fitness & Nutrition"`);
      console.log('   This should be 0, confirming the bug was real.');
    }
    console.log('');

    // Also test the metric loading part
    if (templatesWithSlug && templatesWithSlug.length > 0) {
      console.log('3️⃣ Testing metric types loading for templates...');
      const masterIds = templatesWithSlug.map(t => t.id);
      
      const { data: metricsData, error: metricsError } = await supabase
        .from('okr_master_metrics')
        .select(`
          okr_master_id,
          metric_type_id,
          is_primary,
          target_improvement_percentage,
          weight,
          dim_metric_type!inner (
            id,
            code,
            description,
            unit,
            category
          )
        `)
        .in('okr_master_id', masterIds);

      if (metricsError) {
        console.warn('⚠️  Metrics query failed:', metricsError.message);
      } else {
        console.log(`✅ Found ${metricsData?.length || 0} metric relationships`);
        if (metricsData && metricsData.length > 0) {
          const primaryMetrics = metricsData.filter(m => m.is_primary);
          console.log(`   ${primaryMetrics.length} primary metrics found`);
        }
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }

  console.log('\n🏁 Template fix test completed!');
  console.log('✨ If you see templates above with slug "fitness", the fix works!');
}

testTemplateFix().catch(console.error);