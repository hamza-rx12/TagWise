import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { authenticatedFetch } from "../../utils/api";

type EditAnnotatorFormData = {
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    password?: string; // Optional for updates
    confirmPassword?: string;
};

function EditAnnotator() {
    const [isLoading, setIsLoading] = useState(false);
    const [annotator, setAnnotator] = useState<any>(null);
    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<EditAnnotatorFormData>();
    const navigate = useNavigate();

    // Get the annotator data from sessionStorage
    useEffect(() => {
        const storedAnnotator = sessionStorage.getItem('editAnnotator');
        if (!storedAnnotator) {
            navigate('/admin/annotators-management');
            return;
        }

        const parsedAnnotator = JSON.parse(storedAnnotator);
        
        // Check if the annotator has been deleted
        if (parsedAnnotator.deleted) {
            alert('This annotator has been deleted and cannot be edited.');
            navigate('/admin/annotators-management');
            return;
        }
        
        setAnnotator(parsedAnnotator);

        // Pre-fill the form
        setValue('firstName', parsedAnnotator.firstName);
        setValue('lastName', parsedAnnotator.lastName);
        setValue('gender', parsedAnnotator.gender);
    }, [navigate, setValue]);

    const onSubmit: SubmitHandler<EditAnnotatorFormData> = async (data) => {
        setIsLoading(true);
        try {
            // Remove confirmPassword and empty password if not provided
            const updateData = { ...data };
            delete updateData.confirmPassword;
            
            if (!updateData.password) {
                delete updateData.password;
            }

            const response = await authenticatedFetch(`http://localhost:8080/api/v1/annotators/${annotator.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update annotator');
            }

            alert('Annotator updated successfully');
            navigate('/admin/annotators-management');
        } catch (error) {
            console.error('Error updating annotator:', error);
            alert('Failed to update annotator');
        } finally {
            setIsLoading(false);
        }
    };

    if (!annotator) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex justify-center items-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md px-6">
                <form className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300" onSubmit={handleSubmit(onSubmit)}>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Annotator</h1>
                        <p className="text-gray-600">Update annotator information</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    {...register("firstName", {
                                        required: "First name is required",
                                    })}
                                    type="text"
                                    placeholder="First Name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                />
                                {errors.firstName && (
                                    <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    {...register("lastName", {
                                        required: "Last name is required",
                                    })}
                                    type="text"
                                    placeholder="Last Name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                                />
                                {errors.lastName && (
                                    <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm text-gray-600">Gender:</span>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        {...register("gender", {
                                            required: "Please select a gender"
                                        })}
                                        type="radio"
                                        value="MALE"
                                        className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                                    />
                                    <span className="text-gray-700">Male</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        {...register("gender", {
                                            required: "Please select a gender"
                                        })}
                                        type="radio"
                                        value="FEMALE"
                                        className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                                    />
                                    <span className="text-gray-700">Female</span>
                                </label>
                            </div>
                            {errors.gender && (
                                <p className="text-red-500 text-xs">{errors.gender.message}</p>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                {...register("password", {
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                type="password"
                                placeholder="New Password (leave empty to keep current)"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.password && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                {...register("confirmPassword", {
                                    validate: (value) => {
                                        const password = watch("password");
                                        if (!password) return true; // No validation if password is empty
                                        return value === password || "The passwords do not match";
                                    }
                                })}
                                type="password"
                                placeholder="Confirm New Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.confirmPassword && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    "Update Annotator"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/annotators-management')}
                                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold shadow-lg hover:bg-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Email: <span className="font-medium">{annotator.email}</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAnnotator;
