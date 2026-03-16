
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

/*
    apiClient holds a shared fetch wrapper to help prevent
    code duplication
*/
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}