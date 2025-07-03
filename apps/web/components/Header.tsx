// apps/web/components/Header.tsx
import { ChevronDown } from 'lucide-react';

export default function Header() {
  // In a real app, brands would be fetched dynamically
  const brands = ['One Science Nutrition | India'];
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <button className="flex items-center p-2 rounded-lg border">
          <span className="font-semibold">{brands[0]}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
      </div>
      <div className="flex items-center">
        {/* User Profile / Settings Icon */}
      </div>
    </header>
  );
}