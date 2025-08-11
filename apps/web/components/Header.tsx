// apps/web/components/Header.tsx
'use client';
import { ChevronDown, User, LogOut, Settings, Bug, Users } from 'lucide-react';
import { createClient } from '@boastitup/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useBrandStore } from '../store/brandStore';
import { useIndustryStore } from '../store/industryStore';
import type { BrandWithTenant } from '@boastitup/types';

// Debug component (only shown in development)
const DebugPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const brandStore = useBrandStore();
  const industryStore = useIndustryStore();
  
  const brandDebug = brandStore.getDebugInfo();
  const industryDebug = industryStore.getDebugInfo();
  
  if (!isOpen || process.env.NODE_ENV === 'production') return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40" 
        onClick={onClose}
      />
      
      {/* Debug Panel */}
      <div className="fixed top-20 right-4 w-80 max-h-[80vh] bg-gray-900 text-white border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
          <h3 className="font-semibold text-green-400 text-sm">Debug Info</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-lg leading-none w-5 h-5 flex items-center justify-center"
            title="Close Debug Panel"
          >
            ×
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-3 overflow-y-auto max-h-[calc(80vh-60px)] text-xs space-y-3">
          {/* Brand Info */}
          <div>
            <h4 className="font-medium text-blue-300 mb-2 text-sm">Brand Store</h4>
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <div className="space-y-1">
                <div><span className="text-gray-400">Active Brand:</span> {brandDebug.activeBrand?.name || 'None'}</div>
                <div><span className="text-gray-400">Active Tenant:</span> {brandDebug.activeTenant?.name || 'None'}</div>
                <div><span className="text-gray-400">Total Brands:</span> {brandDebug.totalBrands}</div>
                <div><span className="text-gray-400">Total Tenants:</span> {brandDebug.totalTenants}</div>
                <div><span className="text-gray-400">Active Tenants:</span> [{brandDebug.activeTenants?.join(', ') || 'None'}]</div>
              </div>
              
              {Object.keys(brandDebug.brandsByTenant).length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <div className="text-gray-400 mb-1 font-medium">Brands by Tenant:</div>
                  <div className="space-y-1">
                    {Object.entries(brandDebug.brandsByTenant).map(([tenant, count]) => (
                      <div key={tenant} className="ml-2 text-xs">• <span className="text-blue-200">{tenant}</span>: {count}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Industry Info */}
          <div>
            <h4 className="font-medium text-purple-300 mb-2 text-sm">Industry Store</h4>
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <div className="space-y-1">
                <div><span className="text-gray-400">Active Industry:</span> {industryDebug.activeIndustry?.name || 'None'}</div>
                <div><span className="text-gray-400">Total Industries:</span> {industryDebug.totalIndustries}</div>
                <div><span className="text-gray-400">Mapped Brands:</span> {industryDebug.mappedBrands}</div>
              </div>
              
              {Object.keys(industryDebug.industryDistribution).length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <div className="text-gray-400 mb-1 font-medium">Industry Distribution:</div>
                  <div className="space-y-1">
                    {Object.entries(industryDebug.industryDistribution).map(([industry, count]) => (
                      <div key={industry} className="ml-2 text-xs">• <span className="text-purple-200">{industry}</span>: {count}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface HeaderProps {
  user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Use both brand and industry stores with enhanced multi-tenant support
  const { 
    activeBrand, 
    brands, 
    activeTenant,
    tenants,
    setBrands, 
    setTenants,
    setActiveTenant,
    setActiveTenants,
    handleBrandChange,
    getAllAccessibleBrands
  } = useBrandStore();
  const { activeIndustry, setBrandIndustryMapping } = useIndustryStore();

  useEffect(() => {
    const fetchUserTenantsAndBrands = async () => {
      if (!user) return;

      try {
        console.log('Fetching data for user:', user.id);
        
        // First, get all tenants for this user
        const { data: userTenants, error: tenantsError } = await supabase
          .from('user_tenant_roles')
          .select(`
            tenant_id,
            role,
            tenants!inner(id, name, slug)
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (tenantsError) {
          console.error('Error fetching user tenants:', tenantsError);
          return;
        }

        console.log('Found user tenants:', userTenants);

        if (userTenants && userTenants.length > 0) {
          const activeTenantIds = userTenants.map(ut => ut.tenant_id);
          setActiveTenants(activeTenantIds);
          
          // Build tenant structure with brands
          const tenantsWithBrands = await Promise.all(
            userTenants.map(async (userTenant) => {
              const tenantData = userTenant.tenants as any;
              console.log('Processing tenant:', tenantData.name);
              
              // Get brands for this tenant with proper joins
              const { data: userBrands, error: brandsError } = await supabase
                .from('user_brand_roles')
                .select(`
                  brand_id,
                  role,
                  brands!inner(
                    id, 
                    name, 
                    tenant_id, 
                    industry_id,
                    primary_domain,
                    tenants!inner(name, slug),
                    industries(name, slug)
                  )
                `)
                .eq('tenant_id', tenantData.id)
                .eq('user_id', user.id)
                .eq('is_active', true);

              if (brandsError) {
                console.error('Error fetching brands for tenant:', tenantData.id, brandsError);
                return {
                  id: tenantData.id,
                  name: tenantData.name,
                  slug: tenantData.slug,
                  brands: []
                };
              }

              console.log('Found brands for tenant', tenantData.name, ':', userBrands);

              const brandsData: BrandWithTenant[] = userBrands?.map(ub => {
                const brand = ub.brands as any;
                const tenant = brand.tenants;
                const industry = brand.industries;
                
                // Set up brand-industry mapping
                if (brand.industry_id && industry) {
                  setBrandIndustryMapping(brand.id, brand.industry_id);
                }
                
                return {
                  id: brand.id,
                  name: brand.name,
                  tenant_id: brand.tenant_id,
                  industry_id: brand.industry_id,
                  primary_domain: brand.primary_domain,
                  tenant_name: tenant.name,
                  tenant_slug: tenant.slug,
                  industry: industry?.name || 'Fitness & Nutrition',
                  industry_slug: industry?.slug
                } as BrandWithTenant;
              }) || [];

              return {
                id: tenantData.id,
                name: tenantData.name,
                slug: tenantData.slug,
                brands: brandsData
              };
            })
          );

          console.log('Built tenants with brands:', tenantsWithBrands);

          // Set tenants and flatten brands
          setTenants(tenantsWithBrands);
          const allBrands = tenantsWithBrands.flatMap(t => t.brands);
          setBrands(allBrands);
          
          console.log('All brands:', allBrands);
          
          // Set active tenant to first one if none selected
          if (!activeTenant && tenantsWithBrands.length > 0) {
            setActiveTenant(tenantsWithBrands[0]);
          }
          
          // Set active brand if none selected
          if (allBrands.length > 0 && !activeBrand) {
            handleBrandChange(allBrands[0]);
          }
        } else {
          console.log('No tenants found for user');
        }
      } catch (error) {
        console.error('Error fetching tenants and brands:', error);
      }
    };

    if (user) {
      fetchUserTenantsAndBrands();
    }
  }, [user, supabase, setBrands, setTenants, setActiveTenant, setActiveTenants, handleBrandChange, activeBrand, activeTenant, setBrandIndustryMapping]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleBrandSelect = (brand: BrandWithTenant) => {
    handleBrandChange(brand); // Use the enhanced method that updates industry too
    setShowBrandMenu(false);
    router.refresh(); 
  };

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Multi-Tenant Brand Selector */}
      <div className="flex items-center space-x-4">
        {/* Tenant Selector (if multiple tenants) */}
        {tenants.length > 1 && (
          <div className="relative">
            <button 
              onClick={() => setShowBrandMenu(!showBrandMenu)}
              className="flex items-center p-2 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              title="Switch Tenant"
            >
              <Users className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-700">
                {activeTenant?.name || 'Select Tenant'}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 text-blue-500" />
            </button>
          </div>
        )}
        
        {/* Brand Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowBrandMenu(!showBrandMenu)}
            className="flex items-center p-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <span className="font-semibold text-gray-800">
                  {activeBrand?.name || 'Select Brand...'}
                </span>
                {activeTenant && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {activeTenant.name}
                  </span>
                )}
              </div>
              {activeBrand?.industry && (
                <span className="text-xs text-gray-500">
                  {activeIndustry?.name || activeBrand.industry}
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
          </button>
          
          {showBrandMenu && (
            <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="max-h-96 overflow-y-auto">
                {tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <div key={tenant.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="p-2 bg-gray-50 font-medium text-sm text-gray-700 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {tenant.name} ({tenant.brands.length} brands)
                      </div>
                      <div className="p-2">
                        {tenant.brands.length > 0 ? (
                          tenant.brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleBrandSelect(brand)}
                              className={`w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors ${
                                activeBrand?.id === brand.id ? 'bg-blue-50 border border-blue-200' : ''
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{brand.name}</span>
                                {brand.industry && (
                                  <span className="text-xs text-gray-500">{brand.industry}</span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500 text-sm">
                            No brands in this tenant
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No tenants found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-2">
        {/* Debug Button (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="p-2 rounded-lg hover:bg-yellow-50 transition-colors border border-yellow-200"
            title="Debug Info"
          >
            <Bug className="w-4 h-4 text-yellow-600" />
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="ml-2 text-sm text-gray-700">
              {user?.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
          </button>
          
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-1">
                <button className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors flex items-center text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
      
      {/* Debug Panel - Outside header to prevent scroll issues */}
      <DebugPanel isOpen={showDebugPanel} onClose={() => setShowDebugPanel(false)} />
    </header>
  );
}