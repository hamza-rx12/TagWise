import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { authenticatedFetch } from '../utils/api';

type Annotator = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
    role: string;
};

type AssignFormData = {
    annotatorId: string;
};

function AssignAnnotators() {
    const { id } = useParams<{ id: string }>();
    const [annotators, setAnnotators] = useState<Annotator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { register, handleSubmit, formState: { errors } } = useForm<AssignFormData>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnnotators = async () => {
            try {
                const response = await authenticatedFetch('http://localhost:8080/api/admin/annotators');
                if (!response.ok) {
                    throw new Error('Failed to fetch annotators');
                }
                const data = await response.json();
                // Filter for validated annotators only
                setAnnotators(data.filter((user: Annotator) => user.enabled && user.role === 'ROLE_USER'));
            } catch (error) {
                console.error('Fetch annotators error:', error);
                alert('Failed to load annotators');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnotators();
    }, []);

    const onSubmit: SubmitHandler<AssignFormData> = async (data) => {
        try {
            const response = await authenticatedFetch('http://localhost:8080/api/admin/annotators/assign', {
                method: 'POST',
                body: JSON.stringify({
                    datasetId: id,
                    annotatorId: parseInt(data.annotatorId),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign annotator');
            }

            navigate(`/admin/datasets/${id}`);
        } catch (error) {
            console.error('Assign annotator error:', error);
            alert('Failed to assign annotator');
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Assign Annotator to Dataset</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                    <select
                        {...register('annotatorId', { required: 'Please select an annotator' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                    >
                        <option value="">Select Annotator</option>
                        {annotators.map((annotator) => (
                            <option key={annotator.id} value={annotator.id}>
                                {annotator.firstName} {annotator.lastName} ({annotator.email})
                            </option>
                        ))}
                    </select>
                    {errors.annotatorId && (
                        <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.annotatorId.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    Assign Annotator
                </button>
            </form>
        </div>
    );
}

export default AssignAnnotators;