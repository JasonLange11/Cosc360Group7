

import {apiRequest} from './apiClient';

const AUTH_STORAGE_KEY = 'authSession';

export function storeAuthSession(authSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
}

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

export function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function loginUser(credentials) {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export function registerUser(userData){
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export function fetchCurrentUser(token) {
    return apiRequest('/api/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}