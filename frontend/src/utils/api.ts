// Base URLs for different API categories
const API_BASE_URL = 'http://localhost:8080';
const AUTH_API = `${API_BASE_URL}/api/auth`;
// const ANNOTATOR_API = `${API_BASE_URL}/api/v1/annotator`;
const ANNOTATORS_API = `${API_BASE_URL}/api/annotators`;
const ADMIN_API = `${API_BASE_URL}/api/admin`;
const TASKS_API = `${API_BASE_URL}/api/tasks`;
// Generic authenticated fetch function

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    console.log('Making authenticated request:', {
        url,
        method: options.method || 'GET',
        headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : undefined }
    });

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        }
        return Promise.reject(new Error('Authentication failed - You will be redirected to login page'));
    }

    if (response.status === 403) {
        console.error('Forbidden access:', {
            url,
            status: response.status,
            statusText: response.statusText
        });
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
    }

    return response;
}


// export async function authenticatedFetch(url: string, options: RequestInit = {}) {
//     const token = localStorage.getItem('token');
//
//     const headers = {
//         'Content-Type': 'application/json',
//         ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//         ...options.headers,
//     };
//
//     const response = await fetch(url, {
//         ...options,
//         headers,
//     });
//
//     if (response.status === 401) {
//         // Token expired or invalid
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//
//         // Only redirect if not already on the login page
//         if (!window.location.pathname.includes('/login')) {
//             // Delay redirect to allow error message to be displayed
//             setTimeout(() => {
//                 window.location.href = '/login';
//             }, 3000); // 3 seconds delay
//         }
//
//         // Return a rejected promise instead of throwing an error
//         return Promise.reject(new Error('Authentication failed - You will be redirected to login page'));
//     }
//
//     return response;
// }

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url: response.url
        });
        throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
        return {} as T;
    }

    const data = await response.json();
    console.log('API Response Data:', {
        url: response.url,
        data
    });
    return data as T;
}

// ==================== Auth API ====================
export type LoginData = {
    email: string;
    password: string;
};

export type SignupData = {
    email: string;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    password: string;
};

export const authApi = {
    login: async (data: LoginData) => {
        const response = await authenticatedFetch(`${AUTH_API}/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse<{ token: string }>(response);
    },

    signup: async (data: SignupData) => {
        const response = await authenticatedFetch(`${AUTH_API}/signup`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse<{ message: string }>(response);
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await authenticatedFetch(`${AUTH_API}/change-password`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse<{ message: string }>(response);
    },

    verifyEmail: async (email: string, code: string) => {
        const response = await authenticatedFetch(`${AUTH_API}/verify`, {
            method: 'POST',
            body: JSON.stringify({ email, verificationCode: code }),
        });
        return handleResponse<{ message: string }>(response);
    },

    resendVerificationCode: async (email: string) => {
        const response = await authenticatedFetch(`${AUTH_API}/resend-verification`, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return handleResponse<{ message: string }>(response);
    },
};

// ==================== Annotator API ====================
export type Task = {
    datasetId(datasetId: any): unknown;
    completionStatus: any;
    annotations: any;
    text1: any;
    text2: any;
    metadata: any;
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
};

export const annotatorApi = {
    getTasks: async () => {
        const response = await authenticatedFetch(`${TASKS_API}/annotator/my-tasks`);
        return handleResponse<Task[]>(response);
    },

    getAnnotatorById: async (id: string) => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}/${id}`);
        return handleResponse<any>(response);
    },

    updateAnnotator: async (id: string, data: any, annotation: any) => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return handleResponse<any>(response);
    },

    // New endpoints for annotator management
    getAllAnnotators: async () => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}`);
        return handleResponse<Annotator[]>(response);
    },

    deleteAnnotator: async (id: string) => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse<void>(response);
    },

    updateAnnotatorStatus: async (id: string, enabled: boolean) => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}/${id}/status?enabled=${enabled}`, {
            method: 'PATCH',
        });
        return handleResponse<void>(response);
    },
};

// ==================== Admin API ====================
export type Dataset = {
    id: number;
    name: string;
    description?: string;
    completionPercentage: number;
};

export type DatasetDetails = {
    id: number;
    name: string;
    description?: string;
    classes: string;
    completionPercentage: number;
    totalPairs: number;
    samplePairs: any[];
    assignedAnnotators: any[];
};

export interface Annotator {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    role: string;
    enabled: boolean;
    deleted?: boolean;
}

export const adminApi = {
    getDatasets: async () => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/list`);
        return handleResponse<Dataset[]>(response);
    },

    getRecentAnnotators: async () => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}/recent`);
        return handleResponse<Array<{ name: string; email: string; completedTasks: number }>>(response);
    },

    getRecentDatasets: async () => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/recent`);
        return handleResponse<Array<{ name: string; classes: string; taskCount: number }>>(response);
    },

    getDatasetCount: async () => {
        console.log('Fetching dataset count from:', `${ADMIN_API}/datasets/count`);
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/count`);
        return handleResponse<number>(response);
    },

    getAnnotatorCount: async () => {
        console.log('Fetching annotator count from:', `${ANNOTATORS_API}/count`);
        const response = await authenticatedFetch(`${ANNOTATORS_API}/count`);
        return handleResponse<number>(response);
    },

    getTaskCount: async () => {
        console.log('Fetching task count from:', `${TASKS_API}/count`);
        const response = await authenticatedFetch(`${TASKS_API}/count`);
        return handleResponse<number>(response);
    },

    getCompletedTaskCount: async () => {
        console.log('Fetching completed task count from:', `${TASKS_API}/completed/count`);
        const response = await authenticatedFetch(`${TASKS_API}/completed/count`);
        return handleResponse<number>(response);
    },

    getDatasetById: async (id: string) => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${id}`);
        return handleResponse<DatasetDetails>(response);
    },

    createDataset: async (formData: FormData) => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/upload`, {
            method: 'POST',
            body: formData,
            headers: {}, // Let the browser set the content type for FormData
        });
        return handleResponse<{ id: number }>(response);
    },

    getAnnotators: async () => {
        const response = await authenticatedFetch(`${ANNOTATORS_API}`);
        return handleResponse<any[]>(response);
    },

    async assignAnnotators({ datasetId, annotatorIds }: { datasetId: number; annotatorIds: number[] }): Promise<{ message: string }> {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${datasetId}/assign-users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(annotatorIds)
        });

        try {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to assign annotators');
            }
            return { message: 'Annotators assigned successfully' };
        } catch (error) {
            console.error('Error assigning annotators:', error);
            throw new Error('Failed to assign annotators. Please try again.');
        }
    },

    getUnassignedAnnotators: async (datasetId: number) => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${datasetId}/unassigned-annotators`);
        return handleResponse<any[]>(response);
    },

    getAssignedAnnotators: async (datasetId: number) => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${datasetId}/unassigned-annotators`);
        return handleResponse<any[]>(response);
    },

    getDatasetAnnotators: async (datasetId: number): Promise<Annotator[]> => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${datasetId}/annotators`);
        return handleResponse<Annotator[]>(response);
    },

    removeAnnotators: async ({ datasetId, annotatorIds }: { datasetId: number; annotatorIds: number[] }): Promise<void> => {
        const response = await authenticatedFetch(`${ADMIN_API}/datasets/${datasetId}/annotators`, {
            method: 'DELETE',
            body: JSON.stringify(annotatorIds)
        });
        return handleResponse<void>(response);
    },

    // Advanced Options
    getAdvancedOptions: async (): Promise<{
        annotatorRegistrationEnabled: boolean;
        annotatorLoginEnabled: boolean;
        annotatorProfileUpdateEnabled: boolean;
    }> => {
        const response = await authenticatedFetch(`${ADMIN_API}/advanced-options`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    updateAdvancedOptions: async (options: {
        annotatorRegistrationEnabled: boolean;
        annotatorLoginEnabled: boolean;
        annotatorProfileUpdateEnabled: boolean;
    }): Promise<void> => {
        const response = await authenticatedFetch(`${ADMIN_API}/advanced-options`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(options)
        });
        return handleResponse(response);
    },
};
