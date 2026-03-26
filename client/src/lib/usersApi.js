
import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

// Returns all users other than admins
export async function getUsers() {
  return apiRequest('/api/users');
}

// Delete a user (requires authentication)
export async function deleteUser(userId){
  return apiRequest(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeader('You must be logged in to remove a user'),
  })
}

