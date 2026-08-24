import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import socket from "../socket/socket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

useEffect(() => {
  const connectSocket = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) return;

    socket.auth = {
      userid: user.id,
    };

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
}, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);