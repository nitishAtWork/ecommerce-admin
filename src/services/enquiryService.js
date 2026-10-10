import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const enquiryService = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENQUIRIES.LIST);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(
      API_ENDPOINTS.ENQUIRIES.GET(id)
    );

    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ENQUIRIES.UPDATE(id),
      data
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.ENQUIRIES.DELETE(id)
    );

    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ENQUIRIES.READ(id)
    );

    return response.data;
  },

  toggleRead: async (id) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ENQUIRIES.TOGGLE_READ(id)
    );

    return response.data;
  },
};

export default enquiryService;