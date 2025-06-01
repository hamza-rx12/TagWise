import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { useState, useEffect } from 'react';

type DatasetFormData = {
  name: string;
  classes: string;
  description?: string;
  file: FileList;
};

export default function CreateDataset() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<DatasetFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Watch for file changes
  const fileWatch = watch('file');
  const navigate = useNavigate();

  // Update selectedFileName when file changes
  useEffect(() => {
    if (fileWatch && fileWatch.length > 0) {
      setSelectedFileName(fileWatch[0].name);
    } else {
      setSelectedFileName(null);
    }
  }, [fileWatch]);

  const onSubmit = async (data: DatasetFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', data.file[0]);
      formData.append('name', data.name);
      formData.append('classes', data.classes);
      if (data.description) formData.append('description', data.description);

      const result = await adminApi.createDataset(formData);
      console.log(`dataset created with id ${result.id}!!!!!!`);
      // navigate(`/admin/datasets/${result.id}`);
      navigate(`/admin/datasets`);
    } catch (err) {
      console.error('Dataset creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create dataset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Dataset</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border-2 border-red-400 shadow-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV files only (Max 10MB)</p>
            <input
              type="file"
              {...register('file', {
                required: 'File is required',
                validate: {
                  fileSize: (files) =>
                    files[0]?.size <= 80 * 1024 * 1024 || 'Max file size is 10MB',
                  fileType: (files) =>
                    ['text/csv'].includes(files[0]?.type) ||
                    'Only CSV files allowed'
                }
              })}
              className="hidden"
              id="file-upload"
              accept=".csv"
            />
            <label
              htmlFor="file-upload"
              className="mt-3 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors"
            >
              Select File
            </label>
            {selectedFileName && (
              <p className="mt-2 text-sm text-teal-700">
                Selected file: <span className="font-semibold">{selectedFileName}</span>
              </p>
            )}
            {errors.file && (
              <p className="mt-2 text-red-500 text-sm">{errors.file.message}</p>
            )}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name*</label>
          <input
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters'
              }
            })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="Dataset Name"
          />
          {errors.name && (
            <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Classes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Classes (separated by semicolons)*</label>
          <input
            type="text"
            {...register('classes', {
              required: 'Classes are required',
              validate: (value) =>
                value.split(';').filter(Boolean).length >= 2 ||
                'At least 2 classes required'
            })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="positive;negative;neutral"
          />
          {errors.classes && (
            <p className="mt-1 text-red-500 text-sm">{errors.classes.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            These will be the available labels for annotators
          </p>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description', {
              maxLength: {
                value: 500,
                message: 'Description cannot exceed 500 characters'
              }
            })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            rows={3}
            placeholder="Brief description of the dataset purpose..."
          />
          {errors.description && (
            <p className="mt-1 text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
        >
          {isLoading ? 'Creating...' : 'Create Dataset'}
        </button>
      </form>
    </div>
  );
}
