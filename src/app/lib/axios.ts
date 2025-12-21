import axios from "axios";

const api = axios.create({
    baseURL: "https://movie-tracker-api.cap.kylemardell.me/",
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const stored = localStorage.getItem("movieTrackerData");
        if (stored) {
            const data = JSON.parse(stored);
            if (data.accessToken) {
                config.headers.Authorization = `Bearer ${data.accessToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle expired access token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If access token expired and we haven't retried yet
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const stored = localStorage.getItem("movieTrackerData");
            if (!stored) return Promise.reject(error);

            const data = JSON.parse(stored);

            try {
                const refreshResponse = await axios.post(
                    "https://movie-tracker-api.cap.kylemardell.me/api/token/refresh/",
                    { refresh: data.refreshToken }
                );

                const newAccessToken = refreshResponse.data.access;

                // Update localStorage
                const updatedData = {
                    ...data,
                    accessToken: newAccessToken,
                };
                localStorage.setItem(
                    "movieTrackerData",
                    JSON.stringify(updatedData)
                );

                // Update header and retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed → log out
                localStorage.removeItem("movieTrackerData");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
