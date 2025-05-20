import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Define the Annotator type
type Annotator = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  enabled: boolean;
  deleted: boolean;
};

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
        const response = await authenticatedFetch('http://localhost:8080/api/v1/annotators');

        if (!response.ok) {
          throw new Error('Failed to fetch annotators');
        }

        const data = await response.json();
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
    if (!window.confirm('Are you sure you want to delete this annotator?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/v1/annotators/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete annotator');
      }

      // Remove the deleted annotator from the state
      setAnnotators(annotators.filter(annotator => annotator.id !== id));

      // Show success notification
      showNotification('Annotator deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting annotator:', err);
      showNotification('Failed to delete annotator', 'error');
    }
  };

  // Handle edit action
  const handleEdit = (annotator: Annotator) => {
    // Store the annotator data in sessionStorage to access it in the edit form
    sessionStorage.setItem('editAnnotator', JSON.stringify(annotator));
    navigate('/admin/edit-annotator');
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

  // Filter annotators based on search term
  const filteredAnnotators = annotators.filter(annotator =>
    annotator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annotator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    annotator.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div
          className={`bg-white h-screen shadow-xl px-3 transition-all duration-300 ease-in-out fixed ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } sm:translate-x-0 z-10 ${isSidebarOpen ? 'w-60' : 'w-20'
            }`}
        >
          <div className={`space-y-6 mt-10 ${isSidebarOpen ? 'md:space-y-10' : 'md:space-y-16'}`}>
            {/* Logo */}
            <div className="flex justify-between items-center">
              {isSidebarOpen ? (
                <h1 className="font-bold text-sm md:text-xl text-center w-full">
                  TagWise<span className="text-teal-600">.</span>
                </h1>
              ) : (
                <h1 className="font-bold text-2xl text-center w-full">
                  T<span className="text-teal-600">.</span>
                </h1>
              )}
            </div>

            {/* Toggle Button - Visible on all screens */}
            <button
              onClick={toggleSidebar}
              className="absolute right-0 top-20 bg-teal-500 text-white p-1 rounded-l-md transform translate-x-full"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* User Profile */}
            {user && (
              <div className="space-y-3">
                <img
                  src="https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                  alt="Avatar de l'utilisateur"
                  className={`${isSidebarOpen ? 'w-10 md:w-16' : 'w-10'} rounded-full mx-auto`}
                />
                {isSidebarOpen && (
                  <div>
                    <h2 className="font-medium text-xs md:text-sm text-center text-teal-500">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-xs text-gray-500 text-center">Administrator</p>
                  </div>
                )}
              </div>
            )}

            {/* Search Bar - Only show when sidebar is open */}
            {isSidebarOpen && (
              <div className="flex border-2 border-gray-200 rounded-md focus-within:ring-2 ring-teal-500">
                <input
                  type="text"
                  className="w-full rounded-tl-md rounded-bl-md px-2 py-3 text-sm text-gray-600 focus:outline-none"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button type="submit" className="rounded-tr-md rounded-br-md px-2 py-3 hidden md:block" aria-label="Submit search">
                  <svg className="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Navigation Menu */}
            <div className="flex flex-col space-y-2">
              <Link
                to="/admin/dashboard"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:text-base rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {isSidebarOpen && <span className="ml-2">Dashboard</span>}
              </Link>
              <Link
                to="/admin/datasets"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                {isSidebarOpen && <span className="ml-2">Datasets</span>}
              </Link>
              <Link
                to="/admin/reports"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                {isSidebarOpen && <span className="ml-2">Reports</span>}
              </Link>
              <Link
                to="/admin/annotators-management"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} bg-teal-500 text-white rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {isSidebarOpen && <span className="ml-2">Annotators Management</span>}
              </Link>
              <Link
                to="/admin/messages"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                {isSidebarOpen && <span className="ml-2">Messages</span>}
              </Link>
              <Link
                to="/admin/calendar"
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {isSidebarOpen && <span className="ml-2">Calendar</span>}
              </Link>
              <button
                onClick={logout}
                className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2 text-left' : 'px-0 justify-center'} hover:bg-red-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center w-full`}
                aria-label="Logout"
              >
                <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                    clipRule="evenodd"
                  />
                </svg>
                {isSidebarOpen && <span className="ml-2">Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'
          }`}>
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
                  {/* <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                    Annotators Management
                  </h1> */}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search input */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setExpanded((prev) => !prev)}
                      className="absolute left-3 text-gray-500 focus:outline-none"
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
                      className={`pl-10 pr-4 py-2 rounded-full border border-gray-300 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-teal-500 focus:border-transparent ${expanded ? "w-full md:w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
                        }`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-5xl mx-auto px-6 py-8">
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
                <p className="text-gray-500 font-medium">Loading annotators...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500">
                {filteredAnnotators.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                    <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No annotators found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm ?
                        `No annotators match your search "${searchTerm}". Try a different search term or clear the search.` :
                        "There are no annotators in the system yet. Add your first annotator to get started."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
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
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            First Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Last Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{annotator.firstName}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{annotator.lastName}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{annotator.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${annotator.gender === 'MALE' ? 'bg-blue-400' : 'bg-pink-400'
                                  }`}></span>
                                <span className="text-sm text-gray-500">{annotator.gender}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${annotator.enabled
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {annotator.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => handleEdit(annotator)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleSoftDelete(annotator.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Add CSS for animations */}
      <style jsx>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}
      </style>
    </div>
  );
}

export default AnnotatorsManagement;