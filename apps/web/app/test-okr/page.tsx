'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@boastitup/supabase/client';

export default function TestOKRPage() {
  const [result, setResult] = useState<string>('Loading...');
  const [industries, setIndustries] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    async function testDatabase() {
      const supabase = createClient();
      let output = '';

      try {
        output += '🔍 Testing OKR Templates Database...\n\n';

        // Test 1: Check industries
        output += '1️⃣ Testing industries table...\n';
        const { data: industriesData, error: industriesError } = await supabase
          .from('industries')
          .select('id, name, slug')
          .limit(10);

        if (industriesError) {
          output += `❌ Industries query failed: ${industriesError.message}\n\n`;
        } else {
          output += `✅ Found ${industriesData?.length || 0} industries\n`;
          setIndustries(industriesData || []);
          if (industriesData && industriesData.length > 0) {
            output += 'Industries:\n';
            industriesData.forEach(industry => {
              output += `  - ${industry.name} (slug: ${industry.slug})\n`;
            });
          }
          output += '\n';
        }

        // Test 2: Check okr_master
        output += '2️⃣ Testing okr_master table...\n';
        const { data: okrData, error: okrError } = await supabase
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
          .order('priority_level', { ascending: true })
          .limit(20);

        if (okrError) {
          output += `❌ OKR Master query failed: ${okrError.message}\n`;
          output += `Details: ${JSON.stringify(okrError, null, 2)}\n\n`;
        } else {
          output += `✅ Found ${okrData?.length || 0} active OKR templates\n`;
          setTemplates(okrData || []);
          
          if (okrData && okrData.length > 0) {
            output += 'Sample templates:\n';
            okrData.slice(0, 5).forEach((template, index) => {
              output += `  ${index + 1}. "${template.objective_title}"\n`;
              output += `     Industry: "${template.industry}"\n`;
              output += `     Category: ${template.category}\n`;
              output += `     Priority: ${template.priority_level}\n\n`;
            });

            // Get unique industries
            const uniqueIndustries = [...new Set(okrData.map((t: any) => t.industry))];
            output += '🏭 Industries in okr_master:\n';
            uniqueIndustries.forEach(industry => {
              const count = okrData.filter((t: any) => t.industry === industry).length;
              output += `  - "${industry}" (${count} templates)\n`;
            });
            output += '\n';

            // Test industry-specific query with first industry
            if (uniqueIndustries.length > 0) {
              const testIndustry = uniqueIndustries[0];
              output += `3️⃣ Testing filter for industry: "${testIndustry}"\n`;
              
              const { data: filteredData, error: filterError } = await supabase
                .from('okr_master')
                .select('id, objective_title, industry')
                .eq('industry', testIndustry)
                .eq('is_active', true);

              if (filterError) {
                output += `❌ Filter query failed: ${filterError.message}\n\n`;
              } else {
                output += `✅ Filter returned ${filteredData?.length || 0} templates for "${testIndustry}"\n`;
                if (filteredData && filteredData.length > 0) {
                  filteredData.forEach(template => {
                    output += `  - ${template.objective_title}\n`;
                  });
                }
                output += '\n';
              }
            }

            // Test cross-reference with industries table
            if (industries && industries.length > 0) {
              const industryFromTable = industries[0];
              output += `4️⃣ Testing with industry from industries table: "${industryFromTable.name}"\n`;
              
              const { data: crossData, error: crossError } = await supabase
                .from('okr_master')
                .select('id, objective_title, industry')
                .eq('industry', industryFromTable.name)
                .eq('is_active', true);

              if (crossError) {
                output += `❌ Cross-reference failed: ${crossError.message}\n\n`;
              } else {
                output += `✅ Cross-reference found ${crossData?.length || 0} templates\n`;
                if (crossData && crossData.length === 0) {
                  output += '⚠️  Industry names might not match between tables!\n';
                }
                output += '\n';
              }
            }

          } else {
            output += '⚠️  No active templates found in okr_master table!\n';
            output += '   The table might be empty or all templates are inactive.\n\n';

            // Check if table has any data at all
            const { data: allData, error: allError } = await supabase
              .from('okr_master')
              .select('id, is_active')
              .limit(1);

            if (allError) {
              output += `❌ Table existence check failed: ${allError.message}\n`;
            } else if (!allData || allData.length === 0) {
              output += '📋 okr_master table is completely empty\n';
            } else {
              output += '📋 okr_master table has data but no active templates\n';
            }
            output += '\n';
          }
        }

        output += '🏁 Test completed!';

      } catch (error) {
        output += `💥 Unexpected error: ${error}\n`;
      }

      setResult(output);
    }

    testDatabase();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">OKR Templates Database Test</h1>
      
      <div className="space-y-6">
        {/* Test Results */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border overflow-x-auto">
            {result}
          </pre>
        </div>

        {/* Industries Table */}
        {industries.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Industries Table ({industries.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              {industries.map((industry, index) => (
                <div key={industry.id} className="bg-white p-2 rounded border">
                  <strong>{industry.name}</strong>
                  <br />
                  <span className="text-gray-600">slug: {industry.slug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Table */}
        {templates.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">OKR Templates ({templates.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              {templates.map((template, index) => (
                <div key={template.id} className="bg-white p-3 rounded border">
                  <strong className="text-blue-700">{template.objective_title}</strong>
                  <br />
                  <span className="text-gray-600">Industry: {template.industry}</span>
                  <br />
                  <span className="text-gray-600">Category: {template.category}</span>
                  <br />
                  <span className="text-gray-600">Priority: {template.priority_level}</span>
                  {template.objective_description && (
                    <>
                      <br />
                      <span className="text-gray-500 text-xs">{template.objective_description}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}