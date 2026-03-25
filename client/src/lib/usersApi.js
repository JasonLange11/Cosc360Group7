
import { apiRequest } from './apiClient';

// Returns all users other than admins
export async function getUsers() {
  return apiRequest('/api/users');
}
