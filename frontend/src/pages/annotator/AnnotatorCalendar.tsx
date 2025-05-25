// pages/annotator/AnnotatorCalendar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';

function AnnotatorCalendar() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  // Redirect if not authenticated or not an annotator
  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

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
        <div className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}>
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
          <div className="p-6">
            <h1 className="text-2xl font-bold">Annotator Calendar</h1>
            <p className="mt-2">View your task schedule and deadlines here.</p>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>
              <p className="text-gray-600">Your scheduled annotation tasks will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnotatorCalendar;