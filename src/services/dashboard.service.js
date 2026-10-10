import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const dashboardService = {
    getDashboard: async (period = "7d") => {
        const response = await apiClient.get(
            API_ENDPOINTS.DASHBOARD.STATS,
            {
                params: {
                    period,
                },
            }
        );

        return response.data;
    },
};

export default dashboardService;