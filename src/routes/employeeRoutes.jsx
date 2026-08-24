import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeLayout from "../layouts/EmployeeLayout";

import Dashboard from "../pages/Employee/Dashboard/Dashboard";
import MyTask from "../pages/Employee/Task/Task";
import Renewal from "../pages/Employee/Renewal/Renewal";
import Quotations from "../pages/Employee/Quotations/Quotations";
import Messages from "../pages/Employee/Messages/Messages";
import Attendance from "../pages/Employee/Attendance/Attendance";
import Salary from "../pages/Employee/Salary/Salary";
import Profile from "../pages/Employee/Profile/Profile";


const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route element={<EmployeeLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="task" element={<MyTask />} />
        <Route path="renewal" element={<Renewal />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="messages" element={<Messages />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="salary" element={<Salary />} />
        <Route path="profile" element={<Profile />} />

      </Route>
    </Routes>
  );
};

export default EmployeeRoutes;