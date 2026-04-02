import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

export async function getMyComments() {
  return apiRequest('/api/comments/mine', {
    headers: getAuthHeader(),
  });
}

export async function updateComment(commentId, content) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(commentId) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}
