import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import navigation from "../constants/navigation";

const EmployeeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">

      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
          <Sidebar
        menu={navigation.employee.sidebar}
        onClose={() => setIsSidebarOpen(false)}
          user={user}
        
      />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header
          config={navigation.employee.header}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;