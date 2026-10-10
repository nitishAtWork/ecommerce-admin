import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const reviewService = {
    getReviews: async (params = {}) => {
        const response =
            await apiClient.get(
                API_ENDPOINTS.REVIEWS.LIST,
                {
                    params,
                }
            );

        return response.data;
    },

    getReviewById: async (id) => {
        const response =
            await apiClient.get(
                API_ENDPOINTS.REVIEWS.GET(id)
            );

        return response.data;
    },

    updateReviewStatus: async (
        id,
        status
    ) => {
        const response =
            await apiClient.patch(
                API_ENDPOINTS.REVIEWS.UPDATE_STATUS(
                    id
                ),
                {
                    status,
                }
            );

        return response.data;
    },

    deleteReview: async (id) => {
        const response =
            await apiClient.delete(
                API_ENDPOINTS.REVIEWS.DELETE(id)
            );

        return response.data;
    },
};

export default reviewService;