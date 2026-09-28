export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
    },

    PRODUCTS: {
        LIST: "/products",
        CREATE: "/products",
        GET: (id) => `/products/by-id/${id}`,
        GET_BY_SLUG: (slug) =>
            `/products/${slug}`,
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`,
        DEACTIVATE: (id) =>
            `/products/${id}/deactivate`,
        TOGGLE_STATUS: (id) =>
            `/products/${id}/toggle-status`,
    },

    ORDERS: {
        LIST: "/orders",
        GET: (id) => `/orders/${id}`,
        UPDATE: (id) => `/orders/${id}`,
    },

    CUSTOMERS: {
        LIST: "/users",
        GET: (id) => `/users/${id}`,
    },

    WEBSITE: {
        SETTINGS: "/website",
        UPDATE: "/website",
    },
};