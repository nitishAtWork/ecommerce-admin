
import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const loginActivityService = {
    async getLoginActivity() {
        const response = await apiClient.get(
            API_ENDPOINTS.AUTH.LOGIN_ACTIVITY
        );

        return response.data?.sessions ?? [];
    },
};

export default loginActivityService;
