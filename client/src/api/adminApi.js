import api from './axiosInstance';

export const adminApi = {
  getVerifications: async (params = {}) => {
    const response = await api.get('/admin/verifications', { params });
    return response.data;
  },

  decideVerification: async (id, data) => {
    // data: { status: 'approved' | 'rejected', notes?: string }
    const response = await api.patch(`/admin/verifications/${id}`, data);
    return response.data;
  },

  getAllListings: async (params = {}) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  moderateListing: async (id, data) => {
    // data: { action: 'hide' | 'unhide', reason: string }
    const response = await api.patch(`/admin/listings/${id}/moderate`, data);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, data) => {
    // data: { status: 'active' | 'suspended', reason: string }
    const response = await api.patch(`/admin/users/${id}/status`, data);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
