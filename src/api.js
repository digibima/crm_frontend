import axios from "axios";
import constant from "./env";

const api = axios.create({
  baseURL: constant.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
     config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // window.location.href = "/";
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