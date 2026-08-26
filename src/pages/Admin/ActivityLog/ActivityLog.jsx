import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  FaHistory,
  FaSearch,
  FaSyncAlt,
  FaFilter,
  FaSignInAlt,
  FaSignOutAlt,
  FaCog,
  FaTimesCircle,
  FaClock,
  FaChevronDown,
  FaTasks,
  FaEye,
} from "react-icons/fa";

import { CallApi } from "../../../api";
import Modal from "../../../components/Modal";

const moduleOptions = ["All Modules", "Authentication", "Tasks"];
const statusOptions = ["All Status", "Success", "Failed", "Pending", "In Progress", "Completed"];
const typeOptions = ["All Activities", "Login", "Task"];

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("All Modules");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Activities");
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = activeTab === "login" 
        ? `/api/employee-login-logs` 
        : `/api/tasks/logs`;

      const response = await CallApi(apiUrl, "GET");

      if (response?.status && response?.data) {
        const rawLogs = response.data.data?.data || response.data.data || response.data || [];

        if (activeTab === "login") {
          const mappedLogs = rawLogs.map((item) => {
            const loginDateObj = item.loginAt ? new Date(item.loginAt) : new Date();

            return {
              id: item.id,
              user: item.user?.name || "Unknown",
              role: item.user?.designation ? item.user.designation.toUpperCase() : "Employee",
              initials: item.user?.name
                ? item.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                : "US",
              action: "Login",
              description: `Logged in from IP ${item.ip || "N/A"} (${item.userAgent || "N/A"})`,
              module: "Authentication",
              type: "Login",
              status: "Success",
              time: loginDateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              date: loginDateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            };
          });
          setActivities(mappedLogs);
        } else {
          const mappedLogs = rawLogs.map((item) => {
            const taskDateObj = item.createdAt || item.updatedAt ? new Date(item.createdAt || item.updatedAt) : new Date();

            return {
              id: item.id || item.taskId,
              user: item.userName || item.assignedTo || item.user?.name || "Unknown",
              role: item.role || item.user?.designation || "Task Assignee",
              initials: (item.userName || item.user?.name || "TS")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
              action: item.action || item.title || "Task Activity",
              description: item.description || item.remark || `Task status updated to ${item.status || "Updated"}`,
              module: "Tasks",
              type: "Task",
              status: item.status || "Completed",
              time: taskDateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              date: taskDateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            };
          });
          setActivities(mappedLogs);
        }
      }
    } catch (err) {
      console.error("Activity Log API error:", err);
      setError(`Failed to fetch ${activeTab === "login" ? "login" : "task"} logs`);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchActivityLogs();
    setCurrentPage(1);
  }, [fetchActivityLogs]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, module, status, type]);

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.user?.toLowerCase().includes(searchValue) ||
        item.action?.toLowerCase().includes(searchValue) ||
        item.description?.toLowerCase().includes(searchValue) ||
        item.module?.toLowerCase().includes(searchValue);

      const matchesModule = module === "All Modules" || item.module === module;
      const matchesStatus = status === "All Status" || item.status === status;
      const matchesType = type === "All Activities" || item.type === type;

      return matchesSearch && matchesModule && matchesStatus && matchesType;
    });
  }, [activities, search, module, status, type]);

  // Pagination Calculations
  const totalEntries = filteredActivities.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalEntries);

  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);
  }, [filteredActivities, indexOfFirstItem, itemsPerPage]);

  const getActivityIcon = (action) => {
    const icons = {
      Login: <FaSignInAlt />,
      Logout: <FaSignOutAlt />,
      Profile: <FaCog />,
      Task: <FaTasks />,
    };
    return icons[action] || (activeTab === "task" ? <FaTasks /> : <FaHistory />);
  };

  const getModuleClass = (moduleName) => {
    const classes = {
      Authentication: "bg-indigo-50 text-indigo-600",
      Tasks: "bg-amber-50 text-amber-600",
    };
    return classes[moduleName] || "bg-slate-100 text-slate-600";
  };

  const getStatusClass = (statusValue) => {
    if (["Success", "Completed"].includes(statusValue)) {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    if (["Failed", "Cancelled"].includes(statusValue)) {
      return "bg-red-50 text-red-600 border-red-100";
    }
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200">
            <FaHistory size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Activity Log
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor user authentication and task updates across your CRM
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          onClick={fetchActivityLogs}
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* TABS SWITCHER */}
      <div className="mb-6 flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "login"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaSignInAlt />
          Login Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("task")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "task"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaTasks />
          Task Timestamp Logs
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity, user, description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-xs text-slate-400" />
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-10 text-sm text-slate-600 outline-none focus:border-indigo-400 sm:w-48"
            >
              {moduleOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 pr-10 text-sm text-slate-600 outline-none focus:border-indigo-400 sm:w-48"
            >
              {typeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 pr-10 text-sm text-slate-600 outline-none focus:border-indigo-400 sm:w-40"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          </div>
        </div>
      </div>

      {/* ACTIVITY TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:px-6">
          <div>
            <h2 className="font-semibold text-slate-800">
              {activeTab === "login" ? "Recent Login Activities" : "Recent Task Timestamp Logs"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">Latest actions performed by users</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {totalEntries} Records
          </span>
        </div>

        <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-3 lg:grid lg:grid-cols-12 lg:gap-4">
          <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">User</div>
          <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Activity</div>
          <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Module</div>
          <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date & Time</div>
          <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</div>
          <div className="col-span-1 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="flex items-center justify-center px-5 py-16 text-slate-500">
              <FaSyncAlt className="mr-2 animate-spin text-indigo-600" /> Loading logs...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-red-500">
              <FaTimesCircle className="mb-2 text-2xl" />
              <p>{error}</p>
            </div>
          ) : paginatedActivities.length > 0 ? (
            paginatedActivities.map((item, index) => (
              <div
                key={item.id || index}
                className="group px-5 py-4 transition hover:bg-slate-50/70 lg:px-6"
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-4">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {item.user}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        {getActivityIcon(item.action)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700">
                          {item.action}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-semibold ${getModuleClass(
                        item.module
                      )}`}
                    >
                      {item.module}
                    </span>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-sm font-medium text-slate-600">
                      {item.time}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.date}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        item.status
                      )}`}
                    >
                      <FaClock />
                      {item.status}
                    </span>
                  </div>

                  <div className="lg:col-span-1 lg:flex lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(item)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <FaEye />
                      <span className="lg:hidden">View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FaHistory size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-700">No activities found</h3>
              <p className="mt-1 text-sm text-slate-400">Try changing your search or filters.</p>
            </div>
          )}
        </div>

        {/* PAGINATION BAR */}
        {!loading && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs font-medium text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-700">{totalEntries === 0 ? 0 : indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold text-slate-700">{indexOfLastItem}</span> of{" "}
              <span className="font-bold text-slate-700">{totalEntries}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${
                    currentPage === index + 1
                      ? "bg-[#00a896] border-[#00a896] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title={`Activity Details #${selectedActivity?.id || ""}`}
        widthClass="sm:w-[550px]"
      >
        {selectedActivity && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-white">
                {selectedActivity.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedActivity.user}</p>
                <p className="text-xs text-slate-400">{selectedActivity.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Activity</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedActivity.action}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Module</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedActivity.module}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedActivity.date}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Time</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedActivity.time}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                {selectedActivity.description}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                  selectedActivity.status
                )}`}
              >
                <FaClock />
                {selectedActivity.status}
              </span>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLog;