import { Navigate, useLocation } from "react-router-dom";
import { getToken, getRole } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const userRole = getRole()?.toLowerCase();
  const location = useLocation();

  if (!token) {

    sessionStorage.setItem("error", "Please login first.");

    return <Navigate to="/" replace />;
  }

  // Employee Routes
  if (location.pathname.startsWith("/employee")) {

    if (userRole !== "employee") {

      sessionStorage.setItem(
        "error",
        "You are not authorized to access Employee Portal."
      );

      return <Navigate to="/" replace />;
    }
  }

  if (location.pathname.startsWith("/admin")) {

    if (userRole !== "admin" && userRole !== "superadmin") {

      sessionStorage.setItem(
        "error",
        "You are not authorized to access Admin Portal."
      );

      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;