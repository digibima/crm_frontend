import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiChevronDown,
  FiX,
  FiFilter,
  FiEdit3
} from "react-icons/fi";
import constant from "../../../env";
import { CallApi } from "../../../api";
import { toast } from "react-toastify";

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, widthClass = "sm:w-[500px]", children }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 select-none transition-all duration-300 ease-out ${isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`bg-white w-full rounded-3xl shadow-xl border border-slate-100 z-10 overflow-hidden transition-all duration-300 ease-out ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"} ${widthClass}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-120px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const RenewalManagement = () => {
  const [renewalTasks, setRenewalTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const itemsPerPage = 10;

  // View Details Modal State
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    status: "pending",
    taskAction: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRenewalTasks();
  }, [currentPage]);

  // Updated fetchRenewalTasks to accept optional parameter overrides
  const fetchRenewalTasks = async (overrideParams = null) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      // Priority: use overrideParams if passed (for instant clear action), otherwise use state values
      const search = overrideParams ? overrideParams.searchTerm : searchTerm;
      const status = overrideParams ? overrideParams.filterStatus : filterStatus;
      const fromDate = overrideParams ? overrideParams.filterFromDate : filterFromDate;
      const toDate = overrideParams ? overrideParams.filterToDate : filterToDate;
      const page = overrideParams ? overrideParams.page : currentPage;

      if (search) params.append("clientName", search);
      if (status) params.append("status", status);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      
      params.append("page", page);
      params.append("perPage", itemsPerPage);

      const apiUrl = `/api/employee/tasks/renewal?${params.toString()}`;
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        setRenewalTasks(response.data.data || []);
        const meta = response.data.meta || {};
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || (response.data.data?.length || 0));
      } else {
        setRenewalTasks([]);
        setTotalPages(1);
        setTotalEntries(0);
      }
    } catch (error) {
      toast.error("Unable to load renewal data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchButtonClick = () => {
    if (currentPage === 1) {
      fetchRenewalTasks();
    } else {
      setCurrentPage(1);
    }
  };

  // Clear All Filters & Instantly Fetch Page 1 Data
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterFromDate("");
    setFilterToDate("");
    setCurrentPage(1);

    // Explicitly pass empty parameters to fetch Page 1 data immediately
    fetchRenewalTasks({
      searchTerm: "",
      filterStatus: "",
      filterFromDate: "",
      filterToDate: "",
      page: 1
    });
  };

  // Open Edit Modal with Pre-filled Task Details
  const handleOpenEditModal = (task) => {
    setEditFormData({
      id: task.id,
      status: task.status || "pending",
      taskAction: task.taskAction || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Form Submission
  const handleUpdateRenewal = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const apiUrl = `/api/tasks/renewal/${editFormData.id}`;
      const payload = {
        status: editFormData.status,
        taskAction: editFormData.taskAction
      };

      const response = await CallApi(apiUrl, "PUT", payload);

      if (response && (response.status || response.success)) {
        toast.success("Renewal status updated successfully!");
        setIsEditModalOpen(false);
        fetchRenewalTasks(); // Table refresh
      } else {
        toast.error(response?.message || "Failed to update renewal status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the renewal");
    } finally {
      setIsUpdating(false);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + renewalTasks.length;

  return (
    <div className="space-y-6 select-none">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Renewal Management
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">
            Track and monitor active or pending insurance policy renewals
          </p>
        </div>
      </div>

      {/* Filter UI Panel */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-end gap-4 w-full">
        {/* Client Name Input */}
        <div className="w-full xl:w-72 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Client Name / Search
          </label>
          <div className="relative w-full">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Client Name, Policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchButtonClick();
              }}
              className="w-full h-11 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a896] focus:bg-white outline-none transition"
            />
          </div>
        </div>

        {/* From Date Input */}
        <div className="w-full xl:w-48 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            From Date
          </label>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        {/* To Date Input */}
        <div className="w-full xl:w-48 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            To Date
          </label>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full xl:w-48 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Status
          </label>
          <div className="relative w-full">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="renewed">Renewed</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <FiChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 mt-2 xl:mt-0">
          <button
            type="button"
            disabled={loading}
            onClick={handleSearchButtonClick}
            className="flex-1 xl:flex-none h-11 px-6 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <FiFilter size={15} />
            {loading ? "Searching..." : "Search"}
          </button>

          {(filterFromDate || filterToDate || searchTerm || filterStatus) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-2 transition cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Renewal Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <th className="py-4 px-6">Client Name</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Policy Number</th>
                <th className="py-4 px-4">Insurance Type</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Renewal Target Date</th>
                <th className="py-4 px-4">Renewal Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400 font-medium">
                    Loading renewal schedules...
                  </td>
                </tr>
              )}

              {!loading && renewalTasks.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400 font-medium">
                    No renewal data available matching the criteria.
                  </td>
                </tr>
              )}

              {!loading &&
                renewalTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-900 font-bold">
                      {task.clientName || "—"}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {task.clientContactNumber || "—"}
                    </td>
                    <td className="py-4 px-4 text-[#00a896] font-bold tracking-wider">
                      {task.policyNumber || "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                        {task.insuranceCategory?.name || task.insuranceSubCategory?.category?.name || task.insuranceSubCategory?.name || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-bold">
                      {task.amount ? `₹${Number(task.amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      {task.renewalDate
                        ? task.renewalDate.split("T")[0].split("-").reverse().join("-")
                        : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold tracking-wide border ${
                          task.status === "renewed" || task.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {task.status ? task.status.replace(/_/g, " ").toUpperCase() : "PENDING"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Action Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRenewal(task);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#00a896] hover:bg-slate-50 rounded-lg transition cursor-pointer"
                          title="View Full Details"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* Edit Action Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          title="Edit Renewal Status"
                        >
                          <FiEdit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="text-slate-700 font-bold">{totalEntries === 0 ? 0 : indexOfFirstItem + 1}</span> to{" "}
              <span className="text-slate-700 font-bold">{indexOfLastItem}</span> of{" "}
              <span className="text-slate-700 font-bold">{totalEntries}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
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
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedRenewal(null); }} title="Policy Renewal Summary">
        {selectedRenewal && (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Name</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRenewal.clientName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy Number</p>
                <p className="font-mono font-bold text-[#00a896] mt-0.5">{selectedRenewal.policyNumber || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Amount</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRenewal.amount ? `₹${Number(selectedRenewal.amount).toLocaleString()}` : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renewal Target Date</p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {selectedRenewal.renewalDate ? selectedRenewal.renewalDate.split("T")[0].split("-").reverse().join("-") : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category / Sub-Category</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRenewal.insuranceCategory?.name || "—"} ({selectedRenewal.insuranceSubCategory?.name || "—"})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renewal Status</p>
                <p className={`font-bold mt-0.5 text-xs uppercase ${selectedRenewal.status === "renewed" || selectedRenewal.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                  {selectedRenewal.status === "renewed" || selectedRenewal.status === "completed" ? "Renewed / Processed" : "Pending Action"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Description / Instructions</p>
              <p className="bg-slate-50 p-3 rounded-xl text-slate-700 font-medium mt-1.5 leading-relaxed">
                {selectedRenewal.taskAction || "No special dynamic instructions provided."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => { setIsViewModalOpen(false); setSelectedRenewal(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Renewal Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Renewal Task">
        <form onSubmit={handleUpdateRenewal} className="space-y-4">
          {/* Renewal Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Renewal Status
            </label>
            <div className="relative">
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full h-11 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="renewed">Renewed</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Action / Remarks Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Task Action / Remarks
            </label>
            <textarea
              rows={4}
              placeholder="Add details about renewal action, follow-ups or notes..."
              value={editFormData.taskAction}
              onChange={(e) => setEditFormData({ ...editFormData, taskAction: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:border-[#00a896] focus:bg-white outline-none transition resize-none"
            />
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 bg-[#00a896] hover:bg-[#008f80] disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RenewalManagement;