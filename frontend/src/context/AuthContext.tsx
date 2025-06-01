import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUserRole, getUserEmail, getUserId, setToken, removeToken, isTokenValid, getFirstName, getLastName, getGender } from '../utils/jwt';
import { authApi, SignupData as ApiSignupData } from '../utils/api';
// dans ce code on a la creation d'un contexte d'authentification qui va nous permettre de gerer l'authentification de l'utilisateur dans notre application
// Types
type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    gender: string;
};

// Reusing the SignupData type from api.ts
type SignupData = ApiSignupData;

// cette interface est utilisée pour définir le type de données que l'on va envoyer au serveur lors de l'inscription d'un nouvel utilisateur
type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    userRole: string | null;
    isLoading: boolean;
    notification: { message: string; type: "success" | "error" | "info" } | null;
    clearNotification: () => void;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (data: SignupData) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendVerificationCode: (email: string) => Promise<void>;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const clearNotification = () => {
        setNotification(null);
    };

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
                const firstName = getFirstName();
                const lastName = getLastName();
                const gender = getGender();

                if (role && email && userId && firstName && lastName && gender) {
                    setUserRole(role);
                    setUser({
                        id: userId,
                        email: email,
                        firstName: firstName, // These would need to be fetched from an API
                        lastName: lastName,  // or included in the JWT payload
                        role: role,
                        gender: gender
                    });
                    setIsAuthenticated(true);
                } else {
                    removeToken();
                    setUser(null);
                    setUserRole(null);
                    setIsAuthenticated(false);
                }
            } catch {
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
            const data = await authApi.login({ email, password });
            console.log('Login Response:', data);
            setToken(data.token);
            initializeAuth();
        } catch (error) {
            console.error("Login error:", error);
            setNotification({ 
                message: error instanceof Error ? error.message : 'Login failed', 
                type: 'error' 
            });
            return Promise.reject(error instanceof Error ? error.message : 'Login failed');
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
            const result = await authApi.signup(data);
            console.log("Signup Response:", result);
        } catch (error) {
            console.error("Signup error:", error);
            setNotification({ 
                message: error instanceof Error ? error.message : 'Signup failed', 
                type: 'error' 
            });
            return Promise.reject(error instanceof Error ? error.message : 'Signup failed');
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const data = await authApi.verifyEmail(email, code);
            console.log("Verification Response:", data);
        } catch (error) {
            console.error("Verification error:", error);
            setNotification({ 
                message: error instanceof Error ? error.message : 'Verification failed', 
                type: 'error' 
            });
            return Promise.reject(error instanceof Error ? error.message : 'Verification failed');
        }
    };

    const resendVerificationCode = async (email: string) => {
        try {
            const data = await authApi.resendVerificationCode(email);
            console.log("Resend Verification Response:", data);
        } catch (error) {
            console.error("Resend verification error:", error);
            setNotification({ 
                message: error instanceof Error ? error.message : 'Failed to resend verification code', 
                type: 'error' 
            });
            return Promise.reject(error instanceof Error ? error.message : 'Failed to resend verification code');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                userRole,
                isLoading,
                notification,
                clearNotification,
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
