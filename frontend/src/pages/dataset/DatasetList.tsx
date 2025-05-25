// pages/DatasetList.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';

type Dataset = {
  id: number;
  name: string;
  description?: string;
  completionPercentage: number;
};

export default function DatasetList() {
  // const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch('http://localhost:8080/api/admin/datasets/list');
        if (!response.ok) throw new Error('Failed to fetch datasets');
        const data = await response.json();
        setDatasets(data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        setNotification({ message: 'Failed to load datasets', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleGoBack = () => {
    navigate('/admin/dashboard'); // Navigate back to the dashboard
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="font-poppins antialiased">
      <div className="h-full w-screen flex flex-row">
        <AdminSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        <div
          className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'
            }`}
        >
          {notification && (
            <div
              className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                } transform transition-all duration-500 animate-slideIn`}
            >
              <span className="mr-2">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
              {notification.message}
            </div>
          )}
          <div className="p-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Datasets</h2>
                <Link
                  to="/admin/datasets/create"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  + New Dataset
                </Link>
              </div>

              {datasets.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                  <h3 className="mt-2 text-xl font-medium text-gray-900">No datasets found</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                    It looks like you haven’t created any datasets yet. Get started by creating a new dataset.
                  </p>
                  <Link
                    to="/admin/datasets/create"
                    className="mt-4 inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Create Dataset
                  </Link>
                </div>

              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {datasets.map((dataset, index) => (
                        <tr
                          key={dataset.id}
                          className="hover:bg-teal-50/50 transition-colors"
                          style={{ animationDelay: `${index * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dataset.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${dataset.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {dataset.completionPercentage.toFixed(1)}% complete
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <Link to={`/admin/datasets/${dataset.id}`} className="text-teal-600 hover:text-teal-800">
                              Details
                            </Link>
                            <Link
                              to={`/admin/datasets/${dataset.id}/annotators`}
                              className="text-teal-600 hover:text-teal-800"
                            >
                              Assign Annotators
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}