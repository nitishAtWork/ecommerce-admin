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

    KEYWORDS: {
        LIST: "/keywords",
        CREATE: "/keywords",

        GET: (id) =>
            `/keywords/by-id/${id}`,

        GET_BY_SLUG: (slug) =>
            `/keywords/${slug}`,

        UPDATE: (id) =>
            `/keywords/${id}`,

        DELETE: (id) =>
            `/keywords/${id}`,

        DEACTIVATE: (id) =>
            `/keywords/${id}/deactivate`,

        TOGGLE_STATUS: (id) =>
            `/keywords/${id}/toggle-status`,
    },

    ORDERS: {
        LIST: "/orders/admin",
        GET: (id) => `/orders/admin/${id}`,
        UPDATE_STATUS: (id) => `/orders/admin/${id}/status`,
    },

    CUSTOMERS: {
        LIST: "/users/admin",

        GET: (id) =>
            `/users/admin/${id}`,

        UPDATE: (id) =>
            `/users/admin/${id}`,

        TOGGLE_STATUS: (id) =>
            `/users/admin/${id}/toggle-status`,
    },

    WEBSITE: {
        SETTINGS: "/website",
        UPDATE: "/website",
    },

    DASHBOARD: {
        STATS: "/dashboard",
    },

    REVIEWS: {
        LIST: "/reviews/admin",

        GET: (id) =>
            `/reviews/admin/${id}`,

        UPDATE_STATUS: (id) =>
            `/reviews/admin/${id}/status`,

        DELETE: (id) =>
            `/reviews/admin/${id}`,
    },

    COUNTRIES: {
        LIST: "/countries",
        CREATE: "/countries",
        GET: (id) => `/countries/by-id/${id}`,
        UPDATE: (id) => `/countries/${id}`,
        DELETE: (id) => `/countries/${id}`,
        TOGGLE_STATUS: (id) =>
            `/countries/${id}/toggle-status`,
        FRONTEND: "/countries/frontend",
    },

    STATES: {
        LIST: "/states",
        CREATE: "/states",
        GET: (id) => `/states/by-id/${id}`,
        UPDATE: (id) => `/states/${id}`,
        DELETE: (id) => `/states/${id}`,
        TOGGLE_STATUS: (id) => `/states/${id}/toggle-status`,
        FRONTEND: "/states/frontend",
    },

    CITIES: {
        LIST: "/cities",
        CREATE: "/cities",
        GET: (id) => `/cities/by-id/${id}`,
        UPDATE: (id) => `/cities/${id}`,
        DELETE: (id) => `/cities/${id}`,
        TOGGLE_STATUS: (id) => `/cities/${id}/toggle-status`,
        FRONTEND: "/cities/frontend",
    },

    NATURE_OF_BUSINESS: {
        LIST: "/nature-of-business",

        CREATE: "/nature-of-business",

        GET: (id) => `/nature-of-business/by-id/${id}`,

        UPDATE: (id) => `/nature-of-business/${id}`,

        DELETE: (id) => `/nature-of-business/${id}`,

        TOGGLE_STATUS: (id) =>
            `/nature-of-business/${id}/toggle-status`,

        FRONTEND: "/nature-of-business/frontend",
    },

    KEYWORD_IN_CITY: {
        GET: "/keyword-in-city",
        UPDATE: "/keyword-in-city",
    },

    OUR_PRESENCE: {
        GET: "/our-presence",
        UPDATE: "/our-presence",
    },

    ENQUIRIES: {
        LIST: "/enquiries",
        GET: (id) => `/enquiries/${id}`,
        UPDATE: (id) => `/enquiries/${id}`,
        DELETE: (id) => `/enquiries/${id}`,
        READ: (id) => `/enquiries/${id}/read`,
        TOGGLE_READ: (id) => `/enquiries/${id}/toggle-read`,
    },

};