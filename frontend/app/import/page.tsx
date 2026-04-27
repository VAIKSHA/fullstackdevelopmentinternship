'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import CSVImport from '@/components/CSVImport';
import Link from 'next/link';

export default function ImportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchTables();
    }
  }, [user, authLoading]);

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/api/config/tables');
      setTables(data.tables || []);
      if (data.tables?.length > 0) {
        setSelectedTable(data.tables[0]);
      }
    } catch (error) {
      console.error('Failed to load tables');
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
          <h1 className="text-2xl font-bold mb-6">Import CSV Data</h1>

          {tables.length === 0 ? (
            <div className="text-gray-600">
              No tables configured. Please load a configuration first.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>

              {selectedTable && (
                <CSVImport
                  table={selectedTable}
                  onComplete={() => {
                    alert('Import completed successfully!');
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
