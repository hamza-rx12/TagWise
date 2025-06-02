// pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Link, useNavigate } from 'react-router-dom';
import * as React from "react";
import { adminApi } from '../../utils/api';

// Example types
type Annotator = {
    name: string;
    email: string;
    completedTasks: number;
};

type Dataset = {
    name: string;
    classes: string;
    taskCount: number;
};

type Stats = {
    totalAnnotators: number;
    totalDatasets: number;
    totalTasks: number;
    completedTasks: number;
};

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentAnnotators, setRecentAnnotators] = useState<Annotator[]>([]);
    const [recentDatasets, setRecentDatasets] = useState<Dataset[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalAnnotators: 0,
        totalDatasets: 0,
        totalTasks: 0,
        completedTasks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated or not an admin
        if (!user || user.role !== 'ROLE_ADMIN') {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch real data from API
                const [annotatorCount, datasetCount, taskCount, completedTaskCount, recentDatasetsData, recentAnnotatorsData] = await Promise.all([
                    adminApi.getAnnotatorCount(),
                    adminApi.getDatasetCount(),
                    adminApi.getTaskCount(),
                    adminApi.getCompletedTaskCount(),
                    adminApi.getRecentDatasets(),
                    adminApi.getRecentAnnotators()
                ]);

                console.log('API Responses:', {
                    annotatorCount,
                    datasetCount,
                    taskCount,
                    completedTaskCount,
                    recentDatasetsData,
                    recentAnnotatorsData
                });

                // Update stats with real data
                const newStats = {
                    totalAnnotators: annotatorCount,
                    totalDatasets: datasetCount,
                    totalTasks: taskCount,
                    completedTasks: completedTaskCount
                };

                console.log('New Stats:', newStats);
                setStats(newStats);

                // Set recent datasets from API
                setRecentDatasets(recentDatasetsData);

                // Set recent annotators from API
                setRecentAnnotators(recentAnnotatorsData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement search functionality if needed
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading dashboard...</div>
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
                    className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}
                >
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Total Annotators</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.totalAnnotators}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Total Datasets</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.totalDatasets}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Total Tasks</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.totalTasks}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Completed Tasks</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.completedTasks}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Recent Annotators */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Recent Annotators</h2>
                                    <Link to="/admin/annotators-management" className="text-teal-600 hover:text-teal-700 font-medium">
                                        View All
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                                    </div>
                                ) : recentAnnotators.length === 0 ? (
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
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-xl font-medium text-gray-900">No annotators found</h3>
                                        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                            You haven't added any annotators yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                                                {recentAnnotators.map((annotator, idx) => (
                                                    <tr key={annotator.email} style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{annotator.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{annotator.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {annotator.completedTasks} tasks
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Recent Datasets */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Recent Datasets</h2>
                                    <Link to="/admin/datasets" className="text-teal-600 hover:text-teal-700 font-medium">
                                        View All
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                                    </div>
                                ) : recentDatasets.length === 0 ? (
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
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-xl font-medium text-gray-900">No datasets found</h3>
                                        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                            You haven't created any datasets yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                                                {recentDatasets.map((dataset, idx) => (
                                                    <tr key={dataset.name} style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dataset.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                            <div className="flex flex-wrap gap-2">
                                                                {dataset.classes.split(';').map((cls, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                                                                    >
                                                                        {cls.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {dataset.taskCount} tasks
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    to="/admin/annotators-management"
                                    className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-teal-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Manage Annotators</h3>
                                        <p className="text-sm text-gray-600">Add, edit, or remove annotators</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/datasets/create"
                                    className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Create Dataset</h3>
                                        <p className="text-sm text-gray-600">Upload and create a new dataset</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/reports"
                                    className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">View Reports</h3>
                                        <p className="text-sm text-gray-600">See system-wide analytics</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/messages"
                                    className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Messages</h3>
                                        <p className="text-sm text-gray-600">Manage communications</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;