import axios from "axios";
import constant from "./env";

const api = axios.create({
  baseURL: constant.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function: LocalStorage Clear karne ke liye
const clearAuthAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("login_time");
  
  // User ko uske role ke hisab se ya default login page par bhej do
  window.location.href = "/";
};

// 1. Request Interceptor: Token & 12-Hour Expiry Pre-Check
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const loginTime = localStorage.getItem("login_time");

    if (token) {
      if (loginTime) {
        const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 Ghante Milliseconds me
        const currentTime = new Date().getTime();

        // Agar 12 Ghante beet chuke hain
        if (currentTime - Number(loginTime) > TWELVE_HOURS_MS) {
          clearAuthAndRedirect();
          return Promise.reject(
            new axios.Cancel("Session expired (12 hours limit reached). Please login again.")
          );
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Server 401 Response Backup Check
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Login ya OTP end-points ke 401 error par redirect na ho
    const isAuthEndpoint = requestUrl.includes("login") || requestUrl.includes("send-otp") || requestUrl.includes("verify-otp");

    if (status === 401 && !isAuthEndpoint) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  }
);

export const CallApi = async (
  url,
  method = "POST",
  data = null,
  headers = {}
) => {
  try {
    const response = await api({
      url,
      method,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Alag function Multipart / File upload ke liye
export const CallApiWithFile = async (
  url,
  method = "POST",
  data = null,
  headers = {}
) => {
  try {
    const response = await api({
      url,
      method,
      data,
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;