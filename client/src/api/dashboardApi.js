import api from './axiosInstance';

export const dashboardApi = {
  getDonorDashboard: async () => {
    const response = await api.get('/dashboard/donor');
    return response.data;
  },

  getNGODashboard: async () => {
    const response = await api.get('/dashboard/ngo');
    return response.data;
  },

  getVolunteerDashboard: async () => {
    const response = await api.get('/dashboard/volunteer');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};
