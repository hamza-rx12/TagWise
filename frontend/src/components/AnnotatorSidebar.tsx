// components/AnnotatorSidebar.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import * as React from "react";

interface AnnotatorSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: (e: React.FormEvent) => void;
}

function AnnotatorSidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isSidebarOpen, setIsSidebarOpen, searchQuery, setSearchQuery, handleSearch }: AnnotatorSidebarProps) {
    const { user, logout } = useAuth();

    // Load and save sidebar state to localStorage
    useEffect(() => {
        const savedSidebarState = localStorage.getItem('sidebarOpen');
        if (savedSidebarState !== null) {
            setIsSidebarOpen(savedSidebarState === 'true');
        }
    }, [setIsSidebarOpen]);

    useEffect(() => {
        localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
    }, [isSidebarOpen]);

    const toggleSidebar = () => setIsSidebarOpen((prev: boolean) => !prev);

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-white shadow-xl px-3 transition-transform duration-300 ease-in-out z-10 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 ${isSidebarOpen ? 'w-60' : 'w-20'}`}
        >
            <div className={`space-y-6 mt-10 ${isSidebarOpen ? 'md:space-y-10' : 'md:space-y-16'}`}>
                {/* Logo */}
                <div className="flex justify-between items-center">
                    {isSidebarOpen ? (
                        <h1 className="font-bold text-sm md:text-xl text-center w-full">
                            TagWise<span className="text-teal-600">.</span>
                        </h1>
                    ) : (
                        <h1 className="font-bold text-2xl text-center w-full">
                            T<span className="text-teal-600">.</span>
                        </h1>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute right-0 top-20 bg-teal-500 text-white p-1 rounded-l-md transform translate-x-full"
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* User Profile */}
                {user && (
                    <div className="space-y-3">
                        <img
                            src="https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                            alt="Avatar de l'utilisateur"
                            className={`${isSidebarOpen ? 'w-10 md:w-16' : 'w-10'} rounded-full mx-auto`}
                        />
                        {isSidebarOpen && (
                            <div>
                                <h2 className="font-medium text-xs md:text-sm text-center text-teal-500">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-xs text-gray-500 text-center">Annotator</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Bar */}
                {isSidebarOpen && (
                    <form onSubmit={handleSearch} className="flex border-2 border-gray-200 rounded-md focus-within:ring-2 ring-teal-500">
                        <input
                            type="text"
                            className="w-full rounded-tl-md rounded-bl-md px-2 py-3 text-sm text-gray-600 focus:outline-none"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search"
                        />
                        <button type="submit" className="rounded-tr-md rounded-br-md px-2 py-3 hidden md:block" aria-label="Submit search">
                            <svg className="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </form>
                )}

                {/* Navigation Menu */}
                <div className="flex flex-col space-y-2">
                    <Link
                        to="/annotator/dashboard"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:text-base rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Dashboard</span>}
                    </Link>
                    <Link
                        to="/annotator/tasks"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2a1 1 0 00-1 1v2a1 1 0 102 0V3a1 1 0 00-1-1zm0 6a1 1 0 00-1 1v8a1 1 0 102 0V9a1 1 0 00-1-1zm-4 4a1 1 0 100 2h8a1 1 0 100-2H5z" />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Tasks</span>}
                    </Link>
                    <Link
                        to="/annotator/reports"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Reports</span>}
                    </Link>
                    <Link
                        to="/annotator/profile"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Profile</span>}
                    </Link>
                    <Link
                        to="/annotator/messages"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Messages</span>}
                    </Link>
                    <Link
                        to="/annotator/calendar"
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2' : 'px-0 justify-center'} hover:bg-teal-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center`}
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Calendar</span>}
                    </Link>
                    <button
                        onClick={logout}
                        className={`text-sm font-medium text-gray-700 py-2 ${isSidebarOpen ? 'px-2 text-left' : 'px-0 justify-center'} hover:bg-red-500 hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out flex items-center w-full`}
                        aria-label="Logout"
                    >
                        <svg className="w-6 h-6 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {isSidebarOpen && <span className="ml-2">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button
                className="p-2 border-2 bg-white rounded-md border-gray-200 shadow-lg text-gray-500 focus:bg-teal-500 focus:outline-none focus:text-white absolute top-0 left-0 sm:hidden z-20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                <svg className="w-5 h-5 fill-current" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}

export default AnnotatorSidebar;
