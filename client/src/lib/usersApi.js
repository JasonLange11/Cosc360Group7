import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

export async function getUsers() {
  return apiRequest('/api/users');
}

export async function deleteUser(userId){
  return apiRequest(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeader('You must be logged in to remove a user'),
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

export async function getGroupMembership() {
  return apiRequest('/api/groups/membership', {
    headers: getAuthHeader(),
  });
}

export async function joinGroup(groupId) {
  return apiRequest(`/api/groups/${groupId}/join`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
}

export async function leaveGroup(groupId) {
  return apiRequest(`/api/groups/${groupId}/leave`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}
