import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";


const adminService = {

    getAdmins: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.ADMINS.LIST,
            {
                params,
            }
        );

        return response.data;
    },


    getCustomerById: async (id) => {
        const response = await apiClient.get(
            API_ENDPOINTS.CUSTOMERS.GET(id)
        );

        return response.data;
    },


    updateCustomer: async (
        id,
        data
    ) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.CUSTOMERS.UPDATE(id),
            data
        );

        return response.data;
    },

    toggleAdminStatus: async (id) => {
        const response =
            await apiClient.patch(
                API_ENDPOINTS.ADMINS.TOGGLE_STATUS(
                    id
                )
            );

        return response.data;
    },

    toggleAdminRole: async (id, role) => {
        const response = await apiClient.patch(
            API_ENDPOINTS.ADMINS.TOGGLE_ROLE(id),
            { role }
        );

        return response.data;
    },

};


export default adminService;