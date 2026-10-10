import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const ourPresenceService = {
  get: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.OUR_PRESENCE.GET
    );

    return response.data;
  },

  update: async (formData) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.OUR_PRESENCE.UPDATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

export default ourPresenceService;