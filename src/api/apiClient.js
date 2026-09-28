import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

/*
 * Prevent multiple refresh requests
 * when several API calls receive 401
 * at the same time.
 */
let isRefreshing = false;

let refreshSubscribers = [];

/*
 * Add request to refresh queue
 */
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

/*
 * Notify queued requests
 */
const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => {
        callback(token);
    });

    refreshSubscribers = [];
};

/*
 * Reject queued requests
 */
const onRefreshFailed = (error) => {
    refreshSubscribers.forEach((callback) => {
        callback(null, error);
    });

    refreshSubscribers = [];
};

/*
 * Attach access token
 */
apiClient.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("adminToken");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        /*
         * IMPORTANT:
         *
         * Do NOT set Content-Type here.
         *
         * Axios will automatically set:
         *
         * multipart/form-data; boundary=...
         *
         * when FormData is used.
         */
        return config;
    },
    (error) => Promise.reject(error)
);

/*
 * Handle API responses
 */
apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest =
            error.config;

        /*
         * Only handle 401
         */
        if (
            error.response?.status !== 401
        ) {
            return Promise.reject(error);
        }

        /*
         * Don't retry the same request
         */
        if (originalRequest?._retry) {
            return Promise.reject(error);
        }

        /*
         * Don't try to refresh the refresh request
         */
        if (
            originalRequest?.url?.includes(
                "/auth/refresh"
            )
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        /*
         * If another request is already refreshing,
         * wait for it.
         */
        if (isRefreshing) {
            return new Promise(
                (resolve, reject) => {
                    subscribeTokenRefresh(
                        (
                            newToken,
                            refreshError
                        ) => {
                            if (
                                refreshError ||
                                !newToken
                            ) {
                                reject(
                                    refreshError ||
                                        new Error(
                                            "Token refresh failed"
                                        )
                                );

                                return;
                            }

                            originalRequest.headers.Authorization =
                                `Bearer ${newToken}`;

                            resolve(
                                apiClient(
                                    originalRequest
                                )
                            );
                        }
                    );
                }
            );
        }

        isRefreshing = true;

        try {
            /*
             * Ask backend for a new access token.
             *
             * Refresh token is sent automatically
             * as an HttpOnly cookie.
             */
            const response =
                await apiClient.post(
                    "/auth/refresh"
                );

            const data = response.data;

            /*
             * Support common response structures
             */
            const newToken =
                data.accessToken ||
                data.token ||
                data.data?.accessToken ||
                data.data?.token;

            if (!newToken) {
                throw new Error(
                    "New access token was not returned."
                );
            }

            /*
             * Save new access token
             */
            localStorage.setItem(
                "adminToken",
                newToken
            );

            /*
             * Resolve queued requests
             */
            onTokenRefreshed(newToken);

            /*
             * Retry original request
             */
            originalRequest.headers.Authorization =
                `Bearer ${newToken}`;

            return apiClient(
                originalRequest
            );
        } catch (refreshError) {
            /*
             * Refresh token is invalid/expired.
             * Now logout.
             */
            onRefreshFailed(
                refreshError
            );

            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "adminUser"
            );

            if (
                window.location.pathname !==
                "/admin/login"
            ) {
                window.location.href =
                    "/admin/login";
            }

            return Promise.reject(
                refreshError
            );
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;