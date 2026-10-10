import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const countryService = {
    /**
     * Get all countries
     */
    getCountries: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.COUNTRIES.LIST,
            {
                params,
            }
        );

        return response.data;
    },

    /**
     * Get active countries for frontend
     */
    getCountriesFrontend: async () => {
        const response = await apiClient.get(
            API_ENDPOINTS.COUNTRIES.FRONTEND
        );

        return response.data;
    },

    /**
     * Get single country
     */
    getCountryById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.COUNTRIES.GET(id)
        );

        return response.data;
    },

    /**
     * Create country
     *
     * Do not send slug.
     * Backend generates it from name.
     */
    createCountry: async (data) => {
        const response = await apiClient.post(
            API_ENDPOINTS.COUNTRIES.CREATE,
            data
        );

        return response.data;
    },

    /**
     * Update country
     *
     * Do not send slug.
     * Backend should regenerate it when name changes.
     */
    updateCountry: async (id, data) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.COUNTRIES.UPDATE(id),
            data
        );

        return response.data;
    },

    /**
     * Delete country
     */
    deleteCountry: async (id) => {
        const response = await apiClient.delete(
            API_ENDPOINTS.COUNTRIES.DELETE(id)
        );

        return response.data;
    },

    /**
     * Toggle active status
     */
    toggleCountryStatus: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.COUNTRIES.TOGGLE_STATUS(id)
        );

        return response.data;
    },
};

export default countryService;