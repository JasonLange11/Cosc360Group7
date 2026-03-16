

import {apiRequest} from './apiClient';

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