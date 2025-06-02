import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { adminApi } from '../../utils/api';

function AdvancedOptions() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [options, setOptions] = useState({
        annotatorRegistrationEnabled: false,
        annotatorLoginEnabled: false,
        annotatorProfileUpdateEnabled: false
    });
    const [searchQuery, setSearchQuery] = useState('');
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

    // Fetch options on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                const data = await adminApi.getAdvancedOptions();
                setOptions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching options:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    // Handle option changes
    const handleOptionChange = (key: keyof typeof options, value: boolean) => {
        setOptions(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle save
    const handleSave = async () => {
        try {
            setIsSaving(true);
            await adminApi.updateAdvancedOptions(options);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error('Error saving options:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Search:', searchQuery);
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
                    {/* Header with clean white design */}
                    <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold text-gray-900">Advanced Options</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="relative flex items-center">
                                        {/* ... existing code ... */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                <p className="text-gray-500 font-medium">Loading options...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500">
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {/* Option 1: Enable/Disable Annotator Registration */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Annotator Registration</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Control whether new annotators can register</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={options.annotatorRegistrationEnabled}
                                                        onChange={(e) => handleOptionChange('annotatorRegistrationEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                When enabled, new annotators can register through the registration page. When disabled, only administrators can create new annotator accounts.
                                            </p>
                                        </div>

                                        {/* Option 2: Enable/Disable Annotator Login */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Annotator Login</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Control whether annotators can log in</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={options.annotatorLoginEnabled}
                                                        onChange={(e) => handleOptionChange('annotatorLoginEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                When enabled, annotators can log in to the system. When disabled, annotators cannot access the system, even if they have valid credentials.
                                            </p>
                                        </div>

                                        {/* Option 3: Enable/Disable Annotator Profile Updates */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Profile Updates</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Control whether annotators can update their profiles</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={options.annotatorProfileUpdateEnabled}
                                                        onChange={(e) => handleOptionChange('annotatorProfileUpdateEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                When enabled, annotators can update their profile information. When disabled, only administrators can modify annotator profiles.
                                            </p>
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex justify-end mt-8">
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AdminSidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
            />

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

export default AdvancedOptions; 