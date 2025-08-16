// apps/web/app/workspace/layout.tsx
import { createSupabaseServerClient } from '@boastitup/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ResponsiveSidebar } from '@/components/navigation/ResponsiveNavigation';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <QueryProvider>
      <div className="flex h-screen bg-gray-50">
        <ResponsiveSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}