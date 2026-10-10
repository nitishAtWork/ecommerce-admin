import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const cityService = {
    getCities: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.CITIES.LIST,
            {
                params,
            }
        );

        return response.data;
    },

    getCitiesFrontend: async () => {
        const response = await apiClient.get(
            API_ENDPOINTS.CITIES.FRONTEND
        );

        return response.data;
    },

    getCityById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.CITIES.GET(id)
        );

        return response.data;
    },

    createCity: async (data) => {
        const response = await apiClient.post(
            API_ENDPOINTS.CITIES.CREATE,
            data
        );

        return response.data;
    },

    updateCity: async (id, data) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.CITIES.UPDATE(id),
            data
        );

        return response.data;
    },

    deleteCity: async (id) => {
        const response = await apiClient.delete(
            API_ENDPOINTS.CITIES.DELETE(id)
        );

        return response.data;
    },

    toggleCityStatus: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.CITIES.TOGGLE_STATUS(id)
        );

        return response.data;
    },
};

export default cityService;