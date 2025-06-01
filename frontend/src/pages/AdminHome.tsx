import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import * as React from "react";

function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated or not an admin
  if (!user || user.role !== 'ROLE_ADMIN') {
    navigate('/login');
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search:', searchQuery);
      // Implement search logic (e.g., API call)
    }
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
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700">Welcome to the admin dashboard. Select an option from the sidebar to manage your application.</p>
              {/* Add your dashboard content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
