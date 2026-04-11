import { apiRequest } from './apiClient'
import { getAuthHeader, getStoredAuthSession } from './auth'

export function getComments({ parentType, parentId, page = 1, limit = 5 }) {
  const query = new URLSearchParams({
    parentType,
    parentId,
    page: String(page),
    limit: String(limit),
  })

  return apiRequest(`/api/comments?${query.toString()}`)
}

export function createComment(commentData) {
  const token = getStoredAuthSession()?.token

  return apiRequest('/api/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export function deleteComment(commentId) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
}

export function updateComment(commentId, content) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
    headers: getAuthHeader(),
  })
}

export function getMyComments() {
  return apiRequest('/api/comments/mine', {
    headers: getAuthHeader(),
  })
}
