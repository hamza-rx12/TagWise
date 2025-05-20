// pages/Dashboard.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

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
        <div className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}>
          <div className="p-8">
            <button
              onClick={() => navigate('/admin/annotator-selection')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              Select Annotators
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;