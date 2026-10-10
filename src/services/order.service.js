import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const orderService = {
    getOrders: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.ORDERS.LIST,
            {
                params,
            }
        );

        return response.data;
    },

    getOrderById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.ORDERS.GET(id)
        );

        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        console.log("Updating order status:", {
            id,
            status,
            url: API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
        });

        const response = await apiClient.patch(
            API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
            {
                status,
            }
        );

        return response.data;
    },
};

export default orderService;