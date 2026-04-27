'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface CSVImportProps {
  table: string;
  onComplete?: () => void;
}

export default function CSVImport({ table, onComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data } = await api.post('/api/csv/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setHeaders(data.headers);

      const { data: columnsData } = await api.get(`/api/csv/columns/${table}`);
      setTableColumns(columnsData.columns);

      const { data: mappingData } = await api.post('/api/csv/suggest-mapping', {
        csvHeaders: data.headers,
        table
      });
      setMapping(mappingData.mapping);

      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table', table);
      formData.append('mapping', JSON.stringify(mapping));

      const { data } = await api.post('/api/csv/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(data);
      setStep(3);
      onComplete?.();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">Select CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {loading && <p className="text-sm text-gray-500 mt-2">Parsing CSV...</p>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-medium mb-4">Map CSV Columns to Table Fields</h3>
          <div className="space-y-3">
            {headers.map(header => (
              <div key={header} className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-medium">{header}</div>
                <div className="w-1/3">→</div>
                <select
                  value={mapping[header] || ''}
                  onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                  className="w-1/3 px-3 py-2 border rounded"
                >
                  <option value="">Skip</option>
                  {tableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      )}

      {step === 3 && result && (
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-medium text-green-800 mb-2">Import Complete</h3>
          <p className="text-sm">Imported: {result.imported.length} rows</p>
          {result.errors.length > 0 && (
            <p className="text-sm text-red-600">Errors: {result.errors.length} rows</p>
          )}
        </div>
      )}
    </div>
  );
}
