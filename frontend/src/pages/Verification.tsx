import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type VerificationFormData = {
    email: string;
    verificationCode: string;
}

function Verification() {
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<VerificationFormData>();
    const { verifyEmail, resendVerificationCode } = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<VerificationFormData> = async (data) => {
        setIsLoading(true);
        try {
            await verifyEmail(data.email, data.verificationCode);
            navigate('/login');
        } catch (error) {
            console.error("Verification error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        const email = document.querySelector<HTMLInputElement>('input[name="email"]')?.value;
        if (!email) {
            alert("Please enter your email address first");
            return;
        }

        setResendLoading(true);
        try {
            await resendVerificationCode(email);
            alert("Verification code has been resent to your email");
        } catch (error) {
            console.error("Resend error:", error);
            alert("Failed to resend verification code");
        } finally {
            setResendLoading(false);
        }
    };

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
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                        <p className="text-gray-600">Enter the verification code sent to your email</p>
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
                                placeholder="Email Address"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm"
                            />
                            {errors.email && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                {...register("verificationCode", {
                                    required: "Verification code is required",
                                    minLength: {
                                        value: 6,
                                        message: "Verification code must be 6 characters"
                                    },
                                    maxLength: {
                                        value: 6,
                                        message: "Verification code must be 6 characters"
                                    }
                                })}
                                type="text"
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm text-center tracking-widest"
                                maxLength={6}
                            />
                            {errors.verificationCode && (
                                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{errors.verificationCode.message}</p>
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
                                    Verifying...
                                </span>
                            ) : (
                                "Verify Email"
                            )}
                        </button>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    disabled={resendLoading}
                                    className="text-teal-600 hover:text-teal-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleResendCode}
                                >
                                    {resendLoading ? "Sending..." : "Resend Code"}
                                </button>
                            </p>
                            <p className="text-sm text-gray-600">
                                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Verification; 