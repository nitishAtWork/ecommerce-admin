
import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const sessionService = {
    async getActiveSessions() {
        const response = await apiClient.get(
            API_ENDPOINTS.AUTH.ACTIVE_SESSIONS
        );

        return (
            response.data?.sessions ??
            response.data?.data?.sessions ??
            response.data?.data ??
            []
        );
    },

    async logoutSession(sessionId) {
        const response = await apiClient.delete(
            `/auth/sessions/${sessionId}`
        );

        return response.data;
    },

    async logoutAllDevices() {
        const response = await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT_ALL_DEVICES
        );

        return response.data;
    },
};

export default sessionService;
