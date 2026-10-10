import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const keywordInCityService = {
  get: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.KEYWORD_IN_CITY.GET
    );

    return response.data;
  },

  update: async (data) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.KEYWORD_IN_CITY.UPDATE,
      data
    );

    return response.data;
  },
};

export default keywordInCityService;