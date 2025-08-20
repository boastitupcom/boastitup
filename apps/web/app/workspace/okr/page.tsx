import { createClient } from '@boastitup/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Plus, 
  Settings, 
  TrendingUp,
  Target,
  Calendar,
  Users
} from 'lucide-react';

import { OKRNavigation, OKRQuickActions } from '../../../components/OKRNavigation';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge
} from "@boastitup/ui";

export default async function OKRIndexPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get user's brand context
  const { data: brandUser } = await supabase
    .from('user_brand_roles')
    .select(`
      brand_id,
      role,
      brands!inner(
        id,
        name,
        industry_id,
        tenant_id,
        industries(
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!brandUser) {
    redirect('/workspace');
  }

  const brandId = brandUser.brand_id;
  const brandName = brandUser.brands.name;

  // Get OKR summary stats
  const { data: stats } = await supabase
    .from('okr_objectives')
    .select('is_active, granularity, created_at')
    .eq('brand_id', brandId);

  const totalOKRs = stats?.length || 0;
  const activeOKRs = stats?.filter(s => s.is_active === true).length || 0;
  const monthlyOKRs = stats?.filter(s => s.granularity === 'monthly').length || 0;
  const weeklyOKRs = stats?.filter(s => s.granularity === 'weekly').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">OKR Management</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Objectives and Key Results for {brandName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/workspace">
                <Users className="w-4 h-4 mr-2" />
                Back to Workspace
              </Link>
            </Button>
            <Button asChild>
              <Link href="/workspace/okr/create">
                <Plus className="w-4 h-4 mr-2" />
                Create OKRs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total OKRs</p>
                <p className="text-3xl font-bold">{totalOKRs}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active OKRs</p>
                <p className="text-3xl font-bold text-green-600">{activeOKRs}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly OKRs</p>
                <p className="text-3xl font-bold text-blue-600">{monthlyOKRs}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly OKRs</p>
                <p className="text-3xl font-bold text-purple-600">{weeklyOKRs}</p>
              </div>
              <Badge variant="secondary" className="h-8 w-8 flex items-center justify-center rounded-full p-0">
                W
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Dashboard Card */}
        <Link href="/workspace/okr/dashboard" className="block group">
          <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                  <CardDescription>
                    View performance metrics and insights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Track your OKR performance with real-time analytics, AI-powered insights, 
                  and comprehensive reporting.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Real-time Data</Badge>
                  <Badge variant="outline">AI Insights</Badge>
                  <Badge variant="outline">Charts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Create Card */}
        <Link href="/workspace/okr/create" className="block group">
          <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Create OKRs</CardTitle>
                  <CardDescription>
                    Build new objectives with AI templates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose from industry-specific templates, customize targets, 
                  and create multiple OKRs efficiently.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Templates</Badge>
                  <Badge variant="outline">Bulk Create</Badge>
                  <Badge variant="outline">Customizable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Manage Card */}
        <Link href="/workspace/okr/manage" className="block group">
          <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Manage OKRs</CardTitle>
                  <CardDescription>
                    Edit, organize, and track your objectives
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Complete CRUD operations with filtering, search, bulk actions, 
                  and individual OKR editing.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Edit</Badge>
                  <Badge variant="outline">Bulk Actions</Badge>
                  <Badge variant="outline">Filter & Search</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Getting Started Guide */}
      {totalOKRs === 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Get Started with OKRs
            </CardTitle>
            <CardDescription>
              You haven't created any OKRs yet. Here's how to get started:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Choose Templates</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse industry-specific OKR templates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Customize</h4>
                  <p className="text-sm text-muted-foreground">
                    Set targets, dates, and platforms
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Track Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor performance on the dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/workspace/okr/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First OKRs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Structure from story.txt lines 511-515 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <OKRNavigation variant="horizontal" className="mb-6" />
        
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <OKRQuickActions currentPage="overview" />
      </div>
    </div>
  );
}