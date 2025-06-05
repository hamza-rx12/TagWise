import { useEffect, useState } from 'react';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';
import { useAuth } from '../../context/AuthContext';
import { annotatorApi, Task, adminApi } from '../../utils/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AnnotateTaskModal from './AnnotateTaskModal';
import Modal from '../../components/Modal';

type DatasetTasks = {
    id: number;
    name: string;
    tasks: Task[];
    totalTasks: number;
    completedTasks: number;
    currentTaskIndex: number;
};

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
    const [selectedDataset, setSelectedDataset] = useState<DatasetTasks | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isAnnotating, setIsAnnotating] = useState(false);

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
                setTasks(tasksArray);
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
    };

    const getTaskStatus = (task: Task): string => {
        if (!user?.id) return 'pending';
        const isCompleted = task.completionStatus?.[user.id] || false;
        const hasAnnotations = task.annotations?.length > 0 || false;
        return isCompleted ? 'completed' : hasAnnotations ? 'in_progress' : 'pending';
    };

    // Group tasks by dataset
    const datasetTasks = tasks.reduce((acc: DatasetTasks[], task) => {
        const datasetId = task.datasetId;
        const datasetName = task.metadata?.datasetName || `Dataset ${datasetId}`;
        const existingDataset = acc.find(d => d.id === datasetId);

        if (existingDataset) {
            // Check if task already exists to avoid duplicates
            if (!existingDataset.tasks.some(t => t.id === task.id)) {
                existingDataset.tasks.push(task);
                existingDataset.totalTasks = existingDataset.tasks.length;
                existingDataset.completedTasks = existingDataset.tasks.filter(t => getTaskStatus(t) === 'completed').length;
            }
        } else {
            acc.push({
                id: datasetId,
                name: datasetName,
                tasks: [task],
                totalTasks: 1,
                completedTasks: getTaskStatus(task) === 'completed' ? 1 : 0,
                currentTaskIndex: 0
            });
        }
        return acc;
    }, []);

    const filteredDatasets = datasetTasks.filter(dataset =>
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDatasetClick = async (dataset: DatasetTasks) => {
        try {
            // Fetch updated tasks to get latest annotations
            const data = await annotatorApi.getTasks();
            if (Array.isArray(data)) {
                setTasks(data);
                // Find tasks for this dataset
                const datasetTasks = data.filter(t => t.datasetId === dataset.id);

                // Find the first incomplete task or start from the beginning
                const firstIncompleteIndex = datasetTasks.findIndex(task => getTaskStatus(task) !== 'completed');
                const startIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;

                // Create a new dataset object with all required properties
                const updatedDataset: DatasetTasks = {
                    id: dataset.id,
                    name: dataset.name,
                    currentTaskIndex: startIndex,
                    tasks: datasetTasks,
                    totalTasks: datasetTasks.length,
                    completedTasks: datasetTasks.filter(t => getTaskStatus(t) === 'completed').length
                };

                setSelectedDataset(updatedDataset);
                setSelectedTask(datasetTasks[startIndex]);
                setSelectedClass(datasetTasks[startIndex].annotations?.[0] || null);
                setIsAnnotating(false);
            }
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    };

    const handleNextTask = async () => {
        if (!selectedDataset) return;

        const nextIndex = selectedDataset.currentTaskIndex + 1;
        if (nextIndex < selectedDataset.tasks.length) {
            const nextTask = selectedDataset.tasks[nextIndex];
            setSelectedDataset({
                ...selectedDataset,
                currentTaskIndex: nextIndex
            });
            setSelectedTask(nextTask);
            setSelectedClass(nextTask.annotations?.[0] || null);
        }
    };

    const handlePreviousTask = async () => {
        if (!selectedDataset) return;

        const prevIndex = selectedDataset.currentTaskIndex - 1;
        if (prevIndex >= 0) {
            const prevTask = selectedDataset.tasks[prevIndex];
            setSelectedDataset({
                ...selectedDataset,
                currentTaskIndex: prevIndex
            });
            setSelectedTask(prevTask);
            setSelectedClass(prevTask.annotations?.[0] || null);
        }
    };

    const handleTaskSave = async () => {
        if (!selectedDataset) return;

        try {
            const data = await annotatorApi.getTasks();
            if (Array.isArray(data)) {
                setTasks(data);

                // Update all datasets with the new task data
                const updatedDatasetTasks = data.reduce((acc: DatasetTasks[], task) => {
                    const datasetId = task.datasetId;
                    const datasetName = task.metadata?.datasetName || `Dataset ${datasetId}`;
                    const existingDataset = acc.find(d => d.id === datasetId);

                    if (existingDataset) {
                        // Check if task already exists to avoid duplicates
                        if (!existingDataset.tasks.some(t => t.id === task.id)) {
                            existingDataset.tasks.push(task);
                            existingDataset.totalTasks = existingDataset.tasks.length;
                            existingDataset.completedTasks = existingDataset.tasks.filter(t => getTaskStatus(t) === 'completed').length;
                        }
                    } else {
                        acc.push({
                            id: datasetId,
                            name: datasetName,
                            tasks: [task],
                            totalTasks: 1,
                            completedTasks: getTaskStatus(task) === 'completed' ? 1 : 0,
                            currentTaskIndex: 0
                        });
                    }
                    return acc;
                }, []);

                // Update the selected dataset if it exists
                if (selectedDataset) {
                    const updatedSelectedDataset = updatedDatasetTasks.find(d => d.id === selectedDataset.id);
                    if (updatedSelectedDataset) {
                        // Preserve the current task index
                        const currentTaskId = selectedDataset.tasks[selectedDataset.currentTaskIndex].id;
                        const newTaskIndex = updatedSelectedDataset.tasks.findIndex(t => t.id === currentTaskId);

                        setSelectedDataset({
                            ...updatedSelectedDataset,
                            currentTaskIndex: newTaskIndex >= 0 ? newTaskIndex : selectedDataset.currentTaskIndex,
                            tasks: updatedSelectedDataset.tasks
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    };

    const handleClassSelect = async (cls: string) => {
        if (!selectedDataset || !user?.id || saving) return;

        const trimmedClass = cls.trim();
        const currentTask = selectedDataset.tasks[selectedDataset.currentTaskIndex];

        // If the same class is already selected, do nothing
        if (currentTask.annotations?.[0] === trimmedClass) return;

        try {
            setSaving(true);

            // Update the task's annotation
            await annotatorApi.updateTaskAnnotation(
                currentTask.id,
                user.id,
                trimmedClass
            );

            // Create updated task with new annotation
            const updatedTask = {
                ...currentTask,
                annotations: [trimmedClass]
            };

            // Update the tasks array
            const updatedTasks = tasks.map(task =>
                task.id === currentTask.id ? updatedTask : task
            );
            setTasks(updatedTasks);

            // Update the selected dataset
            const updatedDatasetTasks = selectedDataset.tasks.map(task =>
                task.id === currentTask.id ? updatedTask : task
            );

            const updatedDataset = {
                ...selectedDataset,
                tasks: updatedDatasetTasks,
                completedTasks: updatedDatasetTasks.filter(t => getTaskStatus(t) === 'completed').length
            };

            // Update all state at once
            setSelectedDataset(updatedDataset);
            setSelectedTask(updatedTask);
            setSelectedClass(trimmedClass);

        } catch (error) {
            console.error('Error saving annotation:', error);
            setNotification({ message: 'Failed to save annotation', type: 'error' });
            // Revert to the original annotation on error
            setSelectedClass(currentTask.annotations?.[0] || null);
        } finally {
            setSaving(false);
        }
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
                <div
                    className={`flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-60' : 'ml-0 sm:ml-20'}`}
                >
                    {notification && notification.type === 'error' && (
                        <div
                            className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center bg-red-500 text-white transform transition-all duration-500 animate-slideIn"
                        >
                            <span className="mr-2">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                            {notification.message}
                        </div>
                    )}
                    <div className="p-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Search datasets..."
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
                            ) : filteredDatasets.length === 0 ? (
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
                                        {searchQuery
                                            ? `No results for "${searchQuery}"`
                                            : 'You have no tasks assigned yet. Please contact your administrator.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredDatasets.map((dataset) => (
                                        <div
                                            key={dataset.id}
                                            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                                            onClick={() => handleDatasetClick(dataset)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {dataset.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {dataset.completedTasks} of {dataset.totalTasks} tasks completed
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, (dataset.completedTasks / dataset.totalTasks) * 100)}%`,
                                                                minWidth: '0%',
                                                                maxWidth: '100%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                                        {Math.round((dataset.completedTasks / dataset.totalTasks) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dataset Tasks Modal */}
            {selectedDataset && (
                <Modal onClose={() => {
                    setSelectedDataset(null);
                    setSelectedTask(null);
                    setIsAnnotating(false);
                }}>
                    <div className="w-[900px] h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-white/50">
                        <div className="p-6 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedDataset.name}</h2>
                                    {isAnnotating && (
                                        <button
                                            onClick={() => setIsAnnotating(false)}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back to Dashboard
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 overflow-hidden">
                                {!isAnnotating ? (
                                    // Dashboard View
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 h-full flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Progress Card */}
                                                <div className="bg-gray-50/50 rounded-xl p-6">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress</h3>
                                                    <div className="flex items-center justify-center mb-4">
                                                        <div className="relative w-32 h-32">
                                                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                                                {/* Background circle */}
                                                                <circle
                                                                    className="text-gray-200"
                                                                    strokeWidth="8"
                                                                    stroke="currentColor"
                                                                    fill="transparent"
                                                                    r="40"
                                                                    cx="50"
                                                                    cy="50"
                                                                />
                                                                {/* Progress circle */}
                                                                <circle
                                                                    className="text-teal-500"
                                                                    strokeWidth="8"
                                                                    strokeDasharray={`${(selectedDataset.completedTasks / selectedDataset.totalTasks) * 251.2} 251.2`}
                                                                    strokeLinecap="round"
                                                                    stroke="currentColor"
                                                                    fill="transparent"
                                                                    r="40"
                                                                    cx="50"
                                                                    cy="50"
                                                                    transform="rotate(-90 50 50)"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <span className="text-2xl font-bold text-gray-800">
                                                                        {Math.round((selectedDataset.completedTasks / selectedDataset.totalTasks) * 100)}%
                                                                    </span>
                                                                    <p className="text-sm text-gray-500">Complete</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Completed Tasks</span>
                                                            <span className="font-medium text-gray-800">{selectedDataset.completedTasks} of {selectedDataset.totalTasks}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Remaining Tasks</span>
                                                            <span className="font-medium text-gray-800">{selectedDataset.totalTasks - selectedDataset.completedTasks}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats Card */}
                                                <div className="bg-gray-50/50 rounded-xl p-6">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">Total Tasks</span>
                                                            <span className="text-lg font-medium text-gray-800">{selectedDataset.totalTasks}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">Remaining Tasks</span>
                                                            <span className="text-lg font-medium text-gray-800">{selectedDataset.totalTasks - selectedDataset.completedTasks}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">Completion Rate</span>
                                                            <span className="text-lg font-medium text-gray-800">{Math.round((selectedDataset.completedTasks / selectedDataset.totalTasks) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dataset Classes Card */}
                                                <div className="col-span-2 bg-gray-50/50 rounded-xl p-6">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Dataset Classes</h3>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {selectedDataset.tasks[0]?.metadata?.datasetClasses?.split(';').map((cls: string) => {
                                                            const trimmedClass = cls.trim();
                                                            const classCount = selectedDataset.tasks.filter(task =>
                                                                task.annotations?.[0] === trimmedClass
                                                            ).length;
                                                            const percentage = Math.round((classCount / selectedDataset.totalTasks) * 100);

                                                            return (
                                                                <div key={trimmedClass} className="bg-white rounded-lg p-3 border border-gray-100">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm font-medium text-gray-700">{trimmedClass}</span>
                                                                        <span className="text-xs text-gray-500">{percentage}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                        <div
                                                                            className="bg-teal-500 h-1.5 rounded-full"
                                                                            style={{ width: `${percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        {classCount} tasks
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Start/Continue/Complete Button */}
                                            <div className="mt-8 flex justify-center">
                                                <button
                                                    onClick={() => setIsAnnotating(true)}
                                                    className={`px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-3 ${selectedDataset.completedTasks === selectedDataset.totalTasks
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : selectedDataset.completedTasks > 0
                                                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                                                            : 'bg-teal-500 text-white hover:bg-teal-600'
                                                        }`}
                                                >
                                                    {selectedDataset.completedTasks === selectedDataset.totalTasks ? (
                                                        <>
                                                            <span>Annotation Complete</span>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </>
                                                    ) : selectedDataset.completedTasks > 0 ? (
                                                        <>
                                                            <span>Continue Annotation</span>
                                                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                                                                {selectedDataset.completedTasks}/{selectedDataset.totalTasks}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Start Annotation</span>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Annotation View
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 h-full flex flex-col">
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="p-6 space-y-6">
                                                {/* Task Progress Indicator */}
                                                <div className="flex items-center justify-between bg-gray-50/50 rounded-lg p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                            <span className="text-teal-600 font-medium">
                                                                {selectedDataset.currentTaskIndex + 1}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-600">Current Task</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">Progress</span>
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(selectedDataset.completedTasks / selectedDataset.totalTasks) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {selectedDataset.completedTasks}/{selectedDataset.totalTasks}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Completion Message */}
                                                {selectedDataset.completedTasks === selectedDataset.totalTasks && (
                                                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-green-800 font-medium">Annotation Complete!</h4>
                                                            <p className="text-sm text-green-600">All tasks in this dataset have been annotated.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Task Content */}
                                                <div className="space-y-4">
                                                    <div className="flex gap-4 h-[200px]">
                                                        <div className="flex-1 flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                <p className="text-sm font-medium text-gray-500">Text 1</p>
                                                            </div>
                                                            <div className="bg-gray-50/50 rounded-lg p-3 flex-1 overflow-y-auto border border-gray-100">
                                                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedDataset.tasks[selectedDataset.currentTaskIndex].text1}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                                <p className="text-sm font-medium text-gray-500">Text 2</p>
                                                            </div>
                                                            <div className="bg-gray-50/50 rounded-lg p-3 flex-1 overflow-y-auto border border-gray-100">
                                                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedDataset.tasks[selectedDataset.currentTaskIndex].text2}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Class Selection */}
                                                <div className="bg-gray-50/30 rounded-xl p-4 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <p className="text-sm font-medium text-gray-500">Select a class</p>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {selectedDataset.tasks[selectedDataset.currentTaskIndex].metadata?.datasetClasses?.split(';').map((cls: string) => {
                                                            const trimmedClass = cls.trim();
                                                            const currentTask = selectedDataset.tasks[selectedDataset.currentTaskIndex];
                                                            const isSelected = currentTask.annotations?.[0] === trimmedClass;

                                                            return (
                                                                <button
                                                                    key={trimmedClass}
                                                                    onClick={() => handleClassSelect(trimmedClass)}
                                                                    disabled={saving}
                                                                    className={`py-2 px-3 rounded-lg text-center transition-all duration-200 text-sm ${isSelected
                                                                        ? 'bg-teal-500 text-white font-medium shadow-sm scale-[1.02] ring-1 ring-teal-200'
                                                                        : 'bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 hover:border-gray-200'
                                                                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {trimmedClass}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Footer */}
                                        <div className="border-t border-gray-100/50 p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                                            <button
                                                onClick={handlePreviousTask}
                                                disabled={selectedDataset.currentTaskIndex === 0}
                                                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${selectedDataset.currentTaskIndex === 0
                                                    ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </button>

                                            {/* Task Navigation */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Task</span>
                                                <select
                                                    value={selectedDataset.currentTaskIndex}
                                                    onChange={(e) => {
                                                        const index = parseInt(e.target.value);
                                                        setSelectedDataset({
                                                            ...selectedDataset,
                                                            currentTaskIndex: index
                                                        });
                                                        setSelectedTask(selectedDataset.tasks[index]);
                                                        setSelectedClass(selectedDataset.tasks[index].annotations?.[0] || null);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                >
                                                    {selectedDataset.tasks.map((task, index) => {
                                                        // Only show completed tasks and current task
                                                        if (task.annotations?.[0] || index === selectedDataset.currentTaskIndex) {
                                                            return (
                                                                <option
                                                                    key={index}
                                                                    value={index}
                                                                    className={task.annotations?.[0] ? 'text-teal-600' : 'text-gray-500'}
                                                                >
                                                                    {index + 1} {task.annotations?.[0] ? '✓' : ''}
                                                                </option>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </select>
                                                <span className="text-sm text-gray-500">of {selectedDataset.totalTasks}</span>
                                            </div>

                                            {selectedDataset.completedTasks === selectedDataset.totalTasks ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedDataset(null);
                                                        setSelectedTask(null);
                                                        setIsAnnotating(false);
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    Finish
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleNextTask}
                                                    disabled={selectedDataset.currentTaskIndex === selectedDataset.tasks.length - 1 ||
                                                        !selectedDataset.tasks[selectedDataset.currentTaskIndex].annotations?.[0]}
                                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${selectedDataset.currentTaskIndex === selectedDataset.tasks.length - 1 ||
                                                        !selectedDataset.tasks[selectedDataset.currentTaskIndex].annotations?.[0]
                                                        ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                                        }`}
                                                >
                                                    Next
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
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