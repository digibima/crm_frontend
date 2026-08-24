import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../utils/auth";

const PublicRoute = ({ children }) => {
  const token = getToken();
  const role = getRole();

  if (!token) return children;

  switch (role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;

    case "employee":
      return <Navigate to="/employee/dashboard" replace />;

    case "superadmin":
      return <Navigate to="/super-admin/dashboard" replace />;

    default:
      return children;
  }
};

export default PublicRoute;