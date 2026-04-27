'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {config?.app?.name || 'Dynamic App Generator'}
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            {config?.app?.description || 'Build applications from JSON configurations'}
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{config?.app?.name || 'Dynamic App'}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to {config?.app?.name}</h2>
          <p className="text-gray-600 mb-6">{config?.app?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="p-6 border rounded-lg hover:shadow-lg transition"
            >
              <h3 className="font-bold mb-2">📊 Dashboard</h3>
              <p className="text-sm text-gray-600">View your data and analytics</p>
            </Link>

            <Link
              href="/import"
              className="p-6 border rounded-lg hover:shadow-lg transition"
            >
              <h3 className="font-bold mb-2">📁 Import CSV</h3>
              <p className="text-sm text-gray-600">Upload and import data</p>
            </Link>

            <Link
              href="/export"
              className="p-6 border rounded-lg hover:shadow-lg transition"
            >
              <h3 className="font-bold mb-2">🚀 Export to GitHub</h3>
              <p className="text-sm text-gray-600">Generate and push code</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
