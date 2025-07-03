// apps/web/components/AuthButton.tsx
'use client';

import { createClient } from '@boastitup/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChevronDown, LogOut } from 'lucide-react';

// Define types for our data structures
type Brand = {
  id: string;
  name: string;
};

type Profile = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export default function AuthButton() {
  const supabase = createClient();
  const router = useRouter();

  // State for user, profile, brands, and UI
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isBrandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function fetches all necessary user-related data
    const fetchUserData = async (currentUser: User) => {
      try {
        // Fetch user profile from the 'user_profiles' table
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', currentUser.id)
          .single();
        setProfile(profileData);

        // Fetch user's active tenant from 'user_tenant_roles'
        const { data: userTenantRole } = await supabase
          .from('user_tenant_roles')
          .select('tenant_id')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .single();

        if (userTenantRole) {
          // Fetch brand roles for the active tenant
          const { data: userBrandRoles } = await supabase
            .from('user_brand_roles')
            .select('brand_id')
            .eq('user_id', currentUser.id)
            .eq('tenant_id', userTenantRole.tenant_id)
            .eq('is_active', true);

          if (userBrandRoles && userBrandRoles.length > 0) {
            const brandIds = userBrandRoles.map(role => role.brand_id);
            // Fetch details for the assigned brands
            const { data: brandDetails } = await supabase
              .from('brands')
              .select('id, name')
              .in('id', brandIds);

            if (brandDetails) {
              setBrands(brandDetails);
              setSelectedBrand(brandDetails[0] || null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Set up a listener for authentication state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        await fetchUserData(currentUser);
      } else {
        // Clear all data on logout
        setProfile(null);
        setBrands([]);
        setSelectedBrand(null);
      }
      setLoading(false);
      router.refresh();
    });

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const displayName = profile?.first_name || user?.email;

  if (loading) {
    return <div className="text-sm text-gray-500 animate-pulse">Loading...</div>;
  }

  // Render a login button if the user is not authenticated
  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Login
      </button>
    );
  }

  // Render the brand switcher and user profile info if logged in
  return (
    <div className="flex items-center gap-4">
      {/* Brand Switcher Dropdown */}
      {brands.length > 0 && selectedBrand ? (
        <div className="relative">
          <button
            onClick={() => setBrandDropdownOpen(!isBrandDropdownOpen)}
            className="flex items-center p-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-sm">{selectedBrand.name}</span>
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBrandDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {brands.map((brand) => (
                  <a
                    key={brand.id}
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBrand(brand);
                      setBrandDropdownOpen(false);
                      // Here you might want to trigger a data refresh for the new brand
                    }}
                  >
                    {brand.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
         <div className="text-sm text-gray-500">No brand assigned</div>
      )}

      {/* User Info and Logout Button */}
      <span className="hidden text-sm text-gray-600 sm:inline">
        Hey, {displayName}
      </span>
      <button
        onClick={handleLogout}
        className="py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}