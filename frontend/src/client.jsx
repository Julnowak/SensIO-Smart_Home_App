import axios from "axios";
import { API_BASE_URL } from "./config.jsx";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "true" // Always include for ngrok
  }
});

// Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Request interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only add ngrok header for ngrok URLs
  if (config.baseURL.includes('ngrok-free.app')) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh: refreshToken
        }, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        });

        localStorage.setItem("accessToken", data.access);
        client.defaults.headers.Authorization = `Bearer ${data.access}`;

        onRefreshed(data.access);
        return client(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;