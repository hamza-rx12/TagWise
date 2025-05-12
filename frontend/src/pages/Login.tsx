import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserRole } from "../utils/jwt";

type LoginCredentials = {
    email: string;
    password: string;
}

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
    const { login, isAuthenticated, userRole, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Redirect based on role
            if (userRole === "ROLE_ADMIN") {
                navigate('/admin');
            } else if (userRole === "ROLE_USER") {
                navigate('/annotator');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, userRole, isLoading, navigate]);

    const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
        try {
            await login(data.email, data.password);
            // Navigation will be handled by the useEffect above
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    // Show nothing while checking authentication
    if (isLoading) {
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
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to continue your journey</p>
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
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.email && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.email.message}</p>
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
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.password && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.password.message}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            Sign In
                        </button>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;


// function Login() {
//     return (
//         <div className="bg-gray-100 flex justify-center items-center h-screen">
//             {/* Left: Image */}
//             <div className="w-1/2 h-screen hidden lg:block">
//                 <img src="https://miro.medium.com/v2/resize:fit:564/1*kc2F4UCQbLJg-MsGbXSwqg.jpeg" alt="Placeholder Image" className="object-cover w-full h-full" />
//             </div>
//             {/* Right: Login Form */}
//             <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
//                 <h1 className="text-2xl font-semibold mb-4">Login</h1>
//                 <form action="#" method="POST">
//                     {/* Username Input */}
//                     <div className="mb-4">
//                         <label htmlFor="username" className="block text-gray-600">Username</label>
//                         <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
//                     </div>
//                     {/* Password Input */}
//                     <div className="mb-4">
//                         <label htmlFor="password" className="block text-gray-600">Password</label>
//                         <input type="password" id="password" name="password" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
//                     </div>
//                     {/* Remember Me Checkbox */}
//                     <div className="mb-4 flex items-center">
//                         <input type="checkbox" id="remember" name="remember" className="text-blue-500" />
//                         <label htmlFor="remember" className="text-gray-600 ml-2">Remember Me</label>
//                     </div>
//                     {/* Forgot Password Link */}
//                     <div className="mb-6 text-blue-500">
//                         <a href="#" className="hover:underline">Forgot Password?</a>
//                     </div>
//                     {/* Login Button */}
//                     <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">Login</button>
//                 </form>
//                 {/* Sign up Link */}
//                 <div className="mt-6 text-blue-500 text-center">
//                     <a href="#" className="hover:underline">Sign up Here</a>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Login;