import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Point to the Node.js backend
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (username: string, password: string) => {
        return api.post('/login', { username, password });
    },
    register: (data: any) => api.post('/register', data),
    me: () => api.get('/me'),
};

export const recordsApi = {
    list: () => api.get('/records'),
    upload: (patientId: string | number, recordType: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', patientId.toString());
        formData.append('record_type', recordType);
        return api.post('/records/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    grantAccess: (doctorId: number) => api.post('/records/grant', { doctor_id: doctorId }),
    revokeAccess: (doctorId: number) => api.post('/records/revoke', { doctor_id: doctorId }),
    listDoctors: () => api.get('/doctors'),
    getProfile: () => api.get('/patients/me'),
    download: (recordId: number) => api.get(`/records/${recordId}/image`, { responseType: 'blob' }),
    delete: (recordId: number) => api.delete(`/records/${recordId}`),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    listUsers: () => api.get('/admin/users'),
    updateRole: (userId: number, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
    listLogs: () => api.get('/admin/logs'),
};


export default api;
