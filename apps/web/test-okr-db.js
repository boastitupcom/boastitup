// Test OKR database from Next.js environment
const { createClient } = require('@boastitup/supabase/client');

async function testOKRDatabase() {
  console.log('🔍 Testing OKR Templates Database...\n');

  // Create Supabase client
  const supabase = createClient();

  try {
    // Test 1: Check connection with industries
    console.log('1️⃣ Testing database connection...');
    const { data: industries, error: industriesError } = await supabase
      .from('industries')
      .select('id, name, slug')
      .limit(5);

    if (industriesError) {
      console.error('❌ Database connection failed:', industriesError.message);
      return;
    }

    console.log('✅ Database connected successfully');
    console.log(`📊 Found ${industries?.length || 0} industries`);
    
    if (industries && industries.length > 0) {
      console.log('📋 Industries:');
      industries.forEach(industry => {
        console.log(`  - ${industry.name} (slug: ${industry.slug})`);
      });
    }
    console.log('');

    // Test 2: Check okr_master table
    console.log('2️⃣ Checking okr_master table...');
    const { data: okrTemplates, error: templatesError } = await supabase
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
      .limit(20);

    if (templatesError) {
      console.error('❌ okr_master query failed:', templatesError.message);
      console.error('Details:', templatesError);
      return;
    }

    console.log(`📊 Found ${okrTemplates?.length || 0} active OKR templates`);

    if (okrTemplates && okrTemplates.length > 0) {
      console.log('📋 Template samples:');
      okrTemplates.slice(0, 5).forEach((template, index) => {
        console.log(`  ${index + 1}. "${template.objective_title}"`);
        console.log(`     Industry: ${template.industry}`);
        console.log(`     Category: ${template.category}`);
        console.log(`     Priority: ${template.priority_level}`);
        console.log('');
      });

      // Get unique industries
      const uniqueIndustries = [...new Set(okrTemplates.map(t => t.industry))];
      console.log('🏭 Industries in okr_master:');
      uniqueIndustries.forEach(industry => {
        const count = okrTemplates.filter(t => t.industry === industry).length;
        console.log(`  - "${industry}" (${count} templates)`);
      });
      console.log('');

      // Test industry-specific query
      if (uniqueIndustries.length > 0) {
        const testIndustry = uniqueIndustries[0];
        console.log(`3️⃣ Testing industry filter for: "${testIndustry}"`);
        
        const { data: filteredTemplates, error: filterError } = await supabase
          .from('okr_master')
          .select('id, objective_title, industry')
          .eq('industry', testIndustry)
          .eq('is_active', true);

        if (filterError) {
          console.error('❌ Industry filter failed:', filterError.message);
        } else {
          console.log(`✅ Industry filter returned ${filteredTemplates?.length || 0} templates`);
          if (filteredTemplates && filteredTemplates.length > 0) {
            filteredTemplates.forEach(template => {
              console.log(`  - ${template.objective_title}`);
            });
          }
        }
        console.log('');
      }

      // Test with a common industry name that might be in both tables
      if (industries && industries.length > 0) {
        const industryToTest = industries[0];
        console.log(`4️⃣ Testing cross-table lookup with industry: "${industryToTest.name}"`);
        
        const { data: crossTemplates, error: crossError } = await supabase
          .from('okr_master')
          .select('id, objective_title, industry')
          .eq('industry', industryToTest.name)
          .eq('is_active', true);

        if (crossError) {
          console.error('❌ Cross-table query failed:', crossError.message);
        } else {
          console.log(`✅ Cross-table query found ${crossTemplates?.length || 0} templates for "${industryToTest.name}"`);
          if (crossTemplates && crossTemplates.length === 0) {
            console.log('⚠️  This suggests industry names in industries table don\'t match okr_master.industry values');
          }
        }
        console.log('');
      }

    } else {
      console.log('⚠️  No templates found in okr_master table!');
      console.log('   This means the table is likely empty or all templates are inactive.\n');
      
      // Check if table exists but is empty
      const { data: allTemplates, error: allError } = await supabase
        .from('okr_master')
        .select('id, is_active')
        .limit(1);
      
      if (allError) {
        console.error('❌ Table might not exist:', allError.message);
      } else if (!allTemplates || allTemplates.length === 0) {
        console.log('📋 okr_master table is completely empty');
      } else {
        console.log('📋 okr_master table has data but no active templates');
      }
    }

    // Test 5: Check metric relationships
    console.log('5️⃣ Checking okr_master_metrics...');
    const { data: metrics, error: metricsError } = await supabase
      .from('okr_master_metrics')
      .select('okr_master_id, metric_type_id, is_primary')
      .limit(5);

    if (metricsError) {
      console.error('❌ okr_master_metrics query failed:', metricsError.message);
    } else {
      console.log(`📊 Found ${metrics?.length || 0} metric relationships`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testOKRDatabase().catch(console.error);