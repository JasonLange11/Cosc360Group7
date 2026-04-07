import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';


// Fetch all of a group's comments
export async function getCommentss(groupId) {
  return apiRequest(`/api/comments/${groupId}`);
}

// Fetch current user's groups (requires authentication)
export async function getMyCommentss() {
  return apiRequest('/api/comments/mine', {
    headers: getAuthHeader(),
  });
}


// Create a new comment (requires authentication)
export async function createComment(commentData) {
  return apiRequest('/api/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
    headers: getAuthHeader(),
  });
}


// Delete a comment (requires authentication)
export async function deleteGroup(commentId) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}