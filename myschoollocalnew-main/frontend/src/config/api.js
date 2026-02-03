const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api/rest` : '/api/rest';
export default {
    baseURL: API_BASE_URL,
    backendURL: BACKEND_URL
};
