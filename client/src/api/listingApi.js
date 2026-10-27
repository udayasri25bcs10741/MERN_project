import api from './axiosInstance';

export const listingApi = {
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  getMyListings: async (params = {}) => {
    const response = await api.get('/listings/my', { params });
    return response.data;
  },

  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  createListing: async (formData) => {
    const response = await api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateListing: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  withdrawListing: async (id, reason) => {
    const response = await api.patch(`/listings/${id}/withdraw`, { reason });
    return response.data;
  },
};
