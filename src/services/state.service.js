import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const stateService = {
  getStates: async (params = {}) => {
    const response = await apiClient.get(
      API_ENDPOINTS.STATES.LIST,
      { params }
    );

    return response.data;
  },

  getStatesFrontend: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.STATES.FRONTEND
    );

    return response.data;
  },

  getStateById: async (id) => {
    const response = await apiClient.get(
      API_ENDPOINTS.STATES.GET(id)
    );

    return response.data;
  },

  createState: async (data) => {
    const response = await apiClient.post(
      API_ENDPOINTS.STATES.CREATE,
      data
    );

    return response.data;
  },

  updateState: async (id, data) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.STATES.UPDATE(id),
      data
    );

    return response.data;
  },

  deleteState: async (id) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.STATES.DELETE(id)
    );

    return response.data;
  },

  toggleStateStatus: async (id) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.STATES.TOGGLE_STATUS(id)
    );

    return response.data;
  },
};

export default stateService;