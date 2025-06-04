import { useEffect, useState } from 'react';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';
import { useAuth } from '../../context/AuthContext';
import { annotatorApi, Task } from '../../utils/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AnnotateTaskModal from './AnnotateTaskModal';

export default function AnnotatorTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchParams] = useSearchParams();
    const datasetId = searchParams.get('datasetId');
    const navigate = useNavigate();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.id) {
                setLoading(false);
                setNotification({ message: 'User not authenticated', type: 'error' });
                return;
            }
            try {
                setLoading(true);
                setNotification(null);
                const data = await annotatorApi.getTasks();
                let tasksArray: Task[] = [];
                if (Array.isArray(data)) {
                    tasksArray = data;
                } else if (data && typeof data === 'object') {
                    tasksArray = [data];
                } else {
                    setTasks([]);
                    setNotification({
                        message: 'Unexpected API response format for tasks',
                        type: 'error'
                    });
                    setLoading(false);
                    return;
                }
                setTasks(tasksArray); // PAS de filtrage ici
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setNotification({
                    message: error instanceof Error ? error.message : 'Failed to load tasks',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user, datasetId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // La logique de recherche peut être implémentée ici
    };

    const getTaskStatus = (task: Task): string => {
        if (!user?.id) return 'pending';
        const isCompleted = task.completionStatus?.[user.id] || false;
        const hasAnnotations = task.annotations?.length > 0 || false;
        return isCompleted ? 'completed' : hasAnnotations ? 'in_progress' : 'pending';
    };
    const filteredTasks = tasks
        .filter(task => !datasetId || String(task.datasetId) === String(datasetId))
        .filter(task =>
            task.text1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.text2?.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
                    {notification && (
                        <div
                            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center ${notification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
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
                    <div className="p-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {datasetId ? `Tasks for Dataset ${datasetId}` : 'My Tasks'}
                                </h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        className="px-4 py-2 border rounded-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                                        onClick={() => window.location.reload()}
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                                </div>
                            ) : notification ? (
                                <div className="py-12 px-4 text-center">
                                    <p className="text-red-600">{notification.message}</p>
                                </div>
                            ) : filteredTasks.length === 0 ? (
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
                                    <h3 className="mt-2 text-xl font-medium text-gray-900">No tasks found</h3>
                                    <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                        {searchQuery
                                            ? `No results for "${searchQuery}"`
                                            : datasetId
                                                ? 'No tasks assigned for this dataset.'
                                                : 'You have no tasks assigned yet. Please contact your administrator.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Task #{task.id}
                                                    </h3>
                                                    {task.metadata?.datasetName && (
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            Dataset: {task.metadata.datasetName}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTaskStatus(task) === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : getTaskStatus(task) === 'in_progress'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {getTaskStatus(task).replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Text 1:</p>
                                                    <p className="text-gray-700">{task.text1 || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Text 2:</p>
                                                    <p className="text-gray-700">{task.text2 || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => setSelectedTask(task)}
                                                    className={`px-4 py-2 rounded-lg font-medium ${getTaskStatus(task) === 'completed'
                                                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                                        }`}
                                                >
                                                    {getTaskStatus(task) === 'completed' ? 'Edit Annotation' : 'Start Annotation'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedTask && (
                <AnnotateTaskModal
                    task={selectedTask}
                    userId={user.id}
                    onClose={() => setSelectedTask(null)}
                    onSave={() => {

                    }}
                />
            )}
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
}