// Small fetch wrapper for the Express backend.
// Locally VITE_API_URL is empty and Vite proxies /api to localhost:3000.
// In production set VITE_API_URL to the Render URL, e.g. https://resume-builder-api.onrender.com
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
        return null
    }
}

export const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

const request = async (method, path, body) => {
    const token = getToken()
    let res
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: body ? JSON.stringify(body) : undefined,
        })
    } catch {
        throw new Error('Cannot reach the server. If the site was idle it may be waking up - please try again in a minute.')
    }

    const data = await res.json().catch(() => ({}))
    if (res.status === 401 && token) {
        clearSession()
        window.location.href = '/login?state=login'
    }
    if (!res.ok) {
        throw new Error(data.message || (res.status >= 500 ? 'Cannot reach the server. Is the backend running?' : 'Request failed'))
    }
    return data
}

const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
}

export default api

// The free Render server sleeps when idle; ping it as soon as the site opens so it is awake by the time it's needed
export const wakeServer = () => fetch(`${API_URL}/health`).catch(() => {})
