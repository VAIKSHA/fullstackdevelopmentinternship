'use client';

import { useState, useEffect } from 'react';
import DynamicForm from './DynamicForm';
import DynamicTable from './DynamicTable';
import api from '@/lib/api';

interface PageConfig {
  path: string;
  title: string;
  type: string;
  dataSource?: string;
  components?: any[];
  auth?: boolean;
}

interface DynamicPageProps {
  config: PageConfig;
}

export default function DynamicPage({ config }: DynamicPageProps) {
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    await api.post(`/api/${config.dataSource}`, data);
    alert('Saved successfully!');
  };

  const renderComponent = (component: any, index: number) => {
    switch (component.type) {
      case 'table':
        return (
          <DynamicTable
            key={index}
            dataSource={config.dataSource || ''}
            columns={component.columns || []}
          />
        );

      case 'form':
        return (
          <DynamicForm
            key={index}
            fields={config.components || []}
            onSubmit={handleFormSubmit}
          />
        );

      case 'stats':
        return (
          <div key={index} className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        );

      default:
        return <div key={index}>Unknown component: {component.type}</div>;
    }
  };

  if (config.type === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
        <DynamicForm
          fields={config.components || []}
          onSubmit={handleFormSubmit}
        />
      </div>
    );
  }

  if (config.type === 'table') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
        <DynamicTable
          dataSource={config.dataSource || ''}
          columns={config.components?.[0]?.columns || []}
        />
      </div>
    );
  }

  if (config.type === 'dashboard') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
        <div className="space-y-6">
          {config.components?.map((comp, idx) => renderComponent(comp, idx))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
      <div className="space-y-6">
        {config.components?.map((comp, idx) => renderComponent(comp, idx))}
      </div>
    </div>
  );
}
