import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

export async function getMyGroups() {
  return apiRequest('/api/groups/mine', {
    headers: getAuthHeader(),
  });
}

export async function createGroup(groupData) {
  return apiRequest('/api/groups', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(groupData),
  });
}

export async function updateGroup(groupId, groupData) {
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(groupData),
  });
}

export async function deleteGroup(groupId) {
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'DELETE',
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
  return apiRequest(`/api/groups/${groupId}/join`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}
