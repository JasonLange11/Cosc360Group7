
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

/*
    apiClient holds a shared fetch wrapper to help prevent
    code duplication
*/
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  // Determine if the response body is JSON before attempting to parse it
  const contentType = response.headers.get('content-type') || ''
  const hasJsonBody = contentType.includes('application/json')
  const data = hasJsonBody ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}
