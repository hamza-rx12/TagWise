// DatasetList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

type Dataset = {
  id: number;
  name: string;
  description?: string;
  completionPercentage: number;
};

export default function DatasetList() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await authenticatedFetch('/api/admin/datasets');
        const data = await response.json();
        setDatasets(data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Datasets</h2>
        <Link 
          to="/admin/datasets/create"
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          + New Dataset
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map((dataset) => (
              <tr key={dataset.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dataset.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-teal-600 h-2.5 rounded-full" 
                      style={{ width: `${dataset.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {dataset.completionPercentage.toFixed(1)}% complete
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <Link 
                    to={`/admin/datasets/${dataset.id}`}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    Details
                  </Link>
                  <button className="text-teal-600 hover:text-teal-800">
                    Assign Annotators
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
