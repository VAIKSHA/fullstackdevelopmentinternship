'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DynamicPage from '@/components/DynamicPage';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchConfig();
    }
  }, [user, authLoading]);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/api/config/current');
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const dashboardPage = config?.ui?.pages?.find((p: any) => p.type === 'dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            {config?.app?.name || 'Dynamic App'}
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/import" className="text-gray-700 hover:text-blue-600">
              Import
            </Link>
            <Link href="/export" className="text-gray-700 hover:text-blue-600">
              Export
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {dashboardPage ? (
          <DynamicPage config={dashboardPage} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-600">No dashboard configuration found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
