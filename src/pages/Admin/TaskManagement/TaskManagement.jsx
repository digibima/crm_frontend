import React, { useState, useEffect } from "react";
import constant from "../../../env";
import { CallApi } from "../../../api";

import { toast as reactToast } from "react-toastify";
import {
  FiPlus,
  FiX,
  FiChevronDown,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiFilter,
  FiDownload,
  FiClock,
  FiInfo
} from "react-icons/fi";

const Modal = ({
  isOpen,
  onClose,
  title,
  widthClass = "sm:w-[650px]",
  children,
}) => {
  return (
    <div
      className={`
      fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 select-none
      transition-all duration-300 ease-out
      ${isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}
    `}
    >
      <div
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0"}
        `}
        onClick={onClose}
      />

      <div
        className={`
          bg-white w-full rounded-3xl shadow-xl border border-slate-100 
          z-10 overflow-hidden transition-all duration-300 ease-out
          ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}
          ${widthClass}
        `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all_fields");
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeadDate, setFilterLeadDate] = useState("");
  const [filterFollowUpDate, setFilterFollowUpDate] = useState("");
  const [searchApiLoading, setSearchApiLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const itemsPerPage = 10;

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [apiCategories, setApiCategories] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [isCategoryFetched, setIsCategoryFetched] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskAction, setTaskAction] = useState("");
  const [leadDate, setLeadDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const [clientName, setClientName] = useState("");
  const [renewalDate, setRenewalDate] = useState("");

  const [motorRto, setMotorRto] = useState("");
  const [healthType, setHealthType] = useState("new_business");

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);

  const [customCategoryText, setCustomCategoryText] = useState("");
  const [customSubCategoryText, setCustomSubCategoryText] = useState("");
  const [customCompanyText, setCustomCompanyText] = useState("");

  const [amount, setAmount] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [renewalStatus, setRenewalStatus] = useState(false);

  const [allTasks, setAllTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isEmployeeFetched, setIsEmployeeFetched] = useState(false);

  const [selectedTaskData, setSelectedTaskData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActiveTab, setViewActiveTab] = useState("details"); // Tab state

  // Activity Log States
  const [taskLogs, setTaskLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [renewalFollowUpDate, setRenewalFollowupDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [regDate, setRegDate] = useState("");

  useEffect(() => {
    fetchTasksLog();
  }, [currentPage, activeTab]);

  // Fetch Task Logs function call
  const fetchTaskLogs = async (taskId) => {
    if (!taskId) return;
    try {
      setLogsLoading(true);
      const logApiUrl = `/api/tasks/${taskId}/logs`;
      const response = await CallApi(logApiUrl, "GET");

      if (response && response.status) {
        setTaskLogs(response.data?.data || response.data || []);
      } else {
        setTaskLogs([]);
      }
    } catch (error) {
      reactToast.error("Failed to load task activity logs");
      setTaskLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTabClick = (tabName) => {
    setViewActiveTab(tabName);
    if (tabName === "history" && selectedTaskData?.id) {
      fetchTaskLogs(selectedTaskData.id);
    }
  };

  const isRenewalSelected = () => {
    if (isCustomSubCategory) {
      return customSubCategoryText.toLowerCase().includes("renewal");
    }
    const subCatObj = subCategoryOptions.find(
      (s) => Number(s.id) === Number(selectedSubCategory),
    );
    return subCatObj?.name?.toLowerCase().includes("renewal") || false;
  };

  const appendDynamicSearchParam = (urlParams) => {
    if (searchTerm.trim()) {
      switch (searchType) {
        case "employee":
          urlParams.append("employeeName", searchTerm.trim());
          break;
        case "insurance":
          urlParams.append("insurance", searchTerm.trim());
          break;
        case "clientName":
          urlParams.append("clientName", searchTerm.trim());
          break;
        case "clientContact":
          urlParams.append("q", searchTerm.trim());
          break;
        case "regNo":
          urlParams.append("registrationNumber", searchTerm.trim());
          break;
        case "all_fields":
        default:
          urlParams.append("q", searchTerm.trim());
          break;
      }
    }
  };

  const handleSearchButtonClick = async (overridePage = null) => {
    try {
      setSearchApiLoading(true);
      setLoading(true);

      const pageToFetch = overridePage !== null ? overridePage : 1;
      if (overridePage === null) {
        setCurrentPage(1);
      }

      const baseSearchUrl = "/api/tasks/search";
      const params = new URLSearchParams();

      appendDynamicSearchParam(params);

      if (filterStatus) params.append("status", filterStatus);
      if (filterLeadDate) params.append("fromDate", filterLeadDate);
      if (filterFollowUpDate) params.append("toDate", filterFollowUpDate);
      params.append("page", pageToFetch);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      const apiUrl = `${baseSearchUrl}?${params.toString()}`;
      const response = await CallApi(apiUrl, "GET");

      if (response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setAllTasks(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || 0);
        reactToast.success("Search results updated!");
      } else {
        setAllTasks([]);
        setTotalPages(1);
        setTotalEntries(0);
        reactToast.info("No matching tasks found.");
      }
    } catch (error) {
      reactToast.error("Error fetching search results from server");
    } finally {
      setSearchApiLoading(false);
      setLoading(false);
    }
  };

  const fetchTasksLog = async () => {
    if (searchTerm.trim() || filterStatus || filterLeadDate || filterFollowUpDate) {
      handleSearchButtonClick(currentPage);
      return;
    }

    try {
      setLoading(true);
      let apiUrl = constant.API.ADMIN.ASSIGNTASK || "/api/tasks";

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      apiUrl = `${apiUrl.split("?")[0]}?${params.toString()}`;
      const response = await CallApi(apiUrl, "GET");

      if (response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setAllTasks(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || taskData.length);
      } else {
        setAllTasks([]);
        setTotalPages(1);
        setTotalEntries(0);
      }
    } catch (error) {
      reactToast.error("Unable to load tasks from server");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeFocus = async () => {
    if (isEmployeeFetched) return;
    try {
      const response = await CallApi(
        constant.API.ADMIN.EMPLOYEELIST || "/api/employees",
        "GET",
      );
      if (response.status) {
        setEmployees(response.data?.data || response.data || []);
        setIsEmployeeFetched(true);
      }
    } catch (error) {
      reactToast.error("Unable to load employee list");
    }
  };

  const handleCategoryFocus = async () => {
    if (isCategoryFetched) return;
    try {
      const response = await CallApi(
        constant.API.ADMIN.INSURANCE_CATEGORIES || "/api/categories",
        "GET",
      );
      if (response.status) {
        setApiCategories(response.data?.data || response.data || []);
        setIsCategoryFetched(true);
      }
    } catch (error) {
      reactToast.error("Unable to load insurance categories");
    }
  };

  const handleCategoryChange = async (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory("");
    setSelectedCompany("");
    setSubCategoryOptions([]);
    setCompanyOptions([]);
    setMotorRto("");
    setHealthType("new_business");

    if (errors.category) setErrors((prev) => ({ ...prev, category: false }));

    if (!catId || catId === "custom_input") return;

    try {
      const response = await CallApi(
        `${constant.API.ADMIN.INSURANCESUBCATEGORY}/${catId}`,
        "GET",
      );
      if (response.status) {
        setSubCategoryOptions(response.data?.data || response.data || []);
      }
    } catch (error) {
      reactToast.error("Unable to load sub-categories");
    }
  };

  const handleSubCategoryChange = async (subCatId) => {
    setSelectedSubCategory(subCatId);
    setSelectedCompany("");
    setCompanyOptions([]);
    if (errors.subCategory) setErrors((prev) => ({ ...prev, subCategory: false }));

    if (!subCatId || subCatId === "custom_input") return;

    try {
      const response = await CallApi(
        `${constant.API.ADMIN.INSURANCECOMPANIES}/${subCatId}`,
        "GET",
      );
      if (response.status) {
        setCompanyOptions(response.data?.data || response.data || []);
      }
    } catch (error) {
      reactToast.error("Unable to load companies");
    }
  };

  const createCustomCategory = async () => {
    if (!isCustomCategory || !customCategoryText.trim())
      return selectedCategory ? Number(selectedCategory) : null;
    const response = await CallApi("/api/categories", "POST", {
      name: customCategoryText.trim(),
    });
    return response.status ? response.data?.id || response.data : null;
  };

  const createCustomSubCategory = async (catId) => {
    if (!isCustomSubCategory || !customSubCategoryText.trim())
      return selectedSubCategory ? Number(selectedSubCategory) : null;
    const response = await CallApi("/api/sub-categories", "POST", {
      name: customSubCategoryText.trim(),
      categoryId: catId,
    });
    return response.status ? response.data?.id || response.data : null;
  };

  const createCustomCompany = async (subCatId) => {
    if (!isCustomCompany || !customCompanyText.trim())
      return selectedCompany ? Number(selectedCompany) : null;
    const response = await CallApi("/api/companies", "POST", {
      name: customCompanyText.trim(),
      subCategoryId: subCatId,
    });
    return response.status ? response.data?.id || response.data : null;
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    const newErrors = {};

    const hasCategory = selectedCategory || (isCustomCategory && customCategoryText.trim());
    if (!hasCategory) {
      newErrors.category = true;
      reactToast.warning("Please select or enter an Insurance Category");
    }

    const hasSubCategory = selectedSubCategory || (isCustomSubCategory && customSubCategoryText.trim());
    if (!hasSubCategory) {
      newErrors.subCategory = true;
      reactToast.warning("Please select or enter an Insurance Sub-Category");
    }

    if (!clientName.trim()) {
      newErrors.clientName = true;
      reactToast.warning("Please enter the Client Name");
    }

    if (!taskAction.trim()) {
      newErrors.taskAction = true;
      reactToast.warning("Please provide a Task Action / Instruction");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const finalCatId = await createCustomCategory();
      if (isCustomCategory && !finalCatId) {
        reactToast.error("Failed to save custom category");
        return;
      }

      const finalSubCatId = await createCustomSubCategory(finalCatId);
      if (isCustomSubCategory && !finalSubCatId) {
        reactToast.error("Failed to save custom sub-category");
        return;
      }

      const finalCompId = await createCustomCompany(finalSubCatId);
      if (isCustomCompany && !finalCompId) {
        reactToast.error("Failed to save custom company");
        return;
      }

      if (Number(finalCatId) === 1 && !motorRto.trim()) {
        setErrors({ motorRto: true });
        reactToast.warning("Please enter the RTO Number for Motor Insurance");
        return;
      }

      const selectedCategoryName =
        apiCategories
          .find((c) => Number(c.id) === Number(finalCatId))
          ?.name?.toLowerCase() ||
        customCategoryText.trim().toLowerCase() ||
        "";

      const renewalFlow = isRenewalSelected();
      let finalAssignTo = null;
      if (assignTo) {
        finalAssignTo = Array.isArray(assignTo) ? assignTo.map(Number) : [Number(assignTo)];
      }

      const payload = {
        insuranceCategoryId: finalCatId ? Number(finalCatId) : null,
        insuranceSubCategoryId: finalSubCatId ? Number(finalSubCatId) : null,
        insuranceCompanyId: finalCompId ? Number(finalCompId) : null,
        taskAction: taskAction.trim(),
        referenceName: referenceName || null,
        clientName: clientName || null,
        leadDate: renewalFlow ? null : leadDate || null,
        followUpDate: renewalFlow ? null : followUpDate || null,
        renewalDate: renewalDate || null,
        renewalFollowUpDate: renewalFlow ? (renewalFollowUpDate || null) : null,
        assignTo: finalAssignTo,
        priority: "high",
        clientContactNumber: clientPhone || null,
        status: taskStatus,
        ...(selectedCategoryName === "motor" && {
          registrationNumber: motorRto,
          registration_date: regDate || null,
        }),
        ...(selectedCategoryName === "health" && { insuranceType: healthType }),
        ...(renewalFlow && {
          amount: amount || null,
          policyNumber: policyNumber || null,
          isRenewal: renewalStatus,
        }),
      };

      const response = await CallApi(
        constant.API.ADMIN.ASSIGNTASK || "/api/tasks",
        "POST",
        payload
      );

      if (response && response.status) {
        reactToast.success("Task assigned successfully!");
        resetForm();
        fetchTasksLog();
      } else {
        reactToast.error(response?.message || "Failed to assign task");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      reactToast.error("Something went wrong while submitting the task");
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!selectedTaskData) return;
    try {
      setIsDeleting(true);
      const response = await CallApi(
        `/api/tasks/${selectedTaskData.id}`,
        "DELETE",
        {},
      );

      if (response && response.status) {
        reactToast.success("Task deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedTaskData(null);
        fetchTasksLog();
      } else {
        reactToast.error(response?.message || "Failed to delete task");
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Something went wrong while deleting";
      reactToast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryStyles = (cat) => {
    const formattedCat = cat ? cat.toLowerCase() : "";
    switch (formattedCat) {
      case "health":
        return "bg-teal-50 text-teal-700 border-teal-100";
      case "motor":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "fire":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "personal accident":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "life":
      case "life/term":
      case "term":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const resetForm = () => {
    setIsAssignModalOpen(false);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedCompany("");
    setReferenceName("");
    setClientName("");
    setRenewalDate("");
    setClientPhone("");
    setTaskStatus("pending");
    setTaskAction("");
    setLeadDate("");
    setFollowUpDate("");
    setAssignTo("");
    setMotorRto("");
    setRegDate("");
    setHealthType("new_business");
    setSubCategoryOptions([]);
    setCompanyOptions([]);
    setIsCustomCategory(false);
    setIsCustomSubCategory(false);
    setIsCustomCompany(false);
    setCustomCategoryText("");
    setCustomSubCategoryText("");
    setCustomCompanyText("");
    setIsCategoryFetched(false);
    setAmount("");
    setPolicyNumber("");
    setRenewalStatus(false);
    setSearchType("all_fields");
    setSearchTerm("");
    setErrors({});
  };

  const clearAllFilters = async () => {
    setFilterStatus("");
    setFilterLeadDate("");
    setFilterFollowUpDate("");
    setSearchTerm("");
    setSearchType("all_fields");
    setCurrentPage(1);

    try {
      setLoading(true);
      let apiUrl = constant.API.ADMIN.ASSIGNTASK || "/api/tasks";

      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      apiUrl = `${apiUrl.split("?")[0]}?${params.toString()}`;
      const response = await CallApi(apiUrl, "GET");

      if (response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setAllTasks(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || taskData.length);
        reactToast.info("Filters cleared, showing all tasks.");
      } else {
        setAllTasks([]);
        setTotalPages(1);
        setTotalEntries(0);
      }
    } catch (error) {
      reactToast.error("Unable to load tasks from server");
    } 
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const hasCategory = selectedCategory || (isCustomCategory && customCategoryText.trim());
    const hasSubCategory = selectedSubCategory || (isCustomSubCategory && customSubCategoryText.trim());

    if (!hasCategory || !hasSubCategory || !taskAction.trim()) {
      reactToast.warning("Please fill all mandatory fields (Category, Sub-Category, and Instruction)");
      return;
    }

    try {
      const finalCatId = await createCustomCategory();
      if (isCustomCategory && !finalCatId) {
        reactToast.error("Failed to save custom category");
        return;
      }

      const finalSubCatId = await createCustomSubCategory(finalCatId);
      if (isCustomSubCategory && !finalSubCatId) {
        reactToast.error("Failed to save custom sub-category");
        return;
      }

      const finalCompId = await createCustomCompany(finalSubCatId);
      if (isCustomCompany && !finalCompId) {
        reactToast.error("Failed to save custom company");
        return;
      }

      if (Number(finalCatId) === 1 && !motorRto.trim()) {
        reactToast.warning("Please enter the RTO Number");
        return;
      }

      const selectedCategoryName =
        apiCategories.find((c) => Number(c.id) === Number(finalCatId))?.name?.toLowerCase() ||
        customCategoryText.trim().toLowerCase() ||
        "";

      const renewalFlow = isRenewalSelected();

      const updatedPayload = {
        insuranceCategoryId: finalCatId ? Number(finalCatId) : null,
        insuranceSubCategoryId: finalSubCatId ? Number(finalSubCatId) : null,
        insuranceCompanyId: finalCompId ? Number(finalCompId) : null,
        taskAction: taskAction.trim(),
        referenceName: referenceName || null,
        clientName: clientName || null,
        leadDate: renewalFlow ? null : leadDate || null,
        followUpDate: renewalFlow ? null : followUpDate || null,
        renewalDate: renewalDate || null,
        renewalFollowUpDate: isRenewalSelected() ? (renewalFollowUpDate || null) : null,
        assignTo: assignTo ? Number(assignTo) : null,
        clientContactNumber: clientPhone || null,
        status: taskStatus,
        registrationNumber: selectedCategoryName === "motor" ? motorRto : null,
        egistration_date: selectedCategoryName === "motor" ? (regDate || null) : null,
        insuranceType: selectedCategoryName === "health" ? healthType : null,
        ...(renewalFlow && {
          amount: amount || null,
          policyNumber: policyNumber || null,
          isRenewal: renewalStatus,
        }),
      };

      const response = await CallApi(`/api/tasks/${selectedTaskData?.id}`, "PUT", updatedPayload);

      if (response.status) {
        reactToast.success("Task updated successfully!");
        setIsEditModalOpen(false);
        setSelectedTaskData(null);
        resetForm();
        fetchTasksLog();
      } else {
        reactToast.error(response.message || "Failed to update task");
      }
    } catch (error) {
      reactToast.error("Something went wrong while updating task");
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!assignTo) {
      reactToast.warning("Please select an employee to reassign");
      return;
    }

    try {
      setIsReassigning(true);

      const response = await CallApi(
        `/api/tasks/reassign`,
        "POST",
        {
          taskId: Number(selectedTaskData?.id),
          assignTo: Number(assignTo)
        }
      );

      if (response.status) {
        reactToast.success("Task reassigned successfully!");
        setIsReassignModalOpen(false);
        setSelectedTaskData(null);
        resetForm();
        fetchTasksLog();
      } else {
        reactToast.error(response.message || "Failed to reassign task");
      }
    } catch (error) {
      reactToast.error("Something went wrong while reassigning task");
    } finally {
      setIsReassigning(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setExportLoading(true);

      const params = new URLSearchParams();
      appendDynamicSearchParam(params);

      if (filterStatus) params.append("status", filterStatus);
      if (filterLeadDate) params.append("fromDate", filterLeadDate);
      if (filterFollowUpDate) params.append("toDate", filterFollowUpDate);
      if (activeTab !== "All") params.append("category", activeTab);

      const apiUrl = `/api/tasks/export-excel?${params.toString()}`;

      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks_report_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      reactToast.success("Excel sheet downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      reactToast.error("Failed to download Excel file");
    } finally {
      setExportLoading(false);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + allTasks.length;

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">
            Assign & track work — employees get instant notifications
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto select-none">
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <FiDownload size={16} />
            {exportLoading ? "Exporting..." : "Download Excel"}
          </button>

          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FiPlus size={16} /> Assign task
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 w-full items-end relative">
        <div className="xl:col-span-3 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Search Field
          </label>
          <div className="relative w-full">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchTerm("");
              }}
              className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
            >
              <option value="all_fields">Search All Fields</option>
              <option value="employee">Assigned Employee</option>
              <option value="insurance">Insurance</option>
              <option value="clientName">Client Name</option>
              <option value="clientContact">Client Contact</option>
              <option value="regNo">Reg No.</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <FiChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Search Term
          </label>
          <div className="relative w-full">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder={
                searchType === "all_fields"
                  ? "Search Client, Employee, Mobile..."
                  : searchType === "employee"
                  ? "Search Assigned Employee..."
                  : searchType === "insurance"
                  ? "Search Insurance (Category/Sub-Category)..."
                  : searchType === "clientName"
                  ? "Search Client Name..."
                  : searchType === "clientContact"
                  ? "Search Client Contact..."
                  : "Search Registration (RTO) Number..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchButtonClick();
              }}
              className="w-full h-11 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a896] focus:bg-white outline-none transition"
            />
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Lead Date
          </label>
          <input
            type="date"
            value={filterLeadDate}
            onChange={(e) => setFilterLeadDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        <div className="xl:col-span-2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Follow Up Date
          </label>
          <input
            type="date"
            value={filterFollowUpDate}
            onChange={(e) => setFilterFollowUpDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        <div className="xl:col-span-2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Task Status
          </label>
          <div className="relative w-full">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="call_again">Call Again</option>
              <option value="follow_up">Follow Up</option>
              <option value="completed">Completed</option>
              <option value="not_converted">Not Converted</option>
              <option value="share_quote">Share Quote</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <FiChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-12 flex items-center justify-end gap-3 mt-2 xl:mt-0 pt-2 border-t border-slate-100 xl:border-t-0 xl:pt-0">
          <button
            type="button"
            disabled={searchApiLoading}
            onClick={handleSearchButtonClick}
            className="h-11 px-6 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <FiFilter size={15} />
            {searchApiLoading ? "Searching..." : "Search"}
          </button>

          {(filterStatus || filterLeadDate || filterFollowUpDate || searchTerm) && (
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <th className="py-4 px-4">Assigned Employee</th>
                <th className="py-4 px-4">Insurance</th>
                <th className="py-4 px-4">Client Name</th>
                <th className="py-4 px-4">Client Contact</th>
                <th className="py-4 px-4">Reg No.</th>
                <th className="py-4 px-4">Lead Date</th>
                <th className="py-4 px-4">Follow Up</th>
                <th className="py-4 px-4">Last Update</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading && (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400 font-medium">
                    Data loading...
                  </td>
                </tr>
              )}

              {!loading && allTasks.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400 font-medium">
                    No Task Available.
                  </td>
                </tr>
              )}

              {!loading &&
                allTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="py-4 px-4 text-[#00a896] font-bold">
                      {task.assignToUser?.name ||
                        task.assignByUser?.name ||
                        task.user?.name ||
                        "Unassigned"}
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getCategoryStyles(
                          task.insuranceCategory?.name ||
                          task.insuranceSubCategory?.category?.name,
                        )}`}
                      >
                        {task.insuranceCategory?.name ||
                          task.insuranceSubCategory?.category?.name ||
                          "—"}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-900 font-bold">
                      {task.clientName || task.user?.name || "—"}
                    </td>
                    <td className="py-4 px-2 text-gray-400">
                      {task.clientContactNumber || "—"}
                    </td>
                    <td className="py-4 px-2 text-slate-400">
                      {task.registrationNumber || "—"}
                    </td>
                    <td className="py-4 px-2 text-slate-600">
                      {task.leadDate
                        ? task.leadDate
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("-")
                        : "—"}
                    </td>
                    <td className="py-4 px-2 text-slate-600">
                      {task.followUpDate
                        ? task.followUpDate
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("-")
                        : "—"}
                    </td>
                    <td className="py-4 px-2 text-slate-600">
                      {task.updatedAt
                        ? new Date(task.updatedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                        : "—"}
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold tracking-wide ${task.status === "pending" ||
                          task.status === "pending_in_quote_share"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : task.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        {task.status
                          ? task.status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())
                          : "—"}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="View Task"
                          onClick={() => {
                            setSelectedTaskData(task);
                            setViewActiveTab("details");
                            setTaskLogs([]);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#00a896] hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit Task"
                          onClick={async () => {
                            setSelectedTaskData(task);
                            setIsEditModalOpen(true);

                            setClientName(task.clientName || "");
                            setClientPhone(task.clientContactNumber || "");
                            setReferenceName(task.referenceName || "");
                            setTaskAction(task.taskAction || "");
                            setTaskStatus(task.status || "pending");
                            setLeadDate(task.leadDate ? task.leadDate.split("T")[0] : "");
                            setFollowUpDate(task.followUpDate ? task.followUpDate.split("T")[0] : "");
                            setRenewalDate(task.renewalDate ? task.renewalDate.split("T")[0] : "");
                            setMotorRto(task.registrationNumber || "");
                            setRegDate(
                              task.registration_date 
                                ? task.registration_date.split("T")[0] 
                                : task.registrationDate 
                                ? task.registrationDate.split("T")[0] 
                                : task.regDate 
                                ? task.regDate.split("T")[0] 
                                : ""
                            );
                            setHealthType(task.insuranceType || "new_business");
                            setAssignTo(task.assignTo || "");

                            setAmount(task.amount || "");
                            setPolicyNumber(task.policyNumber || "");
                            setRenewalStatus(task.isRenewal || false);

                            await handleCategoryFocus();
                            await handleEmployeeFocus();

                            const catId = task.insuranceCategoryId || "";
                            setSelectedCategory(catId);

                            if (catId) {
                              try {
                                const subRes = await CallApi(`${constant.API.ADMIN.INSURANCESUBCATEGORY}/${catId}`, "GET");
                                if (subRes.status) {
                                  const subOptions = subRes.data?.data || subRes.data || [];
                                  setSubCategoryOptions(subOptions);

                                  const subCatId = task.insuranceSubCategoryId || "";
                                  setSelectedSubCategory(subCatId);

                                  if (subCatId) {
                                    const compRes = await CallApi(`${constant.API.ADMIN.INSURANCECOMPANIES}/${subCatId}`, "GET");
                                    if (compRes.status) {
                                      setCompanyOptions(compRes.data?.data || compRes.data || []);
                                      setSelectedCompany(task.insuranceCompanyId || "");
                                    }
                                  }
                                }
                              } catch (e) {
                                console.error("Error setting edit states:", e);
                              }
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <FiEdit2 size={15} />
                        </button>

                        <button
                          type="button"
                          title="Reassign Task"
                          onClick={async () => {
                            setSelectedTaskData(task);
                            setIsReassignModalOpen(true);
                            setAssignTo(task.assignTo || "");
                            await handleEmployeeFocus();
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <FiRefreshCw size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete Task"
                          onClick={() => {
                            setSelectedTaskData(task);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION BAR BLOCK --- */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium w-full">
            <div>
              Showing{" "}
              <span className="text-slate-700 font-bold">
                {totalEntries === 0 ? 0 : indexOfFirstItem + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-700 font-bold">
                {indexOfLastItem}
              </span>{" "}
              of{" "}
              <span className="text-slate-700 font-bold">{totalEntries}</span>{" "}
              entries
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Previous
              </button>

              {(() => {
                const pageNumbers = [];
                const maxVisibleButtons = 5;

                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

                if (endPage - startPage + 1 < maxVisibleButtons) {
                  startPage = Math.max(1, endPage - maxVisibleButtons + 1);
                }

                if (startPage > 1) {
                  pageNumbers.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${currentPage === 1 ? "bg-[#00a896] border-[#00a896] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pageNumbers.push(<span key="left-dots" className="px-1 text-slate-400 font-bold">...</span>);
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${currentPage === i
                        ? "bg-[#00a896] border-[#00a896] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pageNumbers.push(<span key="right-dots" className="px-1 text-slate-400 font-bold">...</span>);
                  }
                  pageNumbers.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${currentPage === totalPages ? "bg-[#00a896] border-[#00a896] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pageNumbers;
              })()}

              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ASSIGN NEW TASK MODAL --- */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={resetForm}
        title="Assign new task"
        widthClass="sm:w-[600px]"
      >
        <form className="space-y-4 text-left" onSubmit={handleSubmitTask}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Insurance Category
              </label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategoryText}
                    onChange={(e) => {
                      setCustomCategoryText(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: false }));
                    }}
                    className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.category ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCustomCategoryText("");
                      handleCategoryChange("");
                    }}
                    className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select
                    onFocus={handleCategoryFocus}
                    className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10 ${errors.category ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                      }`}
                    value={selectedCategory}
                    onChange={(e) => {
                      if (e.target.value === "custom_input") {
                        setIsCustomCategory(true);
                        handleCategoryChange("");
                      } else {
                        handleCategoryChange(e.target.value);
                      }
                    }}
                  >
                    <option value="">— Select category —</option>
                    {apiCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option
                      value="custom_input"
                      className="text-[#00a896] font-bold"
                    >
                      + Add Custom Category
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <FiChevronDown size={16} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Insurance Sub Category
              </label>
              {isCustomSubCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom sub-category"
                    value={customSubCategoryText}
                    onChange={(e) => {
                      setCustomSubCategoryText(e.target.value);
                      if (errors.subCategory) setErrors((prev) => ({ ...prev, subCategory: false }));
                    }}
                    className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.subCategory ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSubCategory(false);
                      setCustomSubCategoryText("");
                      setSelectedSubCategory("");
                    }}
                    className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select
                    disabled={!selectedCategory && !isCustomCategory}
                    className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10 ${errors.subCategory ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                      }`}
                    value={selectedSubCategory}
                    onChange={(e) => {
                      if (e.target.value === "custom_input") {
                        setIsCustomSubCategory(true);
                        setSelectedSubCategory("");
                      } else {
                        handleSubCategoryChange(e.target.value);
                      }
                    }}
                  >
                    <option value="">— Select sub category —</option>
                    {subCategoryOptions.map((sub, idx) => (
                      <option key={idx} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                    {(selectedCategory || isCustomCategory) && (
                      <option
                        value="custom_input"
                        className="text-[#00a896] font-bold"
                      >
                        + Add Custom Sub-Category
                      </option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <FiChevronDown size={16} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              {isCustomCompany ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter custom company"
                    value={customCompanyText}
                    onChange={(e) => setCustomCompanyText(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCompany(false);
                      setCustomCompanyText("");
                      setSelectedCompany("");
                    }}
                    className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select
                    disabled={!selectedSubCategory && !isCustomSubCategory}
                    className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10"
                    value={selectedCompany}
                    onChange={(e) => {
                      if (e.target.value === "custom_input") {
                        setIsCustomCompany(true);
                        setSelectedCompany("");
                      } else {
                        setSelectedCompany(e.target.value);
                      }
                    }}
                  >
                    <option value="">— Select company —</option>
                    {companyOptions.map((comp, idx) => (
                      <option key={idx} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                    {(selectedSubCategory || isCustomSubCategory) && (
                      <option
                        value="custom_input"
                        className="text-[#00a896] font-bold"
                      >
                        + Add Custom Company
                      </option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <FiChevronDown size={16} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reference Name (Lead / Client)
              </label>
              <input
                type="text"
                value={referenceName}
                onChange={(e) => setReferenceName(e.target.value)}
                placeholder="e.g. Dr. Sharma referrals..."
                className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: false }));
                }}
                placeholder="e.g. Priya Mehta"
                className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400 ${errors.clientName ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                  }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Client Contact Number
              </label>
              <input
                type="text"
                value={clientPhone}
                maxLength={10}
                placeholder="Enter 10 digit number"
                onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400"
              />
            </div>

            {apiCategories
              .find((c) => Number(c.id) === Number(selectedCategory))
              ?.name?.toLowerCase() === "motor" && (
                <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    RTO Number
                  </label>
                  <input
                    type="text"
                    value={motorRto}
                    maxLength={13}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                      setMotorRto(cleanValue.toUpperCase());
                      if (errors.motorRto) setErrors((prev) => ({ ...prev, motorRto: false }));
                    }}
                    placeholder="e.g. DL-01-CA-1234"
                    className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.motorRto ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                      }`}
                  />
                </div>
                <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Registration Date
        </label>
        <input
          type="date"
          value={regDate}
          onChange={(e) => setRegDate(e.target.value)}
          className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
        />
      </div>
                </>
                

              )}

            {apiCategories
              .find((c) => Number(c.id) === Number(selectedCategory))
              ?.name?.toLowerCase() === "health" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Policy Variant Type
                  </label>
                  <div className="relative w-full">
                    <select
                      value={healthType}
                      onChange={(e) => setHealthType(e.target.value)}
                      className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10"
                    >
                      <option value="new_business">New Policy</option>
                      <option value="port">Port Policy</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </div>
              )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="relative w-full">
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <FiChevronDown size={16} />
                </div>
              </div>
            </div>

            {isRenewalSelected() ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="Enter policy number"
                    className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Renewal Date
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Renewal Follow Up Date
                  </label>
                  <input
                    type="date"
                    value={renewalFollowUpDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRenewalFollowupDate(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Renewal Status
                  </label>
                  <div className="flex items-center mt-2">
                    <button
                      type="button"
                      onClick={() => setRenewalStatus(!renewalStatus)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer ${renewalStatus ? "bg-[#00a896]" : "bg-slate-300"}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${renewalStatus ? "translate-x-6" : ""}`}
                      />
                    </button>
                    <span className="text-xs font-semibold ml-3 text-slate-600">
                      {renewalStatus ? "Active / Done" : "Pending"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Lead Date
                  </label>
                  <input
                    type="date"
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Follow Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
                  />
                </div>
              </>
            )}

            {!isRenewalSelected() &&
              !(
                apiCategories
                  .find((c) => Number(c.id) === Number(selectedCategory))
                  ?.name?.toLowerCase() === "health" &&
                healthType === "new_business"
              ) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Renewal Date
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
                  />
                </div>
              )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Assign To
              </label>
              <div className="relative w-full">
                <select
                  onFocus={handleEmployeeFocus}
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10"
                >
                  <option value="">— Select Employee —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <FiChevronDown size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Assign By
              </label>
              <input
                type="text"
                defaultValue="Admin Panel"
                className="w-full h-11 text-sm font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-4 focus:outline-none"
                disabled
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Task Action / Instruction
              </label>
              <textarea
                rows={2}
                value={taskAction}
                onChange={(e) => {
                  setTaskAction(e.target.value);
                  if (errors.taskAction) setErrors((prev) => ({ ...prev, taskAction: false }));
                }}
                placeholder="e.g. Call 10 new leads, send quotes to batch #3, follow up with Arjun..."
                className={`w-full text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400 resize-none ${errors.taskAction ? "border-rose-500 bg-rose-50/30" : "border-slate-200"
                  }`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAssignModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= REASSIGN TASK MODAL ================= */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setSelectedTaskData(null);
          resetForm();
        }}
        title="Reassign Task"
        widthClass="sm:w-[450px]"
      >
        <form className="space-y-4 text-left" onSubmit={handleReassignSubmit}>
          <div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Reassigning task for client: <span className="font-bold text-slate-700">"{selectedTaskData?.clientName || "—"}"</span>
            </p>

            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select New Employee
            </label>
            <div className="relative w-full">
              <select
                required
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10"
              >
                <option value="">— Select Employee —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isReassigning}
              onClick={() => {
                setIsReassignModalOpen(false);
                setSelectedTaskData(null);
                resetForm();
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReassigning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:bg-indigo-300"
            >
              {isReassigning ? "Reassigning..." : "Confirm Reassign"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= CUSTOM DELETE TASK MODAL ================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTaskData(null);
        }}
        title="Delete Task"
        widthClass="sm:w-[420px]"
      >
        {selectedTaskData && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600">
              <FiAlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Are you absolute sure?
              </h4>
              <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed">
                You are about to delete the task for{" "}
                <span className="font-semibold text-slate-700">
                  "{selectedTaskData.clientName || "—"}"
                </span>
                . This action cannot be undone and employee notifications will
                be discarded.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTaskData(null);
                }}
                className="w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition disabled:opacity-50 cursor-pointer"
              >
                No, Keep it
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTaskConfirm}
                className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Task"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= VIEW TASK MODAL (API DYNAMIC LOGS INTEGRATED) ================= */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTaskData(null);
          setViewActiveTab("details");
          setTaskLogs([]);
        }}
        title={`Task Details`}
        widthClass="sm:w-[700px]"
      >
        {selectedTaskData && (
          <div className="space-y-5">
            {/* Tab Navigation Controls */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => handleTabClick("details")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  viewActiveTab === "details"
                    ? "border-[#00a896] text-[#00a896]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FiInfo size={14} /> Task Details
              </button>
              <button
                type="button"
                onClick={() => handleTabClick("history")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  viewActiveTab === "history"
                    ? "border-[#00a896] text-[#00a896]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FiClock size={14} /> History & Activity Log
              </button>
            </div>

           
            {viewActiveTab === "details" && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <th className="w-52 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
                        Client Name
                      </th>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {selectedTaskData.clientName || "—"}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-200">
                      <th className="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
                        Contact Number
                      </th>
                      <td className="px-4 py-3 text-slate-800">
                        {selectedTaskData.clientSecretNumber ||
                          selectedTaskData.clientContactNumber ||
                          "—"}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-200">
                      <th className="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
                        Insurance Category
                      </th>
                      <td className="px-4 py-3 text-slate-800">
                        {selectedTaskData.insuranceCategory?.name || "—"}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-200">
                      <th className="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
                        Status
                      </th>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            selectedTaskData.status === "completed" || selectedTaskData.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : selectedTaskData.status === "pending" || selectedTaskData.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : selectedTaskData.status === "Rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {selectedTaskData.status
                            ? selectedTaskData.status
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())
                            : "N/A"}
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b border-slate-200">
                      <th className="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
                        Assigned Employee
                      </th>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {selectedTaskData.assignToUser?.name || "Unassigned"}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-200">
                      <th className="bg-slate-50 px-4 py-3 align-top text-left font-semibold text-slate-600">
                        Task Instruction
                      </th>
                      <td className="px-4 py-3 whitespace-pre-line text-slate-700 leading-6">
                        {selectedTaskData.taskAction ||
                          "No instructions provided."}
                      </td>
                    </tr>

                    <tr>
                      <th className="bg-slate-50 px-4 py-3 align-top text-left font-semibold text-slate-600">
                        Employee Flow Comment
                      </th>
                      <td className="px-4 py-3 whitespace-pre-line text-slate-700 leading-6">
                        {selectedTaskData.flowComment ||
                          "No employee comment available."}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {viewActiveTab === "history" && (
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 transition-all">
                
                {/* Header Section */}
                <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#00a896]/10 text-[#00a896] flex items-center justify-center font-bold shadow-xs">
                      <FiClock size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">
                        Task Journey Log
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Task #{selectedTaskData.id} timeline
                      </p>
                    </div>
                  </div>

                  {taskLogs && taskLogs.length > 0 && (
                    <span className="text-[10px] font-bold text-[#00a896] bg-[#00a896]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      {taskLogs.length} Logs
                    </span>
                  )}
                </div>

                {/* Content Area */}
                {logsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <div className="w-5 h-5 border-2 border-[#00a896] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold">Loading log timeline...</span>
                  </div>
                ) : taskLogs && taskLogs.length > 0 ? (
                  <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/90">
                    {taskLogs.map((log, index) => {
                      const formattedDate = log.createdAt
                        ? new Date(log.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—";

                      const isLatest = index === 0;

                      return (
                        <div key={log.id || index} className="relative group">
                          {/* Timeline Bullet Ring */}
                          <div
                            className={`absolute -left-[21px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs transition-all ${
                              isLatest
                                ? "bg-[#00a896] ring-4 ring-[#00a896]/15 scale-110"
                                : "bg-slate-300 group-hover:bg-slate-400"
                            }`}
                          />

                          {/* Compact Micro-Card */}
                          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
                            
                            {/* Top Row: Status Badges & Time */}
                            <div className="flex items-center justify-between gap-2">
                              
                              {/* Status Pills */}
                              <div className="flex items-center gap-1.5 text-xs font-bold">
                                {log.oldStatus && (
                                  <>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wide">
                                      {log.oldStatus.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-slate-300 text-[10px]">➔</span>
                                  </>
                                )}
                                <span className="px-2 py-0.5 bg-teal-50 text-[#00a896] border border-teal-100/80 rounded-md text-[10px] font-bold uppercase tracking-wide">
                                  {log.newStatus ? log.newStatus.replace(/_/g, " ") : "Updated"}
                                </span>
                              </div>

                              {/* Timestamp */}
                              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                {formattedDate}
                              </span>
                            </div>

                            {/* Bottom Row: User Info & Remarks */}
                            <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <span>By</span>
                                <span className="font-bold text-slate-800">
                                  {log.user?.name || "System"}
                                </span>
                                {log.user?.role && (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded uppercase">
                                    {log.user.role}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remarks Block (Clean Compact Bubble) */}
                            {log.remarks && (
                              <div className="mt-2 text-[11px] text-slate-600 bg-slate-50/80 rounded-lg p-2 border-l-2 border-[#00a896] leading-relaxed">
                                <span className="font-semibold text-slate-800">Remarks: </span>
                                {log.remarks}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 font-medium text-xs">
                    No activity logs found for this task.
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedTaskData(null);
                  setViewActiveTab("details");
                  setTaskLogs([]);
                }}
                className="rounded-lg bg-slate-800 px-5 py-2 text-white transition hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= EDIT TASK MODAL ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTaskData(null);
          resetForm();
        }}
        title="Edit Assigned Task"
        widthClass="sm:w-[600px]"
      >
        <form className="space-y-4 text-left" onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurance Category</label>
              <div className="relative w-full">
                <select
                  className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">— Select category —</option>
                  {apiCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurance Sub Category</label>
              <div className="relative w-full">
                <select
                  disabled={!selectedCategory}
                  className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10"
                  value={selectedSubCategory}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                >
                  <option value="">— Select sub category —</option>
                  {subCategoryOptions.map((sub, idx) => (
                    <option key={idx} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
              <div className="relative w-full">
                <select
                  disabled={!selectedSubCategory}
                  className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">— Select company —</option>
                  {companyOptions.map((comp, idx) => (
                    <option key={idx} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reference Name</label>
              <input type="text" value={referenceName} onChange={(e) => setReferenceName(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client Name</label>
              <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client Contact Number</label>
              <input type="text" value={clientPhone} maxLength={10} onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
            </div>

           {apiCategories.find((c) => Number(c.id) === Number(selectedCategory))?.name?.toLowerCase() === "motor" && (
  <>
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">RTO Number</label>
      <input 
        type="text" 
        value={motorRto} 
        maxLength={13} 
        onChange={(e) => setMotorRto(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase())} 
        className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none" 
      />
    </div>

    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        Registration Date
      </label>
      <input
        type="date"
        value={regDate}
        onChange={(e) => setRegDate(e.target.value)}
        className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
      />
    </div>
  </>
)}

            {apiCategories.find((c) => Number(c.id) === Number(selectedCategory))?.name?.toLowerCase() === "health" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Variant Type</label>
                <select value={healthType} onChange={(e) => setHealthType(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none appearance-none cursor-pointer">
                  <option value="new_business">New Policy</option>
                  <option value="port">Port Policy</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none cursor-pointer">
                <option value="pending">Pending</option>
                <option value="call_again">Call Again</option>
                <option value="follow_up">Follow Up</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {isRenewalSelected() ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Number</label>
                  <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Date</label>
                  <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Follow Up Date</label>
                  <input type="date" value={renewalFollowUpDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setRenewalFollowupDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Status</label>
                  <div className="flex items-center mt-2">
                    <button type="button" onClick={() => setRenewalStatus(!renewalStatus)} className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${renewalStatus ? "bg-[#00a896]" : "bg-slate-300"}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${renewalStatus ? "translate-x-6" : ""}`} />
                    </button>
                    <span className="text-xs font-semibold ml-3 text-slate-600">{renewalStatus ? "Active / Done" : "Pending"}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lead Date</label>
                  <input type="date" value={leadDate} onChange={(e) => setLeadDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Follow Up Date</label>
                  <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none" />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assign To</label>
              <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none cursor-pointer">
                <option value="">— Select Employee —</option>
                {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Action / Instruction</label>
              <textarea rows={2} value={taskAction} onChange={(e) => setTaskAction(e.target.value)} className="w-full text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00a896] resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedTaskData(null); resetForm(); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" className="bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManagement;