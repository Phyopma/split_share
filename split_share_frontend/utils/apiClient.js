import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_BASE_URL } from "../config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug interceptor for development
if (__DEV__) {
  apiClient.interceptors.request.use((request) => {
    console.log("Request:", request.method.toUpperCase(), request.url);
    return request;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log("Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.log("Error:", error.message, error.config?.url);
      return Promise.reject(error);
    }
  );
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error handling
    if (!error.response) {
      console.error("Network Error Details:", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        baseURL: apiClient.defaults.baseURL,
      });

      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: Platform.select({
          ios: "Unable to connect to server. Please check your internet connection.",
          android: "Connection failed. Please check your internet connection.",
        }),
      });
    }

    // Auth error handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await AsyncStorage.multiRemove(["token", "user"]);
        return Promise.reject({
          ...error,
          isAuthError: true,
        });
      } catch (storageError) {
        console.error("Storage error during auth failure:", storageError);
      }
    }

    // Format error response
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || "An unexpected error occurred",
    });
  }
);

export default apiClient;
