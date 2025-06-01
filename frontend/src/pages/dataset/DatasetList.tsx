// pages/DatasetList.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, Dataset } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import Modal from '../../components/Modal';
import * as React from "react";

type Annotator = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  role: string;
};

export default function DatasetList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [annotators, setAnnotators] = useState<Annotator[]>([]);
  const [selectedAnnotator, setSelectedAnnotator] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingAnnotators, setIsLoadingAnnotators] = useState(false);
  const [selectedAnnotators, setSelectedAnnotators] = useState<string[]>([]);

  // Add filtered annotators computation
  const filteredAnnotators = annotators.filter(annotator => {
    const searchLower = searchQuery.toLowerCase();
    return (
      annotator.firstName.toLowerCase().includes(searchLower) ||
      annotator.lastName.toLowerCase().includes(searchLower) ||
      annotator.email.toLowerCase().includes(searchLower)
    );
  });

  // Update the select all checkbox to use filtered annotators
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnotators(filteredAnnotators.map(a => a.id.toString()));
    } else {
      setSelectedAnnotators([]);
    }
  };

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'ROLE_ADMIN') {
      setNotification({
        message: 'Access denied. Admin privileges required.',
        type: 'error'
      });
      navigate('/login');
      return;
    }

    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getDatasets();
        setDatasets(data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        setNotification({
          message: error instanceof Error ? error.message : 'Failed to load datasets',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleShowDetails = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowAssignModal(false);
  };

  const handleCloseModal = () => {
    setSelectedDataset(null);
    setShowAssignModal(false);
  };

  const handleShowAssignModal = async (dataset: Dataset) => {
    try {
      setIsLoadingAnnotators(true);
      const data = await adminApi.getAnnotators();
      setAnnotators(data.filter((user: Annotator) => user.enabled && user.role === 'ROLE_USER'));
    } catch (error) {
      console.error('Error fetching annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to load annotators',
        type: 'error'
      });
    } finally {
      setIsLoadingAnnotators(false);
      setSelectedDataset(dataset);
      setShowAssignModal(true);
    }
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAnnotator('');
    setSelectedDataset(null);
  };

  const handleAssignAnnotator = async () => {
    if (!selectedDataset || !selectedAnnotators.length) return;

    setIsAssigning(true);
    try {
      await adminApi.assignAnnotators({
        datasetId: selectedDataset.id,
        annotatorIds: selectedAnnotators.map(id => parseInt(id))
      });

      setNotification({
        message: 'Annotators assigned successfully',
        type: 'success'
      });

      handleCloseAssignModal();

      // Refresh the dataset list
      const data = await adminApi.getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Error assigning annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to assign annotators',
        type: 'error'
      });
    } finally {
      setIsAssigning(false);
    }
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
                    It looks like you haven't created any datasets yet. Get started by creating a new dataset.
                  </p>
                  <Link
                    to="/admin/datasets/create"
                    className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Dataset
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datasets.map((dataset, index) => (
                    <div
                      key={dataset.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">{dataset.name}</h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 rounded-full text-sm font-medium shadow-sm">
                          {dataset.completionPercentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${dataset.completionPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {dataset.completionPercentage.toFixed(1)}% complete
                        </p>
                      </div>

                      <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                        {dataset.description || 'No description available.'}
                      </p>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleShowDetails(dataset)}
                          className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                        <button
                          onClick={() => handleShowAssignModal(dataset)}
                          className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedDataset && !showAssignModal && (
        <Modal onClose={handleCloseModal}>
          <div className="p-8 max-w-5xl w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-3">{selectedDataset.name}</h2>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 rounded-full text-sm font-medium shadow-sm">
                  {selectedDataset.completionPercentage.toFixed(1)}% Complete
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {selectedDataset.description || 'No description available.'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${selectedDataset.completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedDataset.completionPercentage.toFixed(1)}% of the dataset has been annotated
                </p>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                >
                  Close
                </button>
                <Link
                  to={`/admin/datasets/${selectedDataset.id}/annotators`}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                  onClick={handleCloseModal}
                >
                  Manage Annotators
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {selectedDataset && showAssignModal && (
        <Modal onClose={handleCloseAssignModal}>
          <div className="p-8 w-full max-w-4xl bg-gradient-to-br from-white to-gray-50 rounded-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-3">Assign Annotators</h2>
              <p className="text-gray-600 text-lg">Assign annotators to {selectedDataset.name}</p>
            </div>

            <div className="space-y-6">
              {isLoadingAnnotators ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                  <p className="mt-6 text-gray-600 text-lg">Loading annotators...</p>
                </div>
              ) : annotators.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No annotators available</h3>
                  <p className="mt-2 text-gray-500 text-base">
                    There are no annotators available to assign to this dataset.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow">
                    <div className="flex-1 max-w-2xl">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search annotators by name or email..."
                          className="w-full px-5 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base shadow-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg
                          className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
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
                    </div>
                    <div className="flex items-center space-x-3 ml-6">
                      <label className="flex items-center space-x-3 text-base text-gray-600">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                          checked={selectedAnnotators.length === filteredAnnotators.length && filteredAnnotators.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="max-h-[600px] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {filteredAnnotators.map((annotator) => (
                          <div
                            key={annotator.id}
                            className="flex items-center px-6 py-4 hover:bg-gray-50/80 border border-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
                          >
                            <input
                              type="checkbox"
                              id={`annotator-${annotator.id}`}
                              className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                              checked={selectedAnnotators.includes(annotator.id.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAnnotators([...selectedAnnotators, annotator.id.toString()]);
                                } else {
                                  setSelectedAnnotators(selectedAnnotators.filter(id => id !== annotator.id.toString()));
                                }
                              }}
                            />
                            <label
                              htmlFor={`annotator-${annotator.id}`}
                              className="ml-4 flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-base font-medium text-gray-900">
                                    {annotator.firstName} {annotator.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-0.5">{annotator.email}</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 shadow-sm">
                                  {annotator.role}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseAssignModal}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAnnotator}
                  disabled={selectedAnnotators.length === 0 || isAssigning || annotators.length === 0 || isLoadingAnnotators}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 text-base font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isAssigning ? 'Assigning...' : `Assign ${selectedAnnotators.length} Annotator${selectedAnnotators.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
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
