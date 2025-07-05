// apps/web/components/Header.tsx
'use client';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { createClient } from '@boastitup/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useBrandStore } from '../store/brandStore';
import { useIndustryStore } from '../store/industryStore';
import type { Brand } from '@boastitup/types';

interface HeaderProps {
  user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Use both brand and industry stores
  const { activeBrand, brands, setBrands, handleBrandChange } = useBrandStore();
  const { activeIndustry, setActiveIndustry } = useIndustryStore();

  useEffect(() => {
    const fetchUserBrands = async () => {
      if (!user) return;

      try {
        const { data: userTenant } = await supabase
          .from('user_tenant_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (userTenant?.tenant_id) {
          // Updated query to include industry information
          const { data: userBrands } = await supabase
            .from('user_brand_roles')
            .select(`
              brand_id, 
              brands!inner(
                id, 
                name, 
                tenant_id, 
                industry_id,
                industry:industries(name, slug)
              )
            `)
            .eq('tenant_id', userTenant.tenant_id)
            .eq('user_id', user.id)
            .eq('is_active', true);

          if (userBrands) {
            const brandsData = userBrands.map(ub => {
              const brand = ub.brands as any;
              return {
                ...brand,
                industry: brand.industry?.name || 'fitness' // Default to fitness if no industry
              } as Brand;
            });
            
            setBrands(brandsData);
            
            if (brandsData.length > 0 && !activeBrand) {
              handleBrandChange(brandsData[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    if (user) {
      fetchUserBrands();
    }
  }, [user, supabase, setBrands, handleBrandChange, activeBrand]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleBrandSelect = (brand: Brand) => {
    handleBrandChange(brand); // Use the enhanced method that updates industry too
    setShowBrandMenu(false);
    router.refresh(); 
  };

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Brand Selector */}
      <div className="relative">
        <button 
          onClick={() => setShowBrandMenu(!showBrandMenu)}
          className="flex items-center p-2 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold text-gray-800">
              {activeBrand?.name || 'Select Brand...'}
            </span>
            {activeBrand?.industry && (
              <span className="text-xs text-gray-500">
                {activeIndustry?.name || activeBrand.industry}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
        </button>
        
        {showBrandMenu && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {brands.length > 0 ? (
                brands.map((brand) => (
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
                <div className="p-4 text-center text-gray-500">
                  No brands found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
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
    </header>
  );
}