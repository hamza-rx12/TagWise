import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
    role: string;
    spamScore: number | null;
    qualityMetric: number | null;
};

function ManageAnnotators() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await authenticatedFetch('http://localhost:8080/api/admin/annotators');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Fetch users error:', error);
                alert('Failed to load users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleValidateUser = async (userId: number) => {
        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/admin/users/validate/${userId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to validate user');
            }

            setUsers(users.map((user) =>
                user.id === userId ? { ...user, enabled: true } : user
            ));
        } catch (error) {
            console.error('Validate user error:', error);
            alert('Failed to validate user');
        }
    };

    const getStatusBadge = (enabled: boolean) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {enabled ? 'Validated' : 'Pending'}
            </span>
        );
    };

    const getMetricDisplay = (value: number | null, type: 'spam' | 'quality') => {
        if (value === null) return 'N/A';
        
        const colorClass = type === 'spam' ? 
            (value > 0.5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') :
            (value > 0.7 ? 'bg-green-100 text-green-800' : value > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {value.toFixed(2)}
            </span>
        );
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Annotator Management</h1>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spam Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No annotators found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                    <span className="text-teal-600 font-medium">
                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role === 'ROLE_USER' ? 'Annotator' : user.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(user.enabled)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMetricDisplay(user.spamScore, 'spam')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMetricDisplay(user.qualityMetric, 'quality')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {!user.enabled && user.role === 'ROLE_USER' && (
                                                <button
                                                    onClick={() => handleValidateUser(user.id)}
                                                    className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                                >
                                                    Validate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManageAnnotators;