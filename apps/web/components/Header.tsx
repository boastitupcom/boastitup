// apps/web/components/Header.tsx
'use client';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { createClient } from '@boastitup/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Logo/Brand */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900">BOAST IT UP</h1>
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