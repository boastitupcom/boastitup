#!/usr/bin/env node

/**
 * OKR Industry Mapping Validation Script
 * 
 * This script validates the consistency between:
 * - industries.slug values
 * - okr_master.industry values
 * 
 * It identifies mismatches and provides recommendations for data cleanup.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function validateIndustryMapping() {
  console.log('🔍 OKR Industry Mapping Validation');
  console.log('=====================================\n');

  try {
    // 1. Fetch all industries
    console.log('1️⃣ Fetching industries table...');
    const { data: industries, error: industriesError } = await supabase
      .from('industries')
      .select('id, name, slug')
      .order('name');

    if (industriesError) {
      throw new Error(`Failed to fetch industries: ${industriesError.message}`);
    }

    console.log(`✅ Found ${industries.length} industries`);
    console.log('Industries:');
    industries.forEach(industry => {
      console.log(`  - ${industry.name} (slug: ${industry.slug})`);
    });
    console.log();

    // 2. Fetch all OKR master templates
    console.log('2️⃣ Fetching okr_master table...');
    const { data: okrMaster, error: okrMasterError } = await supabase
      .from('okr_master')
      .select('id, industry, category, objective_title, is_active')
      .eq('is_active', true)
      .order('industry', { ascending: true })
      .order('category', { ascending: true });

    if (okrMasterError) {
      throw new Error(`Failed to fetch okr_master: ${okrMasterError.message}`);
    }

    console.log(`✅ Found ${okrMaster.length} active OKR templates`);
    console.log();

    // 3. Analyze industry values in okr_master
    console.log('3️⃣ Analyzing industry values in okr_master...');
    const okrIndustries = [...new Set(okrMaster.map(okr => okr.industry))].sort();
    const industrySlugSet = new Set(industries.map(i => i.slug));
    
    console.log(`🏭 Unique industries in okr_master (${okrIndustries.length}):`);
    okrIndustries.forEach(industry => {
      const templateCount = okrMaster.filter(okr => okr.industry === industry).length;
      const isValidSlug = industrySlugSet.has(industry);
      const status = isValidSlug ? '✅' : '❌';
      console.log(`  ${status} "${industry}" (${templateCount} templates) ${!isValidSlug ? '← NOT FOUND IN INDUSTRIES TABLE' : ''}`);
    });
    console.log();

    // 4. Find mismatches
    console.log('4️⃣ Identifying mismatches...');
    const mismatches = okrIndustries.filter(industry => !industrySlugSet.has(industry));
    const validMatches = okrIndustries.filter(industry => industrySlugSet.has(industry));

    if (mismatches.length === 0) {
      console.log('✅ All okr_master.industry values match industries.slug values!');
    } else {
      console.log(`❌ Found ${mismatches.length} mismatched industry values:`);
      mismatches.forEach(mismatch => {
        const affectedTemplates = okrMaster.filter(okr => okr.industry === mismatch);
        console.log(`\n  ❌ "${mismatch}" (${affectedTemplates.length} templates affected)`);
        console.log('     Affected templates:');
        affectedTemplates.slice(0, 3).forEach(template => {
          console.log(`       - ${template.objective_title}`);
        });
        if (affectedTemplates.length > 3) {
          console.log(`       ... and ${affectedTemplates.length - 3} more`);
        }
        
        // Suggest potential matches
        const suggestions = industries.filter(industry => 
          industry.name.toLowerCase().includes(mismatch.toLowerCase()) ||
          industry.slug.toLowerCase().includes(mismatch.toLowerCase()) ||
          mismatch.toLowerCase().includes(industry.slug.toLowerCase())
        );
        
        if (suggestions.length > 0) {
          console.log('     Potential matches:');
          suggestions.forEach(suggestion => {
            console.log(`       → ${suggestion.name} (slug: ${suggestion.slug})`);
          });
        }
      });
    }
    console.log();

    // 5. Generate mapping recommendations
    console.log('5️⃣ Mapping recommendations...');
    if (mismatches.length > 0) {
      console.log('\n📋 Recommended SQL updates:');
      console.log('-- Run these queries to fix industry slug mismatches\n');
      
      mismatches.forEach(mismatch => {
        const suggestions = industries.filter(industry => 
          industry.name.toLowerCase().includes(mismatch.toLowerCase()) ||
          industry.slug.toLowerCase().includes(mismatch.toLowerCase()) ||
          mismatch.toLowerCase().includes(industry.slug.toLowerCase())
        );
        
        if (suggestions.length > 0) {
          const bestMatch = suggestions[0];
          console.log(`-- Fix "${mismatch}" → "${bestMatch.slug}"`);
          console.log(`UPDATE okr_master SET industry = '${bestMatch.slug}' WHERE industry = '${mismatch}';`);
          console.log();
        } else {
          console.log(`-- No clear match found for "${mismatch}" - manual review needed`);
          console.log(`-- Consider adding new industry or mapping to existing one`);
          console.log();
        }
      });
    }

    // 6. Test template fetching
    console.log('6️⃣ Testing template fetching for each valid industry...');
    for (const industry of industries) {
      const templatesForIndustry = okrMaster.filter(okr => okr.industry === industry.slug);
      const status = templatesForIndustry.length > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${industry.name} (${industry.slug}): ${templatesForIndustry.length} templates`);
    }
    console.log();

    // 7. Summary
    console.log('📊 SUMMARY');
    console.log('===========');
    console.log(`Total industries: ${industries.length}`);
    console.log(`Total active OKR templates: ${okrMaster.length}`);
    console.log(`Valid industry mappings: ${validMatches.length}`);
    console.log(`Invalid industry mappings: ${mismatches.length}`);
    console.log(`Industries with templates: ${validMatches.length}`);
    console.log(`Industries without templates: ${industries.length - validMatches.length}`);
    
    if (mismatches.length === 0) {
      console.log('\n🎉 All industry mappings are valid! Templates should display correctly.');
    } else {
      console.log(`\n⚠️  ${mismatches.length} industry mapping issues found. Templates may not display for some industries.`);
      console.log('   Run the recommended SQL updates to fix these issues.');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  validateIndustryMapping()
    .then(() => {
      console.log('\n✅ Validation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateIndustryMapping };