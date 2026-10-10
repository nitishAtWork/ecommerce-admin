import apiClient from "../api/apiClient";

const PAGE_ENDPOINT = "/pages";

export const pageService = {
    getAll: async () => {
        const response = await apiClient.get(PAGE_ENDPOINT);
        return response.data?.data?.pages ?? [];
    },

    getFrontend: async () => {
        const response = await apiClient.get(
            `${PAGE_ENDPOINT}/frontend`
        );
        return response.data?.data ?? [];
    },

    getById: async (id) => {
        const response = await apiClient.get(
            `${PAGE_ENDPOINT}/by-id/${id}`
        );
        return response.data?.data?.page ?? null;
    },

    getBySlug: async (slug) => {
        const response = await apiClient.get(
            `${PAGE_ENDPOINT}/${encodeURIComponent(slug)}`
        );
        return response.data?.data ?? null;
    },

    create: async (formData) => {
        const response = await apiClient.post(
            PAGE_ENDPOINT,
            formData
        );
        return response.data;
    },

    update: async (id, formData) => {
        const response = await apiClient.patch(
            `${PAGE_ENDPOINT}/${id}`,
            formData
        );
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(
            `${PAGE_ENDPOINT}/${id}`
        );
        return response.data;
    },

    toggleStatus: async (id) => {
        const response = await apiClient.patch(
            `${PAGE_ENDPOINT}/${id}/toggle-status`
        );
        return response.data;
    },
};

export default pageService;