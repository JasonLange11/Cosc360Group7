

import {apiRequest} from './apiClient';

export function loginUser(credentials) {
    return apiRequest('./api/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export function registerUser(userData){
    return apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}