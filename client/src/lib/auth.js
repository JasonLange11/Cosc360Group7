

import {apiRequest} from './apiClient';

const AUTH_STORAGE_KEY = 'authSession';

// Save the authenticated session (token + user) to localStorage
export function storeAuthSession(authSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
}

// Read and parse the saved auth session from localStorage
export function getStoredAuthSession() {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedAuth) {
        return null;
    }

    try {
        return JSON.parse(storedAuth);
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

// Remove any saved auth session from localStorage
export function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Build an Authorization header from the saved token
export function getAuthHeader(errorMessage = 'You must be logged in to perform this action') {
    const token = getStoredAuthSession()?.token;

    if (!token) {
        throw new Error(errorMessage);
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

// Send login credentials and return an auth session from the API
export function loginUser(credentials) {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

// Send registration details and return an auth session from the API
export function registerUser(userData){
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

// Fetch the current authenticated user using a bearer token
export function fetchCurrentUser(token) {
    return apiRequest('/api/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}