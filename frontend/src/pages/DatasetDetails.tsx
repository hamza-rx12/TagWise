import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

type Dataset = {
    id: number;
    name: string;
    description: string;
    classes: string;
    filePath: string;
};

type Task = {
    id: number;
    text1: string;
    text2: string;
    annotation: string | null;
    completed: boolean;
};

type Annotator = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

function DatasetDetails() {
    const { id } = useParams<{ id: string }>();
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [annotators, setAnnotators] = useState<Annotator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [datasetRes, tasksRes, annotatorsRes] = await Promise.all([
                    authenticatedFetch(`http://localhost:8080/api/admin/datasets/${id}`),
                    authenticatedFetch(`http://localhost:8080/api/admin/datasets/${id}/tasks`),
                    authenticatedFetch(`http://localhost:8080/api/admin/datasets/${id}/annotators`),
                ]);

                if (!datasetRes.ok || !tasksRes.ok || !annotatorsRes.ok) {
                    throw new Error('Failed to fetch dataset details');
                }

                const datasetData = await datasetRes.json();
                const tasksData = await tasksRes.json();
                const annotatorsData = await annotatorsRes.json();

                setDataset(datasetData);
                setTasks(tasksData);
                setAnnotators(annotatorsData.map((da: any) => da.annotator));
            } catch (error) {
                console.error('Fetch dataset details error:', error);
                alert('Failed to load dataset details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleRemoveAnnotator = async (annotatorId: number) => {
        if (!window.confirm('Are you sure you want to remove this annotator?')) return;

        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/admin/annotators/remove/${id}/${annotatorId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove annotator');
            }

            setAnnotators(annotators.filter((a) => a.id !== annotatorId));
        } catch (error) {
            console.error('Remove annotator error:', error);
            alert('Failed to remove annotator');
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!dataset) {
        return <div className="text-center py-10">Dataset not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{dataset.name}</h1>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6">
                <p className="text-gray-600"><strong>Description:</strong> {dataset.description || 'No description'}</p>
                <p className="text-gray-600"><strong>Classes:</strong> {dataset.classes}</p>
                <p className="text-gray-600"><strong>File:</strong> {dataset.filePath}</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Text Pairs</h2>
            {tasks.length === 0 ? (
                <p className="text-gray-600">No text pairs available</p>
            ) : (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-700">
                                <th className="py-2">Text 1</th>
                                <th className="py-2">Text 2</th>
                                <th className="py-2">Annotation</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-t">
                                    <td className="py-2">{task.text1}</td>
                                    <td className="py-2">{task.text2}</td>
                                    <td className="py-2">{task.annotation || 'Not annotated'}</td>
                                    <td className="py-2">{task.completed ? 'Completed' : 'Pending'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assigned Annotators</h2>
            {annotators.length === 0 ? (
                <p className="text-gray-600">No annotators assigned</p>
            ) : (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-700">
                                <th className="py-2">Name</th>
                                <th className="py-2">Email</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {annotators.map((annotator) => (
                                <tr key={annotator.id} className="border-t">
                                    <td className="py-2">{annotator.firstName} {annotator.lastName}</td>
                                    <td className="py-2">{annotator.email}</td>
                                    <td className="py-2">
                                        <button
                                            onClick={() => handleRemoveAnnotator(annotator.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DatasetDetails;