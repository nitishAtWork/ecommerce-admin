import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const natureOfBusinessService = {
    getNatureOfBusinesses: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.NATURE_OF_BUSINESS.LIST,
            { params }
        );

        return response.data;
    },

    getNatureOfBusinessesFrontend: async () => {
        const response = await apiClient.get(
            API_ENDPOINTS.NATURE_OF_BUSINESS.FRONTEND
        );

        return response.data;
    },

    getNatureOfBusinessById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.NATURE_OF_BUSINESS.GET(id)
        );

        return response.data;
    },

    createNatureOfBusiness: async (data) => {
        const response = await apiClient.post(
            API_ENDPOINTS.NATURE_OF_BUSINESS.CREATE,
            data
        );

        return response.data;
    },

    updateNatureOfBusiness: async (id, data) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.NATURE_OF_BUSINESS.UPDATE(id),
            data
        );

        return response.data;
    },

    deleteNatureOfBusiness: async (id) => {
        const response = await apiClient.delete(
            API_ENDPOINTS.NATURE_OF_BUSINESS.DELETE(id)
        );

        return response.data;
    },

    toggleNatureOfBusinessStatus: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.NATURE_OF_BUSINESS.TOGGLE_STATUS(id)
        );

        return response.data;
    },
};

export default natureOfBusinessService;