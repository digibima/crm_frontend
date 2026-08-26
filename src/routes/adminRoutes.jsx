import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import Employees from "../pages/Admin/Employees/Employees";
import TaskManagement from "../pages/Admin/TaskManagement/TaskManagement";
import Renewal from "../pages/Admin/Renewal/Renewal";
import Attendance from "../pages/Admin/Attendance/Attendance";
import ManageHolidays from "../pages/Admin/ManageHolidays/ManageHolidays";
import Salary from "../pages/Admin/Salary/Salary";
import ActivityLog from "../pages/Admin/ActivityLog/ActivityLog";
import Reports from "../pages/Admin/Reports/Reports";
import Profile from "../pages/Admin/Profile/profile";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* /admin -> /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="task-management" element={<TaskManagement />} />
        <Route path="renewal" element={<Renewal />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="manageholidays" element={<ManageHolidays />} />
        <Route path="salary" element={<Salary />} />
        <Route path="activitylog" element={<ActivityLog />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;