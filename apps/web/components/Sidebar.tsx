// apps/web/components/Sidebar.tsx
'use client';
import { Home, Settings, Users, BarChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/workspace', label: 'Dashboard', icon: Home },
  { href: '/workspace/projects', label: 'Projects', icon: BarChart },
  { href: '/workspace/team', label: 'Team', icon: Users },
  { href: '/workspace/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className="text-xl font-bold">BOAST IT UP</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}