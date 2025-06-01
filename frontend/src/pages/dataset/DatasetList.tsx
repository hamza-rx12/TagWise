// pages/DatasetList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, Dataset as ApiDataset } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import DatasetCard from '../../components/DatasetCard';
import DatasetDetailsModal from '../../components/DatasetDetailsModal';
import DatasetAnnotatorsModal from '../../components/DatasetAnnotatorsModal';
import AssignAnnotatorsModal from '../../components/AssignAnnotatorsModal';
import Modal from '../../components/Modal';
import CreateDataset from './CreateDataset';
import * as React from "react";

type Annotator = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  role: string;
};

interface Dataset extends ApiDataset {
  description: string;
}

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
  const [showDatasetAnnotatorsModal, setShowDatasetAnnotatorsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [annotators, setAnnotators] = useState<Annotator[]>([]);
  const [datasetAnnotators, setDatasetAnnotators] = useState<Annotator[]>([]);
  const [isLoadingAnnotators, setIsLoadingAnnotators] = useState(false);
  const [isLoadingDatasetAnnotators, setIsLoadingDatasetAnnotators] = useState(false);

  useEffect(() => {
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
        setDatasets(data.map(dataset => ({
          ...dataset,
          description: dataset.description || ''
        })));
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
    setShowDatasetAnnotatorsModal(false);
    setShowCreateModal(false);
  };

  const handleCloseModal = () => {
    setSelectedDataset(null);
    setShowAssignModal(false);
    setShowDatasetAnnotatorsModal(false);
    setShowCreateModal(false);
  };

  const handleShowAssignModal = async (dataset: Dataset) => {
    try {
      setIsLoadingAnnotators(true);
      const data = await adminApi.getUnassignedAnnotators(dataset.id);
      setAnnotators(data.filter((user: Annotator) => user.enabled && user.role === 'ROLE_USER'));
    } catch (error) {
      console.error('Error fetching unassigned annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to load unassigned annotators',
        type: 'error'
      });
    } finally {
      setIsLoadingAnnotators(false);
      setSelectedDataset(dataset);
      setShowAssignModal(true);
    }
  };

  const handleShowDatasetAnnotators = async (dataset: Dataset) => {
    try {
      setIsLoadingDatasetAnnotators(true);
      const data = await adminApi.getDatasetAnnotators(dataset.id);
      setDatasetAnnotators(data);
      setSelectedDataset(dataset);
      setShowDatasetAnnotatorsModal(true);
    } catch (error) {
      console.error('Error fetching dataset annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to load dataset annotators',
        type: 'error'
      });
    } finally {
      setIsLoadingDatasetAnnotators(false);
    }
  };

  const handleAssignAnnotators = async (annotatorIds: number[]) => {
    if (!selectedDataset) return;

    try {
      await adminApi.assignAnnotators({
        datasetId: selectedDataset.id,
        annotatorIds
      });

      setNotification({
        message: 'Annotators assigned successfully',
        type: 'success'
      });

      setShowAssignModal(false);
      setSelectedDataset(null);

      const data = await adminApi.getDatasets();
      setDatasets(data.map(dataset => ({
        ...dataset,
        description: dataset.description || ''
      })));
    } catch (error) {
      console.error('Error assigning annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to assign annotators',
        type: 'error'
      });
    }
  };

  const handleRemoveAnnotators = async (annotatorIds: number[]) => {
    if (!selectedDataset) return;

    try {
      console.log(annotatorIds);
      await adminApi.removeAnnotators({
        datasetId: selectedDataset.id,
        annotatorIds
      });

      setNotification({
        message: 'Annotators removed successfully',
        type: 'success'
      });

      setShowDatasetAnnotatorsModal(false);
      setSelectedDataset(null);

      const data = await adminApi.getDatasets();
      setDatasets(data.map(dataset => ({
        ...dataset,
        description: dataset.description || ''
      })));
    } catch (error) {
      console.error('Error removing annotators:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to remove annotators',
        type: 'error'
      });
    }
  };

  const handleDatasetCreated = async () => {
    setShowCreateModal(false);
    try {
      const data = await adminApi.getDatasets();
      setDatasets(data.map(dataset => ({
        ...dataset,
        description: dataset.description || ''
      })));
      setNotification({
        message: 'Dataset created successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error refreshing datasets:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to refresh datasets',
        type: 'error'
      });
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
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  New Dataset
                </button>
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datasets.map((dataset, index) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onViewDetails={handleShowDetails}
                      onViewAnnotators={handleShowDatasetAnnotators}
                      onAssignAnnotators={handleShowAssignModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CreateDataset onSuccess={handleDatasetCreated} />
          </div>
        </Modal>
      )}

      {selectedDataset && !showAssignModal && !showDatasetAnnotatorsModal && !showCreateModal && (
        <DatasetDetailsModal
          dataset={selectedDataset}
          onClose={handleCloseModal}
        />
      )}

      {selectedDataset && showAssignModal && (
        <AssignAnnotatorsModal
          dataset={selectedDataset}
          annotators={annotators}
          isLoading={isLoadingAnnotators}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedDataset(null);
          }}
          onAssignAnnotators={handleAssignAnnotators}
        />
      )}

      {selectedDataset && showDatasetAnnotatorsModal && (
        <DatasetAnnotatorsModal
          dataset={selectedDataset}
          annotators={datasetAnnotators}
          isLoading={isLoadingDatasetAnnotators}
          onClose={() => {
            setShowDatasetAnnotatorsModal(false);
            setSelectedDataset(null);
          }}
          onRemoveAnnotators={handleRemoveAnnotators}
        />
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
