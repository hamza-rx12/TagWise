import { useEffect, useState } from 'react';
import AnnotatorSidebar from '../../components/AnnotatorSidebar.tsx';
import * as React from "react";
import { annotatorApi, Task } from '../../utils/api';

export default function AnnotatorTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const data = await annotatorApi.getTasks();
                setTasks(data);
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
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Optionally filter tasks here or trigger a backend search
    };

    // Filter tasks by search query
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'
                        }`}
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
                                <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
                            </div>
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
                                            : 'You have no tasks assigned.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                                            {filteredTasks.map((task, idx) => (
                                                <tr key={task.id} style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{task.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{task.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'completed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : task.status === 'in_progress'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                        >
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
}
