import { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "../socket/socket";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

const normalizeNotification = (item) => ({
  id: item.id || item._id,
  taskId: item.taskId || item.taskid,
  title: item.title || "Notification",
  message: item.message || "",
  read: Boolean(item.isRead === 1 || item.read === true),
  timestamp: item.createdAt || item.timestamp || new Date().toISOString(),
  user: item.user || null, // Preserve employee user details for Admin
  ...item,
});
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user.id) return;

      const isAdmin = user.role === "admin" || user.isAdmin === true;
      const endpoint = isAdmin
        ? "/api/admin/notifications"
        : "/api/notifications";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        const responseData = response.data.data;

        // Admin aur Employee dono responses ko check karne ke liye logic
        const rawList = Array.isArray(responseData)
          ? responseData
          : responseData?.notifications || [];

        const normalized = rawList.map(normalizeNotification);
        setNotifications(normalized);

        // Unread count ke liye check (Employee: unreadCount, Admin: totalUnread)
        const count =
          typeof responseData?.totalUnread === "number"
            ? responseData.totalUnread
            : typeof response.data?.unreadCount === "number"
            ? response.data.unreadCount
            : normalized.filter((n) => !n.read).length;

        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true, isRead: 1 } : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true, isRead: 1 }))
      );
      setUnreadCount(0);

      const token = localStorage.getItem("token");
      await axios.patch(
        "/api/notifications/mark-all-read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      fetchNotifications();
    }
  };

  const addNotification = (rawNotification) => {
    const formatted = normalizeNotification(rawNotification);
    setNotifications((prev) => [formatted, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    const connectSocket = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user.id) return;

      fetchNotifications();

      socket.auth = { userid: user.id };

      if (!socket.connected) {
        socket.connect();
      }
    };

    connectSocket();

    window.addEventListener("user-login", connectSocket);

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    socket.on("notification-received", (data) => {
      console.log("notification-received:", data);
      addNotification(data);
    });

    return () => {
      window.removeEventListener("user-login", connectSocket);

      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("notification-received");
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);