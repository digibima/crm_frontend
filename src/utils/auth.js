import { CallApi } from "../api";
import constant from "../env";
import socket from "../socket/socket";

export const getToken = () => localStorage.getItem("token");
export const getRole = () => localStorage.getItem("role");
export const getUser = () => localStorage.getItem("user");

export const isLoggedIn = () => !!getToken();

export const logout = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await CallApi(constant.API.LOGOUT, "POST", {
        token,
      });
    }
  } catch (error) {
    console.error("Logout API Error:", error);
  } finally {
    // ✅ Socket Disconnect
    if (socket.connected) {
      socket.disconnect();
    }

    // ✅ Clear Local Storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  }
};