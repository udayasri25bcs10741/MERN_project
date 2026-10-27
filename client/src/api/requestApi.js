import api from './axiosInstance';

export const requestApi = {
  createRequest: async (data) => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  getMyRequests: async (params = {}) => {
    const response = await api.get('/requests/my', { params });
    return response.data;
  },

  getIncomingRequests: async (params = {}) => {
    const response = await api.get('/requests/incoming', { params });
    return response.data;
  },

  getAssignedPickups: async (params = {}) => {
    const response = await api.get('/requests/assigned', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  decideRequest: async (id, data) => {
    // data: { decision: 'accept' | 'reject', rejectionReason?: string }
    const response = await api.patch(`/requests/${id}/decision`, data);
    return response.data;
  },

  cancelRequest: async (id, reason) => {
    // Backend cancelRequestSchema expects field named 'reason'
    const response = await api.patch(`/requests/${id}/cancel`, { reason });
    return response.data;
  },

  assignVolunteer: async (id, volunteerId, scheduledPickupAt) => {
    const response = await api.patch(`/requests/${id}/assign`, { volunteerId, scheduledPickupAt });
    return response.data;
  },

  confirmPickup: async (id, data) => {
    // data: { pickupCode }
    const response = await api.post(`/requests/${id}/confirm-pickup`, data);
    return response.data;
  },

  confirmPickupManual: async (id) => {
    // Dual-confirmation: first call records this party's confirmation,
    // second call (by the other party) completes the pickup.
    const response = await api.post(`/requests/${id}/confirm-pickup-manual`, {});
    return response.data;
  },

  disputePickup: async (id, data) => {
    // data: { reason, disputeType }
    const response = await api.post(`/requests/${id}/dispute`, data);
    return response.data;
  },
};
