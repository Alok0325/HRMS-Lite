const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

// Employee APIs
export const employeeApi = {
    getAll: () => request('/employees'),
    getOne: (id) => request(`/employees/${id}`),
    create: (data) => request('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    delete: (id) => request(`/employees/${id}`, {
        method: 'DELETE',
    }),
};

// Attendance APIs
export const attendanceApi = {
    mark: (data) => request('/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getByEmployee: (employeeId, date) => {
        const params = date ? `?date=${date}` : '';
        return request(`/attendance/${employeeId}${params}`);
    },
};

// Dashboard APIs
export const dashboardApi = {
    getSummary: () => request('/dashboard/summary'),
};
