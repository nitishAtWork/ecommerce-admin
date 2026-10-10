import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";


const customerService = {

    getCustomers: async (params = {}) => {
        const response = await apiClient.get(
            API_ENDPOINTS.CUSTOMERS.LIST,
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

    toggleCustomerStatus: async (id) => {
        const response =
            await apiClient.patch(
                API_ENDPOINTS.CUSTOMERS.TOGGLE_STATUS(
                    id
                )
            );

        return response.data;
    },

};


export default customerService;