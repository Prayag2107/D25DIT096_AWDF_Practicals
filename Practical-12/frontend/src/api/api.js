const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = API_URL;

/**
 * Helper to retrieve the current JWT token from localStorage
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Handle HTTP response and parse JSON, with automatic 401 Unauthorized handling
 */
async function handleResponse(response) {
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(text || `Server responded with HTTP ${response.status}`);
    }

    if (!response.ok) {
        // If server returns 401 Unauthorized (token invalid, missing, or expired)
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Notify components of auth state change
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

/**
 * Generic fetch wrapper attaching Authorization header
 */
async function authFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(error.message || `Unable to connect to server at ${API_URL}`);
    }
}

/* ================= AUTHENTICATION API ================= */

export const registerUser = async (email, password) => {
    return await authFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
};

export const loginUser = async (email, password) => {
    return await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
};

export const getCurrentUser = async () => {
    return await authFetch('/auth/me', {
        method: 'GET'
    });
};

/* ================= TASK CRUD API ================= */

export const getTasks = async () => {
    return await authFetch('/tasks', {
        method: 'GET'
    });
};

export const createTask = async (task) => {
    return await authFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
    });
};

export const updateTask = async (id, task) => {
    return await authFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task)
    });
};

export const deleteTask = async (id) => {
    return await authFetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
};
