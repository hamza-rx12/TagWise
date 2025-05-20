// DatasetDetailsView.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authenticatedFetch } from '../../utils/api';

type TextPair = {
    id: number;
    text1: string;
    text2: string;
};

type Annotator = {
    id: number;
    name: string;
    completedTasks: number;
};

type DatasetDetails = {
    id: number;
    name: string;
    description?: string;
    classes: string;
    completionPercentage: number;
    totalPairs: number;
    samplePairs: TextPair[];
    assignedAnnotators: Annotator[];
};

export default function DatasetDetailsView() {
    const { datasetId } = useParams<{ datasetId: string }>();
    const [dataset, setDataset] = useState<DatasetDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatasetDetails = async () => {
            try {
                const response = await authenticatedFetch(`/api/admin/datasets/${datasetId}`);
                const data = await response.json();
                setDataset(data);
            } catch (error) {
                console.error('Error fetching dataset details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatasetDetails();
    }, [datasetId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!dataset) {
        return <div className="text-center py-10">Dataset non trouvé</div>;
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{dataset.name}</h2>
                {dataset.description && (
                    <p className="text-gray-600 mt-2">{dataset.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistiques</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-600">Taille : </span>
                            <span className="font-medium">{dataset.totalPairs} couples</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Avancement : </span>
                            <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div
                                        className="bg-teal-600 h-2.5 rounded-full"
                                        style={{ width: `${dataset.completionPercentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium">
                                    {Math.round(dataset.completionPercentage)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Classes : </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {dataset.classes.split(';').map((cls, index) => (
                                    <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                                        {cls.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Exemples de couples</h3>
                    <div className="space-y-3">
                        {dataset.samplePairs.map((pair) => (
                            <div key={pair.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium">ID: {pair.id}</p>
                                <p className="text-sm text-gray-600">Text1: {pair.text1}</p>
                                <p className="text-sm text-gray-600">Text2: {pair.text2}</p>
                            </div>
                        ))}
                        {dataset.samplePairs.length === 0 && (
                            <p className="text-sm text-gray-500">Aucun couple disponible</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Annotateurs affectés</h3>
                    <Link
                        to={`/admin/datasets/${dataset.id}/annotators`}
                        className="px-3 py-1 bg-teal-500 text-white text-sm rounded hover:bg-teal-600 transition-colors"
                    >
                        Gérer les annotateurs
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annotations complétées</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dataset.assignedAnnotators.map((annotator) => (
                                <tr key={annotator.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{annotator.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{annotator.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {annotator.completedTasks} / {dataset.totalPairs}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-red-600 hover:text-red-900">
                                            Désaffecter
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {dataset.assignedAnnotators.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucun annotateur affecté
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}