// apps/web/components/Header.tsx
'use client';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { createClient } from '@boastitup/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useBrandStore } from '../store/brandStore'; // Import the store
import type { Brand } from '@boastitup/types';

interface HeaderProps {
  user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Use the brand store
  const { activeBrand, brands, setActiveBrand, setBrands } = useBrandStore();

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
          const { data: userBrands } = await supabase
            .from('user_brand_roles')
            .select('brand_id, brands!inner(id, name, tenant_id)')
            .eq('tenant_id', userTenant.tenant_id)
            .eq('user_id', user.id)
            .eq('is_active', true);

          if (userBrands) {
            const brandsData = userBrands.map(ub => ub.brands as Brand);
            setBrands(brandsData);
            if (brandsData.length > 0 && !activeBrand) {
              setActiveBrand(brandsData[0]);
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
  }, [user, supabase, setBrands, setActiveBrand, activeBrand]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleBrandSelect = (brand: Brand) => {
    setActiveBrand(brand);
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
          <span className="font-semibold text-gray-800">
            {activeBrand?.name || 'Select Brand...'}
          </span>
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
                      activeBrand?.id === brand.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">No brands available</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-800">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {showUserMenu && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {(showUserMenu || showBrandMenu) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowBrandMenu(false);
          }}
        />
      )}
    </header>
  );
}