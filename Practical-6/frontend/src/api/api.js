const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/tasks';

async function handleResponse(response) {
    let data;
    try {
        data = await response.json();
    } catch (err) {
        throw new Error('Unable to parse server response.');
    }
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

export const getTasks = async () => {
    try {
        const response = await fetch(BASE_URL);
        return await handleResponse(response);
    } catch (error) {
        throw new Error(error.message || `Unable to connect to the server. Please make sure the Express backend is running on ${BASE_URL}.`);
    }
};

export const createTask = async (task) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Failed to create task');
    }
};

export const updateTask = async (id, task) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Failed to update task');
    }
};

export const deleteTask = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Failed to delete task');
    }
};
