import { jwtDecode } from 'jwt-decode';

type JWTPayload = {
    sub: string;      // user email
    role: string;     // user role
    firstName: string;
    lastName: string;
    exp: number;      // token expiration time
    userId: string;   // user id
    gender: string;   // user gender
};

// Immediately decode and print the token
const token = localStorage.getItem('token');
if (token) {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Current Token Contents:', {
            email: decoded.sub,
            role: decoded.role,
            userId: decoded.userId,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            gender: decoded.gender,
            expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
            raw: decoded
        });
    } catch (error) {
        console.error('Error decoding token:', error);
    }
} else {
    console.log('No token found in localStorage');
}

export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Getting token from localStorage:', !!token);
    return token;
};

export const setToken = (token: string) => {
    console.log('Setting token in localStorage');
    localStorage.setItem('token', token);
    // Verify token was stored
    const storedToken = localStorage.getItem('token');
    console.log('Token stored successfully:', !!storedToken);
};

export const removeToken = () => {
    console.log('Removing token from localStorage');
    localStorage.removeItem('token');
    // Verify token was removed
    const token = localStorage.getItem('token');
    console.log('Token removed successfully:', !token);
};

export const isTokenValid = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        const isValid = decoded.exp > currentTime;
        console.log('Token validation:', {
            expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
            currentTime: new Date(currentTime * 1000).toLocaleString(),
            isValid
        });
        return isValid;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

export const getUserRole = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded role from token:', decoded.role);
        return decoded.role;
    } catch (error) {
        console.error('Error decoding role from token:', error);
        return null;
    }
};

export const getFirstName = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded firstName from token:', decoded.firstName);
        return decoded.firstName;
    } catch (error) {
        console.error('Error decoding firstName from token:', error);
        return null;
    }
};

export const getLastName = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded lastName from token:', decoded.lastName);
        return decoded.lastName;
    } catch (error) {
        console.error('Error decoding lastName from token:', error);
        return null;
    }
};

export const getUserEmail = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded email from token:', decoded.sub);
        return decoded.sub;
    } catch (error) {
        console.error('Error decoding email from token:', error);
        return null;
    }
};

export const getUserId = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded userId from token:', decoded.userId);
        return decoded.userId;
    } catch (error) {
        console.error('Error decoding userId from token:', error);
        return null;
    }
};

export const getGender = (): string | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded gender from token:', decoded.gender);
        return decoded.gender;
    } catch (error) {
        console.error('Error decoding gender from token:', error);
        return null;
    }
};

// Debug function to print decoded token
export const debugToken = () => {
    const token = getToken();
    if (!token) {
        console.log('No token found in localStorage');
        return null;
    }

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log('Decoded Token:', {
            email: decoded.sub,
            role: decoded.role,
            userId: decoded.userId,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            gender: decoded.gender,
            expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
            raw: decoded
        });
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}; 
