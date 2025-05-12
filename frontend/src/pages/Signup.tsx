import { Link, useNavigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

type SignupFormData = {
    email: string;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    password: string;
    confirmPassword: string;
}

function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, getValues, formState: { errors } } = useForm<SignupFormData>();
    const { signup, isAuthenticated, userRole, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            // Redirect based on role
            if (userRole === "ROLE_ADMIN") {
                navigate('/admin');
            } else if (userRole === "ROLE_USER") {
                navigate('/annotator');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, userRole, authLoading, navigate]);

    const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
        setIsLoading(true);
        try {
            const { confirmPassword, ...signupData } = data;
            await signup(signupData);
            navigate('/verify');
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Show nothing while checking authentication
    if (authLoading) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex justify-center items-center relative overflow-hidden">
            {/* Original decorative shapes */}
            <div className="absolute w-60 h-60 rounded-xl bg-teal-300/50 -top-5 -left-16 z-0 transform rotate-45 hidden md:block"></div>
            <div className="absolute w-48 h-48 rounded-xl bg-teal-300/50 -bottom-6 -right-10 transform rotate-12 hidden md:block"></div>
            <div className="w-40 h-40 absolute bg-teal-300/50 rounded-full top-0 right-12 hidden md:block"></div>
            <div className="w-20 h-40 absolute bg-teal-300/50 rounded-full bottom-20 left-10 transform rotate-45 hidden md:block"></div>

            {/* Animated background elements */}
            <div className="absolute w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md px-6">
                <form className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300" onSubmit={handleSubmit(onSubmit)}>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join us and start annotating</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                type="text"
                                placeholder="Email Address"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.email && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

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
                                        name="gender"
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
                                        name="gender"
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
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.password && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === getValues("password") || "The passwords do not match"
                                })}
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.confirmPassword && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup;

// function Signup() {
//     return (
//         <div className="bg-gray-100 flex justify-center items-center h-screen rounded-xl">
//             {/* Left: Image */}
//             <div className="w-1/2 h-screen hidden lg:block">
//                 <img src="https://pdfreaderpro.oss-cn-shanghai.aliyuncs.com/blog/319951712672780/400x400-14.png" alt="Placeholder Image" className="object-cover w-full h-full rounded-xl" />
//             </div>
//             {/* Right: Signup Form */}
//             <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
//                 <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
//                 <form action="#" method="POST">
//                     {/* Email Input */}
//                     <div className="mb-4">
//                         <label htmlFor="email" className="block text-gray-600">Email</label>
//                         <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                             autoComplete="off"
//                         />
//                     </div>
//                     {/* Username Input */}
//                     <div className="mb-4">
//                         <label htmlFor="username" className="block text-gray-600">Username</label>
//                         <input
//                             type="text"
//                             id="username"
//                             name="username"
//                             className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                             autoComplete="off"
//                         />
//                     </div>
//                     {/* Password Input */}
//                     <div className="mb-4">
//                         <label htmlFor="password" className="block text-gray-600">Password</label>
//                         <input
//                             type="password"
//                             id="password"
//                             name="password"
//                             className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                             autoComplete="off"
//                         />
//                     </div>
//                     {/* Confirm Password Input */}
//                     <div className="mb-4">
//                         <label htmlFor="confirmPassword" className="block text-gray-600">Confirm Password</label>
//                         <input
//                             type="password"
//                             id="confirmPassword"
//                             name="confirmPassword"
//                             className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
//                             autoComplete="off"
//                         />
//                     </div>
//                     {/* Terms and Conditions Checkbox */}
//                     <div className="mb-4 flex items-center">
//                         <input
//                             type="checkbox"
//                             id="terms"
//                             name="terms"
//                             className="text-blue-500"
//                         />
//                         <label htmlFor="terms" className="text-gray-600 ml-2">
//                             I agree to the Terms and Conditions
//                         </label>
//                     </div>
//                     {/* Signup Button */}
//                     <button
//                         type="submit"
//                         className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
//                     >
//                         Sign Up
//                     </button>
//                 </form>
//                 {/* Login Link */}
//                 <div className="mt-6 text-blue-500 text-center">
//                     <a href="/login" className="hover:underline">Already have an account? Login Here</a>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Signup;