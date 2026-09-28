import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const websiteService = {
  getSettings: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.WEBSITE.SETTINGS
    );

    return response.data;
  },

  updateSettings: async (formData) => {
    const response = await apiClient.put(
      API_ENDPOINTS.WEBSITE.UPDATE,
      formData
    );

    return response.data;
  },
};

export default websiteService;