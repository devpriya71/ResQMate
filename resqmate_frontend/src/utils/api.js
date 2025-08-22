// src/utils/api.js

const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = `http://${HOST}:8000/api`;

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Decide whether to use Bearer or Token based on token shape
const getAuthHeader = (token) => {
    if (!token) return null;
    // JWT usually has 3 parts separated by dots
    const scheme = token.includes('.') ? 'Bearer' : 'Token';
    return `${scheme} ${token}`;
};

// API request wrapper with auth headers
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const authHeader = getAuthHeader(token);
    if (authHeader) {
        headers.Authorization = authHeader;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
        return {};
    }

    return response.json();
};

// Form data API request wrapper for multipart/form-data
const apiFormDataRequest = async (endpoint, formData) => {
    const token = getAuthToken();
    const headers = {};

    const authHeader = getAuthHeader(token);
    if (authHeader) {
        headers.Authorization = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to submit form data');
    }

    return response.json();
};

// Authentication APIs
export const authAPI = {
    login: async (username, password) => {
        return apiRequest('/auth/token/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    register: async (username, password, role) => {
        return apiRequest('/auth/register/', {
            method: 'POST',
            body: JSON.stringify({ username, password, role }),
        });
    },
};

// Dashboard APIs
export const dashboardAPI = {
    getStats: () => apiRequest('/dashboard/'),
};

// SOS APIs
export const sosAPI = {
    getAll: () => apiRequest('/sos/'),

    create: async (sosData, imageFile = null) => {
        const formData = new FormData();
        Object.keys(sosData).forEach(key => {
            formData.append(key, sosData[key]);
        });
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return apiFormDataRequest('/sos/', formData);
    },
};

// Donation APIs
export const donationAPI = {
    getAll: () => apiRequest('/donations/'),

    create: (donationData) => apiRequest('/donations/', {
        method: 'POST',
        body: JSON.stringify(donationData),
    }),
};

// Volunteer APIs
export const volunteerAPI = {
    assign: (type, id, volunteer) => apiRequest('/assign/', {
        method: 'POST',
        body: JSON.stringify({ type, id, volunteer }),
    }),
};

// Help Request APIs
export const helpRequestAPI = {
    getAll: () => apiRequest('/help-requests/'),
    create: (data) => apiRequest('/help-requests/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
