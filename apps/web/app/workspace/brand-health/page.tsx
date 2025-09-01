import { redirect } from 'next/navigation';

// Redirect to the dashboard page as per the updated file structure
export default function BrandHealthPage() {
  redirect('/workspace/brand-health/dashboard');
}