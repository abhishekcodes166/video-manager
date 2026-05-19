import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Try refreshing the access token
                await axios.post("/api/v1/users/refresh-token", {}, { withCredentials: true });
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, user needs to login again
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
