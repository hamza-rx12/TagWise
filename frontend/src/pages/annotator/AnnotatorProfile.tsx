import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import AnnotatorSidebar from '../../components/AnnotatorSidebar';
import { authenticatedFetch } from '../../utils/api';

const AnnotatorProfile: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        gender: '',
    });

    // Initialize form with user data only once when component mounts
    useEffect(() => {
        if (user && !isEditing) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                gender: user.gender || '',
            });
        }
    }, [user, isEditing]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading profile...</div>
            </div>
        );
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEdit = () => {
        // Set form to current user data when entering edit mode
        setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            gender: user.gender || '',
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to current user data when canceling
        setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            gender: user.gender || '',
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        console.log("handleSave");
        // setIsEditing(true);
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/v1/annotators/${user?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    gender: form.gender,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update the local user state
            if (user) {
                user.firstName = form.firstName;
                user.lastName = form.lastName;
                user.gender = form.gender;
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
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
                    <div className="p-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/50 max-w-xl mx-auto">
                            <div className="flex flex-col items-center">
                                <img
                                    src={'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80'}
                                    alt="User Avatar"
                                    className="w-24 h-24 rounded-full mb-4 border-4 border-teal-100 shadow"
                                />
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                    {isEditing ? form.firstName : user.firstName} {isEditing ? form.lastName : user.lastName}
                                </h2>
                                <p className="text-teal-600 font-medium mb-2">Annotator</p>
                                {!isEditing && (
                                    <button
                                        type="button"
                                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                                        onClick={handleEdit}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                                <form onSubmit={handleSave} className="w-full mt-4 space-y-4">
                                    {error && (
                                        <div className="text-red-500 text-sm mb-4">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 w-28">First Name:</span>
                                        {isEditing ? (
                                            <input
                                                name="firstName"
                                                type="text"
                                                className="ml-2 px-2 py-1 border rounded text-gray-700 flex-1"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        ) : (
                                            <span className="ml-2 text-gray-600">{user.firstName}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 w-28">Last Name:</span>
                                        {isEditing ? (
                                            <input
                                                name="lastName"
                                                type="text"
                                                className="ml-2 px-2 py-1 border rounded text-gray-700 flex-1"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        ) : (
                                            <span className="ml-2 text-gray-600">{user.lastName}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 w-28">Email:</span>
                                        <span className="ml-2 text-gray-600">{user.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 w-28">Role:</span>
                                        <span className="ml-2 text-gray-600">{user.role}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 w-28">Gender:</span>
                                        {isEditing ? (
                                            <select
                                                name="gender"
                                                className="ml-2 px-2 py-1 border rounded text-gray-700 flex-1"
                                                value={form.gender}
                                                onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        ) : (
                                            <span className="ml-2 text-gray-600">
                                                {user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : user.gender}
                                            </span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="submit"
                                                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition disabled:opacity-50"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnotatorProfile;
