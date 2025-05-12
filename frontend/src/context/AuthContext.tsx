import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUserRole, getUserEmail, getUserId, setToken, removeToken, isTokenValid } from '../utils/jwt';

// Types
type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
};

type SignupData = {
    email: string;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    password: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    userRole: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (data: SignupData) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendVerificationCode: (email: string) => Promise<void>;
};

// API endpoints
const API_BASE_URL = "http://localhost:8080/api/auth";
const ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login`,
    SIGNUP: `${API_BASE_URL}/signup`,
    VERIFY: `${API_BASE_URL}/verify`,
    RESEND_VERIFICATION: `${API_BASE_URL}/resend-verification`,
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const initializeAuth = () => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                if (!isTokenValid(token)) {
                    removeToken();
                    setUser(null);
                    setUserRole(null);
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                const role = getUserRole();
                const email = getUserEmail();
                const userId = getUserId();

                if (role && email && userId) {
                    setUserRole(role);
                    setUser({
                        id: userId,
                        email: email,
                        firstName: '', // These would need to be fetched from an API
                        lastName: '',  // or included in the JWT payload
                        role: role
                    });
                    setIsAuthenticated(true);
                } else {
                    removeToken();
                    setUser(null);
                    setUserRole(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                removeToken();
                setUser(null);
                setUserRole(null);
                setIsAuthenticated(false);
            }
        } else {
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(ENDPOINTS.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            console.log('Login Response:', data);
            setToken(data.token);
            initializeAuth();
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
    };

    const signup = async (data: SignupData) => {
        try {
            const response = await fetch(ENDPOINTS.SIGNUP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Signup failed");
            }

            const result = await response.json();
            console.log("Signup Response:", result);
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const response = await fetch(ENDPOINTS.VERIFY, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, verificationCode: code }),
            });

            if (!response.ok) {
                throw new Error("Verification failed");
            }

            const data = await response.json();
            console.log("Verification Response:", data);
        } catch (error) {
            console.error("Verification error:", error);
            throw error;
        }
    };

    const resendVerificationCode = async (email: string) => {
        try {
            const response = await fetch(ENDPOINTS.RESEND_VERIFICATION, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Failed to resend verification code");
            }

            const data = await response.json();
            console.log("Resend Verification Response:", data);
        } catch (error) {
            console.error("Resend verification error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                userRole,
                isLoading,
                login,
                logout,
                signup,
                verifyEmail,
                resendVerificationCode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
} 