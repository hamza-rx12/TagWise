// import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Main content */}
            <div className="relative z-10 text-center px-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    Welcome to <span className="text-white/90">TagWise</span>
                </h1>
                <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                    A collaborative platform for efficient dataset annotation. Admins upload datasets, annotators label them with precision.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/signup" className="w-full sm:w-auto">
                        <button className="w-full px-8 py-4 bg-white text-teal-600 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500">
                            Join as Annotator
                        </button>
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto">
                        <button className="w-full px-8 py-4 bg-teal-500/20 backdrop-blur-sm text-white text-lg font-semibold rounded-lg border-2 border-white/20 hover:bg-teal-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500">
                            Sign In
                        </button>
                    </Link>
                </div>

                {/* Features section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-200">
                        <div className="text-3xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access</h3>
                        <p className="text-white/80">Admins manage datasets, annotators focus on labeling tasks</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-200">
                        <div className="text-3xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Dataset Management</h3>
                        <p className="text-white/80">Upload, organize, and track annotation progress efficiently</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-200">
                        <div className="text-3xl mb-4">✍️</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Smart Annotation</h3>
                        <p className="text-white/80">Intuitive tools for accurate and consistent data labeling</p>
                    </div>
                </div>

                {/* How it works section */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-4">For Admins</h3>
                            <ul className="text-white/80 space-y-3">
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">1.</span>
                                    Upload your datasets for annotation
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">2.</span>
                                    Monitor annotation progress
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">3.</span>
                                    Download labeled datasets
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-4">For Annotators</h3>
                            <ul className="text-white/80 space-y-3">
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">1.</span>
                                    Create your annotator account
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">2.</span>
                                    Access available datasets
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-300 mr-2">3.</span>
                                    Start annotating with our tools
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;