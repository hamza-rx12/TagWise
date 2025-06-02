import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { annotatorApi, Annotator } from '../../utils/api';

function AnnotatorsManagement() {
  const { user, logout } = useAuth();
  const [annotators, setAnnotators] = useState<Annotator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  // State for selected annotator and popups
  const [selectedAnnotator, setSelectedAnnotator] = useState<Annotator | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Annotator>>({});

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [annotatorToDelete, setAnnotatorToDelete] = useState<Annotator | null>(null);

  // Add new state for bulk selection
  const [selectedAnnotators, setSelectedAnnotators] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Add state for bulk delete confirmation
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Check if sidebar state is saved in localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setIsSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Fetch all annotators on component mount
  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        setIsLoading(true);
        const data = await annotatorApi.getAllAnnotators();
        setAnnotators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching annotators:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotators();
  }, []);

  // Handle soft delete of annotator
  const handleSoftDelete = async (id: string) => {
    const annotator = annotators.find(a => a.id === id);
    if (!annotator) return;

    setAnnotatorToDelete(annotator);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const confirmDelete = async () => {
    if (!annotatorToDelete) return;

    try {
      await annotatorApi.deleteAnnotator(annotatorToDelete.id);
      // Remove the deleted annotator from the state
      setAnnotators(prev => prev.filter(annotator => annotator.id !== annotatorToDelete.id));
      // Show success notification
      showNotification('Annotator deleted successfully', 'success');
      // Close the delete modal
      setShowDeleteModal(false);
      setAnnotatorToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting annotator:', err);
      showNotification('Failed to delete annotator', 'error');
    }
  };

  // Handle edit action
  const handleEdit = (annotator: Annotator) => {
    setEditFormData(annotator);
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    try {
      await annotatorApi.updateAnnotator(editFormData.id, editFormData);
      // Update the annotators list
      setAnnotators(prev => prev.map(a =>
        a.id === editFormData.id ? { ...a, ...editFormData } : a
      ));
      setShowEditModal(false);
      showNotification('Annotator updated successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showNotification('Failed to update annotator', 'error');
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle annotator click to show details
  const handleAnnotatorClick = (annotator: Annotator) => {
    setSelectedAnnotator(annotator);
    setShowPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedAnnotator(null);
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Filter annotators based on search term
  const filteredAnnotators = annotators.filter(annotator =>
    annotator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annotator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annotator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle individual selection
  const handleSelectAnnotator = (id: string) => {
    setSelectedAnnotators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAnnotators(new Set());
    } else {
      setSelectedAnnotators(new Set(filteredAnnotators.map(a => a.id)));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  // Handle actual bulk deletion
  const confirmBulkDelete = async () => {
    if (selectedAnnotators.size === 0) return;

    try {
      // Delete all selected annotators
      await Promise.all(
        Array.from(selectedAnnotators).map(id => annotatorApi.deleteAnnotator(id))
      );

      // Update the annotators list
      setAnnotators(prev => prev.filter(a => !selectedAnnotators.has(a.id)));
      // Clear selection
      setSelectedAnnotators(new Set());
      setSelectAll(false);
      // Close the modal
      setShowBulkDeleteModal(false);
      // Show success notification
      showNotification(`${selectedAnnotators.size} annotator(s) deleted successfully`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showNotification('Failed to delete some annotators', 'error');
    }
  };

  return (
    <div className="font-poppins antialiased bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
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

        {/* Main Content */}
        <div className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}>
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

          {/* Header with clean white design */}
          <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Annotators Management
                  </h1>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search input with animation */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setExpanded((prev) => !prev)}
                      className="absolute left-3 text-gray-500 focus:outline-none hover:text-gray-700 transition-colors"
                    >
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
                    </button>

                    <input
                      type="text"
                      placeholder="Search annotators..."
                      className={`pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-teal-500 focus:border-transparent ${expanded ? "w-full md:w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
                        }`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedAnnotators.size > 0 && (
            <div className="bg-white shadow-sm border-b border-gray-100 sticky top-[73px] z-10">
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAnnotators.size} annotator(s) selected
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnnotators(new Set());
                      setSelectAll(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm animate-slideIn">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading annotators...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500">
                {filteredAnnotators.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No annotators found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm
                        ? `No annotators match your search "${searchTerm}". Try a different search term or clear the search.`
                        : "There are no annotators in the system yet. Add your first annotator to get started."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-teal-600 hover:text-teal-800 font-medium transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition-colors"
                              />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annotator
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAnnotators.map((annotator, index) => (
                          <tr
                            key={annotator.id}
                            className="hover:bg-gray-50 transition-colors"
                            style={{
                              animationDelay: `${index * 0.05}s`,
                              animation: 'fadeIn 0.5s ease-out forwards',
                              opacity: 0
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedAnnotators.has(annotator.id)}
                                  onChange={() => handleSelectAnnotator(annotator.id)}
                                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 whitespace-nowrap cursor-pointer"
                              onClick={() => handleAnnotatorClick(annotator)}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white font-medium shadow-sm">
                                    {getInitials(annotator.firstName, annotator.lastName)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {annotator.firstName} {annotator.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{annotator.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(annotator);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm"
                                >
                                  <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSoftDelete(annotator.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm"
                                >
                                  <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
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
            <AdminSidebar
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
            />
            {/* Pagination (if needed) */}
            {!isLoading && filteredAnnotators.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredAnnotators.length}</span> of{" "}
                  <span className="font-medium">{annotators.length}</span> annotators
                </p>

                {/* Pagination controls would go here if needed */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annotator Details Popup */}
      {showPopup && selectedAnnotator && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Semi-transparent backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-md"
            onClick={closePopup}
          ></div>

          {/* Popup content */}
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn z-10">
            {/* Close button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Annotator details */}
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl font-medium mb-4">
                {getInitials(selectedAnnotator.firstName, selectedAnnotator.lastName)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedAnnotator.firstName} {selectedAnnotator.lastName}
              </h2>
              <p className="text-gray-500">{selectedAnnotator.email}</p>
            </div>

            {/* Annotator details list */}
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-900 font-medium">{selectedAnnotator.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Gender</span>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${selectedAnnotator.gender === 'MALE' ? 'bg-blue-400' : 'bg-pink-400'}`}></span>
                  <span className="text-gray-900 font-medium">{selectedAnnotator.gender}</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Status</span>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedAnnotator.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {selectedAnnotator.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  closePopup();
                  handleEdit(selectedAnnotator);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  closePopup();
                  handleSoftDelete(selectedAnnotator.id);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={() => setShowEditModal(false)}></div>

          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn z-10">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Annotator</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={editFormData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="enabled"
                  value={editFormData.enabled?.toString() || ''}
                  onChange={(e) => handleInputChange({ target: { name: 'enabled', value: e.target.value === 'true' } } as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && annotatorToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>

          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn z-10">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Annotator</h2>
              <p className="text-gray-600">
                Are you sure you want to delete {annotatorToDelete.firstName} {annotatorToDelete.lastName}? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={() => setShowBulkDeleteModal(false)}></div>

          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn z-10">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Selected Annotators</h2>
              <p className="text-gray-600">
                Are you sure you want to delete {selectedAnnotators.size} selected annotator(s)? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
              >
                Delete {selectedAnnotators.size} Annotator(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}
      </style>
    </div>
  );
}

export default AnnotatorsManagement;
