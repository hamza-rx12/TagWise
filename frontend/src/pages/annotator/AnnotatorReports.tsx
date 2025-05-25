// pages/annotator/AnnotatorReports.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';

function AnnotatorReports() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Annotator Reports</h1>
            <p>View your performance reports and statistics here.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-3">Task Completion Rate</h2>
                <p className="text-gray-600">View your task completion statistics and performance metrics.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-3">Accuracy Metrics</h2>
                <p className="text-gray-600">Check your annotation accuracy and quality scores.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnotatorReports;
