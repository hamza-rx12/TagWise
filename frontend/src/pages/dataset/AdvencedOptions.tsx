// pages/admin/AdvancedOptions.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';

// Define the Dataset type based on your API response
type Dataset = {
  id: number;
  name: string;
  description: string;
  classes: string;
  completionPercentage: number;
};

// Define the DatasetDetails type
type DatasetDetails = {
  id: number;
  name: string;
  description: string;
  classes: string;
  completionPercentage: number;
  totalPairs: number;
  samplePairs: {
    id: number;
    text1: string;
    text2: string;
  }[];
  assignedAnnotators: {
    id: string;
    name: string;
    completedTasks: number;
  }[];
};

function AdvancedOptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSearchInput, setShowSearchInput] = useState(false);

  
  // Selected dataset for modals
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedDatasetDetails, setSelectedDatasetDetails] = useState<DatasetDetails | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showSpammersModal, setShowSpammersModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch all datasets on component mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setIsLoading(true);
        // Using your existing API endpoint
        const response = await authenticatedFetch('http://localhost:8080/api/admin/datasets/list');

        if (!response.ok) {
          throw new Error('Failed to fetch datasets');
        }

        const data = await response.json();
        setDatasets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching datasets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  // Fetch dataset details when a dataset is selected
  const fetchDatasetDetails = async (datasetId: number) => {
    try {
      setIsLoadingDetails(true);
      const response = await authenticatedFetch(`http://localhost:8080/api/admin/datasets/${datasetId}/details`);

      if (!response.ok) {
        throw new Error('Failed to fetch dataset details');
      }

      const data = await response.json();
      setSelectedDatasetDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching dataset details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter datasets based on search query if needed
  };

  // Show metrics modal
  const handleShowMetrics = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowMetricsModal(true);
    await fetchDatasetDetails(dataset.id);
  };

  // Show spammers modal
  const handleShowSpammers = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowSpammersModal(true);
    await fetchDatasetDetails(dataset.id);
  };

  // Close modals
  const closeModals = () => {
    setShowMetricsModal(false);
    setShowSpammersModal(false);
    setSelectedDataset(null);
    setSelectedDatasetDetails(null);
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Filter datasets based on search term
  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.id.toString().includes(searchQuery)
  );

  return (
    <div className="font-poppins antialiased">
      <div className="h-full w-screen flex flex-row">
        {/* Mobile Menu Button - Only visible on small screens */}
        <button
          className="p-2 border-2 bg-white rounded-md border-gray-200 shadow-lg text-gray-500 focus:bg-teal-500 focus:outline-none focus:text-white absolute top-0 left-0 sm:hidden z-20"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-5 h-5 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Sidebar */}
        <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        />

        {/* Main Content */}
        <div className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}>
          {/* Notification */}
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

          {/* Header with glass effect */}
          <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                </div>

<div className="flex items-center space-x-4">
  <div className="relative">
    {!showSearchInput ? (
      <button
        onClick={() => setShowSearchInput(true)}
        className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    ) : (
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search datasets..."
          className="pl-10 pr-10 py-2 rounded-full border border-gray-300 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full md:w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => setShowSearchInput(false)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    )}
  </div>
</div>


              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-2xl overflow-hidden">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading datasets...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500">
                {filteredDatasets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                    <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No datasets found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchQuery ?
                        `No datasets match your search "${searchQuery}". Try a different search term or clear the search.` :
                        "There are no datasets in the system yet. Add your first dataset to get started."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Dataset ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Database Name
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDatasets.map((dataset, index) => (
                          <tr
                            key={dataset.id}
                            className="hover:bg-gray-50 transition-colors"
                            style={{
                              animationDelay: `${index * 0.05}s`,
                              animation: 'fadeIn 0.5s ease-out forwards',
                              opacity: 0
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">#{dataset.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{dataset.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Completion: {dataset.completionPercentage.toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => handleShowMetrics(dataset)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  Show Metrics
                                </button>
                                <button
                                  onClick={() => handleShowSpammers(dataset)}
                                  className="text-amber-600 hover:text-amber-900 transition-colors bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  Spammers
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Pagination (if needed) */}
            {!isLoading && filteredDatasets.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredDatasets.length}</span> of{" "}
                  <span className="font-medium">{datasets.length}</span> datasets
                </p>

                {/* Pagination controls would go here if needed */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Modal */}
      {showMetricsModal && selectedDataset && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Semi-transparent backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black/10 backdrop-blur-md"
            onClick={closeModals}
          ></div>
          
          {/* Modal content */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-4 relative animate-fadeIn z-10 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button 
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Modal header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Dataset Metrics: {selectedDataset.name}
              </h2>
              <p className="text-gray-500 mt-1">ID: #{selectedDataset.id}</p>
            </div>
            
            {isLoadingDetails ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mb-4"></div>
                <p className="text-gray-500">Loading dataset details...</p>
              </div>
            ) : selectedDatasetDetails ? (
              <>
                {/* Metrics content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Completion Rate</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                        <div 
                          className="bg-teal-500 h-4 rounded-full" 
                          style={{ width: `${selectedDatasetDetails.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedDatasetDetails.completionPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Classes</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDatasetDetails.classes.split(';').map((cls, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-sm text-gray-700">
                      {selectedDatasetDetails.description || "No description available."}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Pairs</h3>
                    <p className="text-2xl font-bold text-teal-600">
                      {selectedDatasetDetails.totalPairs}
                    </p>
                  </div>
                </div>
                
                {/* Sample pairs */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Text Pairs</h3>
                  <div className="space-y-3">
                    {selectedDatasetDetails.samplePairs.map((pair) => (
                      <div key={pair.id} className="bg-white p-3 rounded border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Text 1</p>
                            <p className="text-sm text-gray-800">{pair.text1}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Text 2</p>
                            <p className="text-sm text-gray-800">{pair.text2}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Assigned annotators */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Annotators</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annotator
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed Tasks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedDatasetDetails.assignedAnnotators.map((annotator) => (
                          <tr key={annotator.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{annotator.name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">{annotator.completedTasks}</div>
                            </td>
                          </tr>
                        ))}
                        {selectedDatasetDetails.assignedAnnotators.length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                              No annotators assigned to this dataset
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeModals}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Export metrics functionality would go here
                      showNotification('Metrics exported successfully', 'success');
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Metrics
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No details available</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Could not load details for this dataset. Please try again later.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spammers Modal */}
      {showSpammersModal && selectedDataset && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Semi-transparent backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black/10 backdrop-blur-md"
            onClick={closeModals}
          ></div>
          
          {/* Modal content */}
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative animate-fadeIn z-10">
            {/* Close button */}
            <button 
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Modal header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Potential Spammers: {selectedDataset.name}
              </h2>
              <p className="text-gray-500 mt-1">ID: #{selectedDataset.id}</p>
            </div>
            
            {isLoadingDetails ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mb-4"></div>
                <p className="text-gray-500">Loading dataset details...</p>
              </div>
            ) : selectedDatasetDetails ? (
              <>
                {/* Spammers content */}
                <div className="mb-6">
                  <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="h-6 w-6 text-amber-500 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium">Spammer Detection</p>
                        <p className="text-sm mt-1">
                          The system can identify potential spammers based on annotation patterns, speed, and consistency.
                          Use the button below to run the detection algorithm.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Annotators table with potential spammer indicators */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annotator
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed Tasks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Indicators
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedDatasetDetails.assignedAnnotators.map((annotator, index) => {
                          // For demo purposes, we'll randomly assign risk levels
                          // In a real app, this would be calculated based on actual data
                          const riskLevel = ['Low', 'Medium', 'High'][index % 3];
                          const riskColor = {
                            'Low': 'bg-yellow-500',
                            'Medium': 'bg-amber-500',
                            'High': 'bg-red-500'
                          }[riskLevel];
                          const riskWidth = {
                            'Low': '35%',
                            'Medium': '60%',
                            'High': '85%'
                          }[riskLevel];
                          const riskReason = {
                            'Low': 'Repetitive annotation patterns',
                            'Medium': 'Unusually fast annotation speed',
                            'High': 'Inconsistent labeling patterns'
                          }[riskLevel];
                          
                          // Get initials for avatar
                          const nameParts = annotator.name.split(' ');
                          const initials = nameParts.length > 1 
                            ? `${nameParts[0][0]}${nameParts[1][0]}`
                            : nameParts[0].substring(0, 2);
                            
                          return (
                            <tr key={annotator.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className={`h-10 w-10 rounded-full ${riskColor} flex items-center justify-center text-white font-medium`}>
                                      {initials}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{annotator.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{annotator.completedTasks}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">{riskLevel}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div className={`${riskColor} h-2 rounded-full`} style={{ width: riskWidth }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{riskReason}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">Review</button>
                                <button className="text-red-600 hover:text-red-900">Suspend</button>
                              </td>
                            </tr>
                          );
                        })}
                        {selectedDatasetDetails.assignedAnnotators.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No annotators assigned to this dataset
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      // Functionality to run spammer detection algorithm
                      showNotification('Spammer detection algorithm running...', 'success');
                      closeModals();
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Run Detection
                  </button>
                  
                  <div>
                    <button
                      onClick={closeModals}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors mr-3"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Export report functionality
                        showNotification('Spammer report exported successfully', 'success');
                      }}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors flex items-center inline-flex"
                    >
                      <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export Report
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No details available</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Could not load details for this dataset. Please try again later.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
}

export default AdvancedOptions;
