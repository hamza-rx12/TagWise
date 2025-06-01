// pages/admin/AdminReports.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';

function AdminReports() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      {/* Main Content Area */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-8 space-y-8">
          <h1 className="text-2xl font-bold mb-6">Reports Dashboard</h1>

          {/* General Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Total Datasets</h2>
              <p className="text-3xl font-bold text-teal-600">12</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Total Pairs</h2>
              <p className="text-3xl font-bold text-indigo-600">24,500</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Active Annotators</h2>
              <p className="text-3xl font-bold text-amber-600">7</p>
            </div>
          </div>

          {/* Top Annotators */}
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Top Annotators</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annotator</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">John Doe</td>
                    <td className="px-4 py-3 whitespace-nowrap">2400</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Jane Smith</td>
                    <td className="px-4 py-3 whitespace-nowrap">1800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Reports */}
          <div className="mt-6">
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200">
              Export Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
