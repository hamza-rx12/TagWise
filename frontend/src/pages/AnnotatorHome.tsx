import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AnnotatorSidebar from '../components/AnnotatorSidebar';

const AnnotatorHome: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Optionally handle search logic here
    };
    console.log('user:', user);
    return (
        <div className="font-poppins antialiased">
            <div className="h-full w-screen flex flex-row">
                <AnnotatorSidebar
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
                    <div className="p-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.firstName}!</h2>
                            <p className="text-gray-600">
                                This is your Annotator dashboard. Use the sidebar to navigate your tasks, profile, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnotatorHome;