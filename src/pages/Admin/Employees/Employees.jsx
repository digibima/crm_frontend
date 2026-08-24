import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiEye,
  FiEdit2,
  FiX,
  FiChevronDown,
  FiCamera,
  FiUser
} from "react-icons/fi";
import Modal from "../../../components/Modal";
import constant from "../../../env";
import { CallApi ,CallApiWithFile} from "../../../api";
import { toast } from "react-toastify";

const Employees = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Image Upload States
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    role: "employee",
    designation: "fieldsales",
    email: "",
    phone: "",
    baseSalary: "",
    dob: "",
    joiningDate: "",
    temporaryPassword: "",
    plainPassword: "",
    isActive: true,
  });

  useEffect(() => {
    getEmployees();
  }, []);

  // Helper to construct full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const baseUrl = constant.IMAGE_URL || constant.BASE_URL || "";
    // Avoid double slashes
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${cleanBase}${cleanPath}`;
  };

  const getEmployees = async (page = 1) => {
    setTableLoading(true);
    try {
      const response = await CallApi(
        `${constant.API.ADMIN.EMPLOYEES}?page=${page}`,
        "GET"
      );

      if (response.status) {
        const employees = response.data.data.map((emp) => ({
          ...emp,
          id: emp.id,
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          phone: emp.mobile || "-",
          leads: emp.leads || 0,
          converted: emp.converted || 0,
          plainPassword: emp.plainPassword || "-",
          profileImage: emp.profileImage || null,
          salary: emp.salary
            ? `₹ ${Number(emp.salary).toLocaleString("en-IN")}`
            : "-",
          status: emp.isActive ? "Active" : "Inactive",
          rawIsActive: emp.isActive,
          initial: emp.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          color:
            emp.name?.toLowerCase().includes("adiya") ||
            emp.name?.toLowerCase().includes("aditya")
              ? "bg-[#e0f2fe] text-[#0ea5e9]"
              : "bg-[#fce7f3] text-[#db2777]",
        }));

        setEmployeeData(employees);

        setPagination({
          currentPage: response.data.meta.currentPage,
          lastPage: response.data.meta.lastPage,
          total: response.data.meta.total,
          perPage: response.data.meta.perPage,
        });
      }
    } catch (error) {
      toast.error("Unable to fetch employees");
    } finally {
      setTableLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Please upload an image file (PNG, JPG, JPEG)");
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const openEmployeeModal = (mode, employee = null) => {
    setModalMode(mode);
    setErrors({});
    setIsCustomDesignation(false);
    setProfileImageFile(null);

    if (mode === "add") {
      setFormData({
        fullName: "",
        role: "employee",
        designation: "fieldsales",
        email: "",
        phone: "",
        baseSalary: "",
        dob: "",
        joiningDate: "",
        temporaryPassword: "",
        plainPassword: "",
        isActive: true,
      });
      setSelectedEmployeeId(null);
      setProfileImagePreview(null);
    } else if (employee) {
      setSelectedEmployeeId(employee.id);
      setFormData({
        fullName: employee.name || "",
        role: employee.role || "employee",
        designation:
          employee.designation?.toLowerCase().replace(/\s+/g, "") ||
          "fieldsales",
        email: employee.email || "",
        phone: employee.mobile || employee.phone || "",
        baseSalary: employee.salary
          ? employee.salary.replace(/[₹, ]/g, "")
          : "",
        dob: employee.dob ? employee.dob.split("T")[0] : "",
        joiningDate: employee.doj ? employee.doj.split("T")[0] : "",
        temporaryPassword: "",
        plainPassword: employee.plainPassword || "-",
        isActive: employee.rawIsActive ?? true,
      });
      setProfileImagePreview(getFullImageUrl(employee.profileImage));
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "view") return;

    setErrors({});
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: true }));
      return toast.error("Full Name is required");
    }

    if (!formData.designation) {
      setErrors((prev) => ({ ...prev, designation: true }));
      return toast.error("Designation is required");
    }

    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: true }));
      return toast.error("Enter valid email");
    }

    if (!phoneRegex.test(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: true }));
      return toast.error("Enter valid phone number");
    }

    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      setErrors((prev) => ({ ...prev, baseSalary: true }));
      return toast.error("Enter valid salary");
    }

    if (!formData.dob) {
      setErrors((prev) => ({ ...prev, dob: true }));
      return toast.error("Select DOB");
    }

    if (!formData.joiningDate) {
      setErrors((prev) => ({ ...prev, joiningDate: true }));
      return toast.error("Select Joining Date");
    }

    if (new Date(formData.joiningDate) < new Date(formData.dob)) {
      setErrors((prev) => ({ ...prev, joiningDate: true, dob: true }));
      return toast.error("Joining Date cannot be before DOB");
    }

    if (modalMode === "add" && formData.temporaryPassword.length < 6) {
      setErrors((prev) => ({ ...prev, temporaryPassword: true }));
      return toast.error("Password should be at least 6 characters");
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.fullName);
      payload.append("email", formData.email);
      payload.append("role", "employee");
      payload.append("designation", formData.designation.toLowerCase());
      payload.append("phone", formData.phone);
      payload.append("salary", formData.baseSalary);
      payload.append("dob", formData.dob);
      payload.append("doj", formData.joiningDate);
      payload.append("isActive", formData.isActive);

      if (modalMode === "add" || formData.temporaryPassword) {
        payload.append("password", formData.temporaryPassword);
      }

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }

      let response;
      if (modalMode === "add") {
        response = await CallApiWithFile(constant.API.ADMIN.EMPLOYEES, "POST", payload);
      } else {
        response = await CallApiWithFile(
          `${constant.API.ADMIN.EMPLOYEES}/${selectedEmployeeId}`,
          "PUT",
          payload
        );
      }

      if (response.status) {
        toast.success(
          modalMode === "add"
            ? "Employee added successfully."
            : "Employee updated successfully."
        );
        setIsModalOpen(false);
        getEmployees(pagination.currentPage);
      } else {
        toast.error(response.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);

      const response = await CallApi(
        `${constant.API.ADMIN.EMPLOYEES}/${deleteId}`,
        "DELETE",
        {}
      );

      if (response.status) {
        toast.success("Employee deleted successfully.");
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        getEmployees(pagination.currentPage);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  const TableSkeleton = ({ rows = 8 }) => {
    return (
      <>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index} className="border-b border-slate-100 animate-pulse">
            <td className="p-4 pl-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-2 w-48 bg-gray-100 rounded"></div>
                </div>
              </div>
            </td>
            <td className="p-4">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </td>
            <td className="p-4">
              <div className="h-3 w-28 bg-gray-200 rounded"></div>
            </td>
            <td className="p-4">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </td>
            <td className="p-4">
              <div className="h-6 w-16 rounded-full bg-green-100"></div>
            </td>
            <td className="p-4">
              <div className="flex justify-center gap-3">
                <div className="w-5 h-5 rounded bg-gray-200"></div>
                <div className="w-5 h-5 rounded bg-gray-200"></div>
                <div className="w-5 h-5 rounded bg-gray-200"></div>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  const indexOfFirstItem = (pagination.currentPage - 1) * pagination.perPage;
  const indexOfLastItem = indexOfFirstItem + employeeData.length;

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your team members, roles & performance
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            onClick={() => openEmployeeModal("add")}
            className="thmbtn-one"
          >
            <FiPlus size={16} />
            <span>Add employee</span>
          </button>
        </div>
      </div>

      <div className="bg-white/80 border border-white/40 rounded-[28px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#eae6fa]/70 text-[#5a527a] text-[12px] font-bold uppercase tracking-wider">
                <th className="p-4 pl-8 rounded-l-2xl">NAME</th>
                <th className="p-4">DESIGNATION</th>
                <th className="p-4">CONTACT</th>
                <th className="p-4">BASE SALARY</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 pr-8 rounded-r-2xl text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] font-medium text-[#4a5568]">
              {tableLoading ? (
                <TableSkeleton rows={8} />
              ) : employeeData.length > 0 ? (
                employeeData.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="p-4 pl-8 flex items-center gap-3">
                      {emp.profileImage ? (
                        <img
                          src={getFullImageUrl(emp.profileImage)}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm border border-slate-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: emp.profileImage ? "none" : "flex",
                        }}
                        className={`w-9 h-9 rounded-full items-center justify-center font-bold text-xs shrink-0 shadow-sm ${emp.color}`}
                      >
                        {emp.initial}
                      </div>

                      <div>
                        <span className="text-slate-700 font-semibold block">
                          {emp.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                          {emp.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 capitalize font-normal">
                      {emp.designation}
                    </td>
                    <td className="p-4 text-slate-500 font-normal">
                      {emp.phone}
                    </td>
                    <td className="p-4 text-slate-700 font-bold">
                      {emp.salary}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold text-xs ${
                          emp.rawIsActive ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 pr-8 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEmployeeModal("view", emp)}
                          className="text-[#5bc0de] hover:scale-110 transition-transform p-1"
                          title="View Details"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          onClick={() => openEmployeeModal("edit", emp)}
                          className="text-[#f0ad4e] hover:scale-110 transition-transform p-1"
                          title="Edit Employee"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(emp.id)}
                          className="text-[#d9534f] hover:scale-110 transition-transform p-1"
                          title="Delete Employee"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No Employees Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!tableLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 mt-2 text-xs text-slate-500 font-medium">
            <div>
              Showing{" "}
              <span className="text-slate-700 font-bold">
                {pagination.total === 0 ? 0 : indexOfFirstItem + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-700 font-bold">
                {indexOfLastItem}
              </span>{" "}
              of{" "}
              <span className="text-slate-700 font-bold">
                {pagination.total}
              </span>{" "}
              entries
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => getEmployees(pagination.currentPage - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Previous
              </button>

              {[...Array(pagination.lastPage)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => getEmployees(index + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${
                    pagination.currentPage === index + 1
                      ? "bg-[#00a896] border-[#00a896] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={
                  pagination.currentPage === pagination.lastPage ||
                  pagination.lastPage <= 1
                }
                onClick={() => getEmployees(pagination.currentPage + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT/VIEW MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
          }
        }}
        title={
          modalMode === "add"
            ? "Add new employee"
            : modalMode === "edit"
            ? "Edit employee details"
            : "Employee Profile Details"
        }
      >
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="space-y-5 text-left"
        >
          {/* PROFILE IMAGE UPLOAD SECTION */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-purple-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser size={40} className="text-slate-400" />
                )}
              </div>

              {modalMode !== "view" && (
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-purple-700 transition-colors">
                  <FiCamera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              {modalMode === "view"
                ? "Profile Picture"
                : "Click camera icon to upload profile photo"}
            </p>
          </div>

          {/* Row 1: Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                disabled={modalMode === "view"}
                value={formData.fullName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z ]/g, "");
                  setFormData((prev) => ({ ...prev, fullName: value }));
                  if (errors.fullName)
                    setErrors((prev) => ({ ...prev, fullName: false }));
                }}
                placeholder="e.g. Rahul Roy"
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.fullName
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Designation
              </label>
              {isCustomDesignation ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter custom designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 bg-slate-50/50 ${
                      errors.designation
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDesignation(false);
                      setFormData((prev) => ({
                        ...prev,
                        designation: "fieldsales",
                      }));
                    }}
                    className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <select
                  name="designation"
                  disabled={modalMode === "view"}
                  value={formData.designation}
                  onChange={(e) => {
                    if (e.target.value === "custom_input") {
                      setIsCustomDesignation(true);
                      setFormData((prev) => ({ ...prev, designation: "" }));
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                    errors.designation
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200"
                  }`}
                >
                  <option value="fieldsales">Field Sales</option>
                  <option value="telesales">Tele Sales</option>
                  <option value="it">IT</option>
                  <option value="operations">Operations</option>
                  {modalMode !== "view" && (
                    <option
                      value="custom_input"
                      className="text-purple-600 font-bold"
                    >
                      + Add Custom Designation
                    </option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                disabled={modalMode === "view"}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="emp@digibima.com"
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.email
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Phone (WhatsApp)
              </label>
              <input
                type="text"
                name="phone"
                disabled={modalMode === "view"}
                value={formData.phone}
                placeholder="91XXXXXXXX"
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, phone: value }));
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: false }));
                }}
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.phone
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Row 3: Salary & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Base Salary
              </label>
              <input
                type="number"
                name="baseSalary"
                disabled={modalMode === "view"}
                value={formData.baseSalary}
                placeholder="22000"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, baseSalary: value }));
                  if (errors.baseSalary)
                    setErrors((prev) => ({ ...prev, baseSalary: false }));
                }}
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.baseSalary
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Date Of Birth
              </label>
              <input
                type="date"
                name="dob"
                disabled={modalMode === "view"}
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.dob
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Row 4: Joining Date & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                disabled={modalMode === "view"}
                value={formData.joiningDate}
                onChange={handleInputChange}
                className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.joiningDate
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200"
                }`}
              />
            </div>

            {modalMode === "view" ? (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Login Password
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.plainPassword}
                  className="w-full h-11 border border-slate-200 px-4 rounded-xl bg-purple-50/50 font-bold text-purple-700 text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {modalMode === "edit"
                    ? "New Password (Optional)"
                    : "Temporary Password"}
                </label>
                <input
                  type="password"
                  name="temporaryPassword"
                  value={formData.temporaryPassword}
                  onChange={handleInputChange}
                  placeholder={
                    modalMode === "edit"
                      ? "Leave blank to keep unchanged"
                      : "Set login password"
                  }
                  className={`w-full h-11 border px-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-700 transition-colors bg-slate-50/50 ${
                    errors.temporaryPassword
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Row 5: Account Status Dropdown */}
          {(modalMode === "view" || modalMode === "edit") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Account Status
                </label>
                <div className="relative w-full">
                  <select
                    name="isActive"
                    disabled={modalMode === "view"}
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => {
                      const val = e.target.value === "true";
                      setFormData((prev) => ({ ...prev, isActive: val }));
                    }}
                    className="w-full h-11 border border-slate-200 px-4 rounded-xl outline-none focus:border-purple-500 text-sm font-semibold text-slate-700 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 appearance-none pr-10 cursor-pointer"
                  >
                    <option value="true" className="text-emerald-600 font-bold">
                      Active
                    </option>
                    <option value="false" className="text-rose-600 font-bold">
                      Inactive
                    </option>
                  </select>
                  {modalMode !== "view" && (
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <FiChevronDown size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={() => !loading && setIsModalOpen(false)}
              className="cancelbtn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modalMode === "view" ? "Close" : "Cancel"}
            </button>

            {modalMode !== "view" && (
              <button
                type="submit"
                disabled={loading}
                className="thmbtn-one disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {modalMode === "add" ? "Adding..." : "Saving..."}
                  </div>
                ) : modalMode === "add" ? (
                  "Add Employee"
                ) : (
                  "Save Changes"
                )}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* --- DELETE MODAL --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setIsDeleteModalOpen(false);
          }
        }}
        title="Delete Employee"
      >
        <div className="space-y-5 text-left py-2">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4">
            <FiAlertTriangle
              className="text-rose-600 shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h4 className="text-sm font-bold text-rose-900">Warning</h4>
              <p className="text-xs text-rose-700/90 mt-0.5 leading-relaxed">
                Are you sure you want to delete this employee? This action
                cannot be undone and will permanently remove their logging
                record.
              </p>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={deleteLoading}
              onClick={() => {
                if (!deleteLoading) {
                  setIsDeleteModalOpen(false);
                }
              }}
              className="cancelbtn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;