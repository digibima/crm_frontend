import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import AdminLogin from "./pages/Admin/Login/Login";
import EmployeeLogin from "./pages/Employee/Login/Login";

import AdminRoutes from "./routes/adminRoutes";
import EmployeeRoutes from "./routes/employeeRoutes";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />

        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        <Route
          path="/employee/login"
          element={
            <PublicRoute>
              <EmployeeLogin />
            </PublicRoute>
          }
        />

        {/* Admin Protected */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Employee Protected */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute role="employee">
              <EmployeeRoutes />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;