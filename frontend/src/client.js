import axios from "axios";
import {WEBSITE_BASE_URL} from "./config";

// Custom Axios Instance
const client = axios.create({
    baseURL: `${WEBSITE_BASE_URL}`,
    timeout: 10000, // 10-second timeout
    withCredentials: true,
});

// Interceptors for Global Error Handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized access, redirecting...");
            // Redirect to login or handle unauthorized error
        }
        return Promise.reject(error);
    }
);

export default client;