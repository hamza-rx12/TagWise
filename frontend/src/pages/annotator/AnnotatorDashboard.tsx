import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';
import { Link } from 'react-router-dom';
import { annotatorApi, Task } from '../../utils/api';

type Stats = {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
};

type DatasetSummary = {
    id: string;
    name: string;
    taskCount: number;
    completedCount: number;
};

const AnnotatorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await annotatorApi.getTasks();

                // Toujours retourner un tableau
                let tasksData: Task[] = [];
                if (Array.isArray(data)) {
                    tasksData = data;
                } else if (data && typeof data === 'object') {
                    tasksData = [data];
                } else {
                    setDatasets([]);
                    setStats({
                        totalTasks: 0,
                        completedTasks: 0,
                        pendingTasks: 0,
                        inProgressTasks: 0,
                    });
                    setError('Unexpected API response format for tasks');
                    setLoading(false);
                    return;
                }

                if (!tasksData || tasksData.length === 0) {
                    setDatasets([]);
                    setStats({
                        totalTasks: 0,
                        completedTasks: 0,
                        pendingTasks: 0,
                        inProgressTasks: 0,
                    });
                    setLoading(false);
                    return;
                }

                // Group tasks by dataset
                const datasetMap = new Map<string, { count: number; completed: number; name: string }>();
                tasksData.forEach((task: Task) => {
                    const datasetId = task.datasetId;
                    const isCompleted = user ? (task.completionStatus[user.id] || false) : false;
                    const datasetName = task.metadata?.datasetName || `Dataset ${datasetId}`; // Fallback if datasetName is missing
                    if (!datasetMap.has(datasetId)) {
                        datasetMap.set(datasetId, { count: 0, completed: 0, name: datasetName });
                    }
                    const datasetStats = datasetMap.get(datasetId)!;
                    datasetStats.count += 1;
                    if (isCompleted) datasetStats.completed += 1;
                });

                const datasetSummaries = Array.from(datasetMap.entries()).map(([id, stats]) => ({
                    id,
                    name: stats.name,
                    taskCount: stats.count,
                    completedCount: stats.completed,
                }));

                console.log('Dataset summaries:', datasetSummaries); // Debug: Log the grouped datasets

                setDatasets(datasetSummaries);

                // Calculate overall stats
                const completed = tasksData.filter((task: Task) => task.completionStatus[user.id] || false).length;
                const pending = tasksData.filter((task: Task) => !task.completionStatus[user.id] && task.annotations.length === 0).length;
                const inProgress = tasksData.filter((task: Task) => !task.completionStatus[user.id] && task.annotations.length > 0).length;

                setStats({
                    totalTasks: tasksData.length,
                    completedTasks: completed,
                    pendingTasks: pending,
                    inProgressTasks: inProgress,
                });
            } catch (error) {
                console.error('Error:', error);
                setError(error instanceof Error ? error.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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
                    className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}
                >
                    {error && (
                        <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center bg-red-500 text-white transform transition-all duration-500 animate-slideIn">
                            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {error}
                        </div>
                    )}
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.firstName}!</h1>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
                                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Completed</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.completedTasks}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">In Progress</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.inProgressTasks}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">Pending</h2>
                                        <p className="text-2xl font-semibold text-gray-800">{stats.pendingTasks}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Datasets */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Assigned Datasets</h2>
                                <Link to="/annotator/tasks" className="text-teal-600 hover:text-teal-700 font-medium">
                                    View All Tasks
                                </Link>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                                </div>
                            ) : error ? (
                                <div className="py-12 px-4 text-center">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : datasets.length === 0 ? (
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
                                            d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17h6M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-xl font-medium text-gray-900">No datasets found</h3>
                                    <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                        You have no datasets assigned yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                                            {datasets.map((dataset, idx) => (
                                                <tr key={dataset.id} style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dataset.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{dataset.taskCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{dataset.completedCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            to={`/annotator/tasks?datasetId=${dataset.id}`}
                                                            className="text-teal-600 hover:text-teal-700 font-medium"
                                                        >
                                                            View Tasks
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link
                                    to="/annotator/tasks"
                                    className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-teal-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">View All Tasks</h3>
                                        <p className="text-sm text-gray-600">See all your assigned tasks</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/annotator/profile"
                                    className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Profile Settings</h3>
                                        <p className="text-sm text-gray-600">Update your profile information</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/annotator/reports"
                                    className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Reports</h3>
                                        <p className="text-sm text-gray-600">View your performance reports</p>
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
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AnnotatorDashboard;