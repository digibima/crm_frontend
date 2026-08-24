import React, { useState, useEffect } from "react";
import {
    FaCalendarAlt,
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaExclamationTriangle,
} from "react-icons/fa";
import { CallApi } from "../../../api";

export default function HolidayManagement() {
    const [holidays, setHolidays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State matching API payload fields
    const [formData, setFormData] = useState({
        title: "",
        holidayDate: "",
        type: "public",
        department: "All",
        status: "Active",
    });

    // 1. Fetch Holiday List from API
    const fetchHolidays = async () => {
        setFetching(true);
        try {
            const response = await CallApi("/api/admin/holidays", "GET");
            if (response && response.status && Array.isArray(response.data)) {
                setHolidays(response.data);
            }
        } catch (error) {
            console.error("Error fetching holidays:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Helper to format date for display
    const formatHolidayDate = (dateStr) => {
        if (!dateStr) return { formattedDate: "-", dayName: "-" };
        const selectedDate = new Date(dateStr);
        const dayName = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
        });
        const formattedDate = selectedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        return { formattedDate, dayName };
    };

    // Open Modal for Creating
    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({
            title: "",
            holidayDate: "",
            type: "public",
            department: "All",
            status: "Active",
        });
        setIsModalOpen(true);
    };

    // Open Modal for Editing and Pre-fill form
    const handleOpenEditModal = (holiday) => {
        setEditingId(holiday.id);

        const formattedDateInput = holiday.holidayDate
            ? holiday.holidayDate.split("T")[0]
            : "";

        setFormData({
            title: holiday.title || holiday.holidayName || "",
            holidayDate: formattedDateInput,
            type: holiday.type || "public",
            department: holiday.department || "All",
            status: holiday.status || "Active",
        });

        setIsModalOpen(true);
    };

    // Close Add/Edit Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            title: "",
            holidayDate: "",
            type: "public",
            department: "All",
            status: "Active",
        });
    };

    // Open Delete Confirmation Modal
    const handleOpenDeleteModal = (id) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    // Close Delete Confirmation Modal
    const handleCloseDeleteModal = () => {
        setDeleteTargetId(null);
        setIsDeleteModalOpen(false);
    };

    // 2. Create / Update Holiday (POST or PUT API Request)
    const handleSaveHoliday = async (e) => {
        e.preventDefault();
        setLoading(true);

        // isPaid is always set to true
        const payload = {
            title: formData.title,
            holidayDate: formData.holidayDate,
            type: formData.type,
            isPaid: true,
        };

        try {
            let response;
            if (editingId) {
                const updateUrl = `/api/admin/holidays/${editingId}`;
                response = await CallApi(updateUrl, "PUT", payload);
            } else {
                const createUrl = "/api/admin/holidays";
                response = await CallApi(createUrl, "POST", payload);
            }

            if (response && (response.status || response.id || response.success)) {
                await fetchHolidays();
                handleCloseModal();
            } else {
                alert("Failed to save holiday details. Please try again.");
            }
        } catch (error) {
            console.error("Error saving holiday:", error);
            alert("An error occurred while saving the holiday: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Confirm Delete Holiday
    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        setDeleting(true);

        try {
            const deleteUrl = `/api/admin/holidays/${deleteTargetId}`;
            const response = await CallApi(deleteUrl, "DELETE");

            if (response && (response.status || response.success || response.ok)) {
                await fetchHolidays();
                handleCloseDeleteModal();
            } else {
                alert("Failed to delete holiday. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting holiday:", error);
            alert("An error occurred while deleting the holiday: " + error.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-600" />
                        Holiday Management
                    </h1>
                    <p className="text-slate-500 mt-2">Manage company holidays.</p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                    <FaPlus />
                    Add Holiday
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow">
                    <p className="text-gray-500">Total Holidays</p>
                    <h2 className="text-3xl font-bold mt-2">{holidays.length}</h2>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow">
                    <p className="text-gray-500">National / Public</p>
                    <h2 className="text-3xl font-bold mt-2 text-blue-600">
                        {
                            holidays.filter(
                                (h) =>
                                    h.type === "public" ||
                                    (h.holidayType &&
                                        h.holidayType.toLowerCase().includes("national"))
                            ).length
                        }
                    </h2>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow">
                    <p className="text-gray-500">Festival</p>
                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                        {
                            holidays.filter(
                                (h) =>
                                    h.type === "festival" ||
                                    (h.holidayType &&
                                        h.holidayType.toLowerCase().includes("festival"))
                            ).length
                        }
                    </h2>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow">
                    <p className="text-gray-500">Optional</p>
                    <h2 className="text-3xl font-bold mt-2 text-orange-500">
                        {
                            holidays.filter(
                                (h) =>
                                    h.type === "optional" ||
                                    (h.holidayType &&
                                        h.holidayType.toLowerCase().includes("optional"))
                            ).length
                        }
                    </h2>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="p-5 border-b">
                    <h2 className="font-semibold text-lg">Holiday List</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b">
                            <tr>
                                <th className="p-4">Holiday</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Day</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetching ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        Loading holidays...
                                    </td>
                                </tr>
                            ) : holidays.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        No holidays found.
                                    </td>
                                </tr>
                            ) : (
                                holidays.map((holiday) => {
                                    const { formattedDate, dayName } = formatHolidayDate(
                                        holiday.holidayDate
                                    );
                                    const isPaidVal =
                                        holiday.isPaid === 1 ||
                                        holiday.isPaid === true ||
                                        holiday.isPaid === undefined;

                                    return (
                                        <tr
                                            key={holiday.id}
                                            className="border-b hover:bg-slate-50 transition"
                                        >
                                            <td className="p-4 font-medium">
                                                {holiday.title || holiday.holidayName}
                                            </td>
                                            <td className="p-4">
                                                {holiday.dateFormatted || formattedDate}
                                            </td>
                                            <td className="p-4">{holiday.day || dayName}</td>
                                            <td className="p-4">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                                    {holiday.type || holiday.holidayType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600 font-medium">
                                                {holiday.department || "All"}
                                            </td>
                                            <td className="p-4 font-medium">
                                                {isPaidVal ? "Yes" : "No"}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        holiday.status === "Inactive"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                    {holiday.status || "Active"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditModal(holiday)}
                                                        className="bg-yellow-100 p-2 rounded-lg hover:bg-yellow-200 text-yellow-600 transition cursor-pointer"
                                                        title="Edit Holiday"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleOpenDeleteModal(holiday.id)
                                                        }
                                                        className="bg-red-100 p-2 rounded-lg hover:bg-red-200 text-red-600 transition cursor-pointer"
                                                        title="Delete Holiday"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD / EDIT HOLIDAY MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center bg-slate-800 text-white p-5">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaCalendarAlt /> {editingId ? "Edit Holiday" : "Add New Holiday"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-400 hover:text-white text-lg p-1 rounded-lg transition cursor-pointer"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveHoliday} className="p-6 space-y-4">
                            {/* Holiday Name (title) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Holiday Name *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Republic Day"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Date & Type Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Holiday Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="holidayDate"
                                        required
                                        value={formData.holidayDate}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="public">Public / National</option>
                                        <option value="festival">Festival</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Holiday"
                                        : "Save Holiday"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                <FaExclamationTriangle />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Delete Holiday
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Are you sure you want to delete this holiday? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseDeleteModal}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={handleConfirmDelete}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}