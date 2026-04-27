'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface FormField {
  type: string;
  field: string;
  label?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export default function DynamicForm({ fields, onSubmit, initialData }: DynamicFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      ...register(field.field, { required: field.required }),
      className: 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
      disabled: loading
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'number':
        return <input type="number" {...commonProps} min={field.min} max={field.max} />;
      
      case 'date':
        return <input type="date" {...commonProps} />;
      
      case 'checkbox':
        return <input type="checkbox" {...register(field.field)} disabled={loading} className="w-4 h-4" />;
      
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
      )}
      
      {fields.map(field => (
        <div key={field.field}>
          <label className="block text-sm font-medium mb-1">
            {field.label || field.field}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
          {errors[field.field] && (
            <p className="text-red-500 text-sm mt-1">This field is required</p>
          )}
        </div>
      ))}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
