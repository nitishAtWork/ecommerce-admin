import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const keywordService = {
    getKeywords: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.KEYWORDS.LIST,
            { params }
        );

        return response.data;
    },

    getKeywordsFrontend: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.KEYWORDS.FRONTEND,
            { params }
        );

        return response.data;
    },

    getKeywordBySlug: async (slug) => {
        const response = await apiClient.get(
            API_ENDPOINTS.KEYWORDS.GET_BY_SLUG(slug)
        );

        return response.data;
    },

    getKeywordById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.KEYWORDS.GET(id)
        );

        return response.data;
    },

    createKeyword: async (formData) => {
        const response = await apiClient.post(
            API_ENDPOINTS.KEYWORDS.CREATE,
            formData
        );

        return response.data;
    },

    updateKeyword: async (id, formData) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.KEYWORDS.UPDATE(id),
            formData
        );

        return response.data;
    },

    deleteKeyword: async (id) => {
        const response = await apiClient.delete(
            API_ENDPOINTS.KEYWORDS.DELETE(id)
        );

        return response.data;
    },

    toggleKeywordStatus: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.KEYWORDS.TOGGLE_STATUS(id)
        );

        return response.data;
    },

    deactivateKeyword: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.KEYWORDS.DEACTIVATE(id)
        );

        return response.data;
    },
};

export default keywordService;
