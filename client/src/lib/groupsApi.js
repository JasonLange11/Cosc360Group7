import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';


// Fetch all groups
export async function getGroups() {
  return apiRequest('/api/groups');
}


// Search groups by term
export async function searchGroups(searchTerm) {
  return apiRequest('/api/groups/search', {
    method: 'POST',
    body: JSON.stringify({ searchTerm }),
  });
}


// Fetch a specific group by ID
export async function getGroupById(groupId) {
  return apiRequest(`/api/groups/${groupId}`);
}


// Fetch current user's groups (requires authentication)
export async function getMyGroups() {
  return apiRequest('/api/groups/mine', {
    headers: getAuthHeader(),
  });
}


// Create a new group (requires authentication)
export async function createGroup(groupData) {
  return apiRequest('/api/groups', {
    method: 'POST',
    body: JSON.stringify(groupData),
    headers: getAuthHeader(),
  });
}


// Update an group (requires authentication)
export async function updateGroup(groupId, groupData) {
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(groupData),
    headers: getAuthHeader(),
  });
}


// Delete an group (requires authentication)
export async function deleteGroup(groupId) {
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}

// Add a tag to an group (requires authentication)
export async function addTagToGroup(groupId, tag) {
  return apiRequest("/api/groups/" + groupId + "/tags", {
    method: "PATCH",
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}

// Remove a tag from an group (requires authentication)
export async function removeTagFromGroup(groupId, tag) {
  return apiRequest("/api/groups/" + groupId + "/tags", {
    method: "DELETE",
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}
