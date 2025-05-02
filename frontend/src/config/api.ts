const API_BASE_URL = "http://localhost:8080";

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  VERIFY: `${API_BASE_URL}/auth/verify`,
  RESEND: `${API_BASE_URL}/auth/resend`,
};

export default API_ENDPOINTS;