'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function ExportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/api/config/export', {
        repoUrl: repoUrl || undefined,
        token: token || undefined
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Export to GitHub</h1>

          <p className="text-gray-600 mb-6">
            Generate a complete project structure and optionally push it to a GitHub repository.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
          )}

          {result && (
            <div className="bg-green-50 text-green-800 p-4 rounded mb-6">
              <h3 className="font-medium mb-2">Export Successful!</h3>
              <p className="text-sm">Project generated at: {result.path}</p>
            </div>
          )}

          <form onSubmit={handleExport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                GitHub Repository URL (optional)
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo.git"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to generate locally only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                GitHub Personal Access Token (optional)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required only if pushing to GitHub
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Project'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">What gets exported?</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Complete frontend (Next.js) structure</li>
              <li>Complete backend (Node.js/Express) structure</li>
              <li>Configuration files</li>
              <li>README with setup instructions</li>
              <li>Git repository initialized</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
