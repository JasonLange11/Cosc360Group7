
const API_BASE_URL = 'https://localhost:3001'

/*
    apiClient holds a shared fetch wrapper to help prevent
    code duplication
*/
export async function apiRequest(path, options = {}){
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type' : 'application/json',
            ...API_BASE_URL(options.headers || {}),
        },
        ...options,
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message);
    }

    return data;
}