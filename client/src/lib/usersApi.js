import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

export async function getUsers() {
  return apiRequest('/api/users', {
    headers: getAuthHeader('You must be logged in to view users'),
  });
}

export async function deleteUser(userId){
  return apiRequest(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeader('You must be logged in to remove a user'),
  })
}

export async function updateUserStatus(userId, isDisabled) {
  return apiRequest(`/api/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAuthHeader('You must be logged in to update a user'),
    body: JSON.stringify({ isDisabled }),
  })
}

export async function updateUserAdmin(userId, isAdmin) {
  return apiRequest(`/api/users/${userId}/admin`, {
    method: 'PATCH',
    headers: getAuthHeader('You must be logged in to update a user'),
    body: JSON.stringify({ isAdmin }),
  })
}

export async function updateUserProfile(userId, profileData) {
  return apiRequest(`/api/users/${userId}/profile`, {
    method: 'PUT',
    headers: getAuthHeader('You must be logged in to update a user'),
    body: JSON.stringify(profileData),
  })
}

export async function getMyProfile() {
  return apiRequest('/api/users/me/profile', {
    headers: getAuthHeader(),
  });
}

export async function updateMyProfile(profileData) {
  return apiRequest('/api/users/me/profile', {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(profileData),
  });
}
