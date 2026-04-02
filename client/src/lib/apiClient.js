const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

/*
    apiClient holds a shared fetch wrapper to help prevent
    code duplication
*/
export async function apiRequest(path, options = {}) {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJsonBody = contentType.includes('application/json')
  const data = hasJsonBody ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}
