import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const productService = {
    getProducts: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.PRODUCTS.LIST,
            { params }
        );

        return response.data;
    },

    getProductBySlug: async (slug) => {
        const response = await apiClient.get(
            API_ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug)
        );

        return response.data;
    },

    getProductById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.PRODUCTS.GET(id)
        );

        return response.data;
    },

    createProduct: async (formData) => {
        const response = await apiClient.post(
            API_ENDPOINTS.PRODUCTS.CREATE,
            formData
        );

        return response.data;
    },

    updateProduct: async (id, formData) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.PRODUCTS.UPDATE(id),
            formData
        );

        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(
            API_ENDPOINTS.PRODUCTS.DELETE(id)
        );

        return response.data;
    },

    toggleProductStatus: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.PRODUCTS.TOGGLE_STATUS(id)
        );

        return response.data;
    },

    deactivateProduct: async (id) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.PRODUCTS.DEACTIVATE(id)
        );
        return response.data;
    }

};

export default productService;