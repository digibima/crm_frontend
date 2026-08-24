import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import constant from "../../../env";
import { CallApi } from "../../../api";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiChevronDown,
  FiCheckCircle,
  FiX,
  FiFilter,
} from "react-icons/fi";

import Modal from "../../../components/Modal";

export default function MyLeads() {
  const location = useLocation();
  const autoOpenTaskId = location.state?.taskId;

  const [activeTab, setActiveTab] = useState("All");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const [callResponse, setCallResponse] = useState("");
  const [notRespondedAction, setNotRespondedAction] = useState("");
  const [respondedOption, setRespondedOption] = useState("");

  const [flowDateTime, setFlowDateTime] = useState("");
  const [flowComment, setFlowComment] = useState("");
  const [flowAmount, setFlowAmount] = useState("");

  const [apiCategories, setApiCategories] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [isCategoryFetched, setIsCategoryFetched] = useState(false);
  const [isEmployeeFetched, setIsEmployeeFetched] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [motorRto, setMotorRto] = useState("");
  const [healthType, setHealthType] = useState("new_business");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [priority, setPriority] = useState("low");
  const [leadDate, setLeadDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [taskAction, setTaskAction] = useState("");

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);

  const [customCategoryText, setCustomCategoryText] = useState("");
  const [customSubCategoryText, setCustomSubCategoryText] = useState("");
  const [customCompanyText, setCustomCompanyText] = useState("");
  const [quoteSent, setQuoteSent] = useState("no");
  const [searchApiLoading, setSearchApiLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [renewalStatus, setRenewalStatus] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [renewalFollowUpDate, setRenewalFollowupDate] = useState("");
  const [errors, setErrors] = useState({});
  const [regDate, setRegDate] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTasks();
  }, [currentPage, activeTab]);

useEffect(() => {
    const currentTaskId = location.state?.taskId;

    if (currentTaskId) {

      const targetLead = leads.find(
        (lead) => String(lead.id) === String(currentTaskId)
      );

      if (targetLead) {
        openViewModal(targetLead);

        window.history.replaceState({}, document.title);
        if (location.state) location.state.taskId = null;
      } else if (!loading && leads.length > 0) {

        const fetchSingleTaskAndOpen = async () => {
          try {
            const res = await CallApi(`/api/employee/tasks/${currentTaskId}`, "GET");
            if (res && res.status && res.data) {
              openViewModal(res.data);
            }
          } catch (err) {
            console.error("Error fetching notification task:", err);
          } finally {
            window.history.replaceState({}, document.title);
            if (location.state) location.state.taskId = null;
          }
        };

        fetchSingleTaskAndOpen();
      }
    }
  }, [location.state, leads, loading]);

  const isRenewalSelected = () => {
    if (isCustomSubCategory) {
      return customSubCategoryText.toLowerCase().includes("renewal");
    }
    const subCatObj = subCategoryOptions.find((s) => Number(s.id) === Number(selectedSubCategory));
    return subCatObj?.name?.toLowerCase().includes("renewal") || false;
  };

  const handleSearchButtonClick = async () => {
    try {
      setSearchApiLoading(true);
      setLoading(true);
      setError(null);

      const baseSearchUrl = constant.API.EMPLOYEE.SEARCHTASK || "/api/tasks/search";

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("q", searchTerm.trim());
      if (filterFromDate) params.append("fromDate", filterFromDate);
      if (filterToDate) params.append("toDate", filterToDate);
      if (filterStatus) params.append("status", filterStatus);

      params.append("page", currentPage);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      const separator = baseSearchUrl.includes('?') ? '&' : '?';
      const apiUrl = `${baseSearchUrl}${separator}${params.toString()}`;

      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setLeads(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || 0);
        toast.success("Search results updated!");
      } else {
        setLeads([]);
        setTotalPages(1);
        setTotalEntries(0);
        toast.info("No matching tasks found.");
      }
    } catch (err) {
      toast.error("Error fetching search results from server");
    } finally {
      setSearchApiLoading(false);
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (searchTerm.trim() || filterStatus || filterFromDate || filterToDate) {
      handleSearchButtonClick();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let apiUrl = constant.API.EMPLOYEE.MYTASK || "/api/employee/tasks";

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      apiUrl = `${apiUrl.split('?')[0]}?${params.toString()}`;

      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setLeads(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || taskData.length);
      } else {
        setLeads([]);
        setTotalPages(1);
        setTotalEntries(0);
      }
    } catch (err) {
      console.error("API error:", err);
      toast.error("Unable to load tasks from server");
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFocus = async () => {
    if (isCategoryFetched) return;
    try {
      const response = await CallApi(
        constant.API.ADMIN.INSURANCECATEGORY || "/api/categories",
        "GET",
      );
      if (response.status) {
        setApiCategories(response.data?.data || response.data || []);
        setIsCategoryFetched(true);
      }
    } catch {
      toast.error("Unable to load categories");
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
        "GET"
      );
      if (response.status) {
        setSubCategoryOptions(response.data?.data || response.data || []);
      }
    } catch {
      toast.error("Unable to load sub-categories");
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
    } catch {
      toast.error("Unable to load companies");
    }
  };

  const filteredLeads = leads;

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
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const createCustomCategory = async () => {
    if (!isCustomCategory || !customCategoryText.trim()) return selectedCategory ? Number(selectedCategory) : null;
    const response = await CallApi(constant.API.ADMIN.INSURANCECATEGORY || "/api/categories", "POST", { name: customCategoryText.trim() });
    return response.status ? (response.data?.id || response.data) : null;
  };

  const createCustomSubCategory = async (catId) => {
    if (!isCustomSubCategory || !customSubCategoryText.trim()) return selectedSubCategory ? Number(selectedSubCategory) : null;
    const response = await CallApi("/api/sub-categories", "POST", { name: customSubCategoryText.trim(), categoryId: catId });
    return response.status ? (response.data?.id || response.data) : null;
  };

  const createCustomCompany = async (subCatId) => {
    if (!isCustomCompany || !customCompanyText.trim()) return selectedCompany ? Number(selectedCompany) : null;
    const response = await CallApi("/api/companies", "POST", { name: customCompanyText.trim(), subCategoryId: subCatId });
    return response.status ? (response.data?.id || response.data) : null;
  };

const handleAddTaskSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split("T")[0];
    const newErrors = {};

    const hasCategory = selectedCategory || (isCustomCategory && customCategoryText.trim());
    if (!hasCategory) {
      newErrors.category = true;
      toast.warning("Please select or enter an Insurance Category");
    }

    const hasSubCategory = selectedSubCategory || (isCustomSubCategory && customSubCategoryText.trim());
    if (!hasSubCategory) {
      newErrors.subCategory = true;
      toast.warning("Please select or enter an Insurance Sub Category");
    }

    if (!clientName.trim()) {
      newErrors.clientName = true;
      toast.warning("Please enter the Client Name");
    }

    if (!clientPhone.trim()) {
      newErrors.clientPhone = true;
      toast.warning("Please enter the Client Contact Number");
    }

    if (!taskAction.trim()) {
      newErrors.taskAction = true;
      toast.warning("Please provide a Task Remark / Instruction");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const renewalFlow = isRenewalSelected();

    if (!renewalFlow && followUpDate) {
      if (followUpDate < todayStr) {
        toast.warning("Follow Up Date cannot be in the past!");
        return;
      }
    }

    if (renewalDate && renewalDate < todayStr) {
      toast.warning("Renewal Date cannot be in the past!");
      return;
    }

    try {
      const finalCatId = await createCustomCategory();
      if (isCustomCategory && !finalCatId) { toast.error("Failed to save custom category"); return; }

      const finalSubCatId = await createCustomSubCategory(finalCatId);
      if (isCustomSubCategory && !finalSubCatId) { toast.error("Failed to save custom sub-category"); return; }

      const finalCompId = await createCustomCompany(finalSubCatId);
      if (isCustomCompany && !finalCompId) { toast.error("Failed to save custom company"); return; }

      if (Number(finalCatId) === 1 && !motorRto.trim()) {
        setErrors({ motorRto: true });
        toast.warning("Please enter the RTO Number for Motor Insurance");
        return;
      }

      const selectedCategoryName = apiCategories
        .find((c) => Number(c.id) === Number(finalCatId))
        ?.name?.toLowerCase() || customCategoryText.trim().toLowerCase() || "";

      const payload = {
        insuranceCategoryId: finalCatId,
        insuranceSubCategoryId: finalSubCatId,
        insuranceCompanyId: finalCompId,
        customCategoryName: null,
        customSubCategoryName: null,
        customCompanyName: null,
        referenceName: referenceName || null,
        clientName,
        clientContactNumber: clientPhone,
        status: taskStatus,
        priority,
        leadDate: renewalFlow ? null : (leadDate || null),
        followUpDate: renewalFlow ? null : (followUpDate || null),
        renewalDate: renewalDate || null,
        renewalFollowUpDate: renewalFlow ? (renewalFollowUpDate || null) : null,
        assignTo: assignTo ? Number(assignTo) : null,
        taskAction,
        ...(selectedCategoryName === "motor" && { 
          registrationNumber: motorRto,
          registration_date: regDate || null 
        }),
        ...(selectedCategoryName === "health" && { insuranceType: healthType }),
        ...(renewalFlow && {
          amount: amount || null,
          policyNumber: policyNumber || null,
          renewalStatus: renewalStatus,
        }),
      };

      const response = await CallApi(
        constant.API.ADMIN.ASSIGNTASK || "/api/tasks",
        "POST",
        payload,
      );
      if (response.status) {
        toast.success("Task created successfully!");
        resetForm();
        fetchTasks();
      } else {
        toast.error(response?.message || "Failed to add task");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to add task");
    }
  };

  const handleWorkflowSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      callResponse: callResponse,
    };

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();

    if (callResponse === "Not Responded") {
      payload.notRespondedAction = notRespondedAction;
      if (notRespondedAction === "Call Again") {
        if (flowDateTime && new Date(flowDateTime) < now) {
          toast.warning("Follow Up Date & Time cannot be in the past!");
          return;
        }
        payload.flowDateTime = flowDateTime;
      }
    }

    if (callResponse === "Responded") {
      payload.respondedOption = respondedOption;

      if (respondedOption === "Converted") {
        // if (followUpDate && followUpDate < todayStr) {
        //   toast.warning("Next Follow Up Date cannot be in the past!");
        //   return;
        // }
        // if (renewalDate && renewalDate < todayStr) {
        //   toast.warning("Renewal Target Date cannot be in the past!");
        //   return;
        // }
        payload.flowAmount = flowAmount;
        // payload.renewalDate = renewalDate;
        // payload.followUpDate = followUpDate;
        payload.status = "completed";
      } else if (respondedOption === "Not Converted") {
        payload.flowComment = flowComment;
      } else if (respondedOption === "Share quote") {
        if (followUpDate && followUpDate < todayStr) {
          toast.warning("Next Follow Up Date cannot be in the past!");
          return;
        }
        if (renewalDate && renewalDate < todayStr) {
          toast.warning("Renewal Target Date cannot be in the past!");
          return;
        }
        payload.flowComment = flowComment;
        payload.renewalDate = renewalDate;
        payload.followUpDate = followUpDate;
        payload.quoteSent = quoteSent;
      } else if (respondedOption === "Call Again") {
        if (flowDateTime && new Date(flowDateTime) < now) {
          toast.warning("Follow up Date & Time cannot be in the past!");
          return;
        }
        payload.flowDateTime = flowDateTime;
      }
    }

    try {
      const localUserStr = localStorage.getItem("user");
      const parsedUser = localUserStr ? JSON.parse(localUserStr) : null;
      const dynamicId = parsedUser?.id || selectedLead?.id;

      if (!dynamicId) {
        toast.error("User ID not found in session!");
        return;
      }

      const apiUrl = `/api/employee/tasks/${selectedLead?.id}/workflow`;
      const response = await CallApi(apiUrl, "PUT", payload);

      if (response && response.status === true) {
        toast.success(response.message || "Workflow updated successfully");
        closeViewModal();
        fetchTasks();
      } else {
        toast.error(response?.message || "Failed to update workflow");
      }
    } catch (error) {
      console.error("API Error context:", error);
      toast.error("Something went wrong");
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedCompany("");
    setReferenceName("");
    setClientName("");
    setClientPhone("");
    setMotorRto("");
    setRegDate("");
    setHealthType("new_business");
    setTaskStatus("pending");
    setPriority("low");
    setLeadDate("");
    setFollowUpDate("");
    setRenewalDate("");
    setAssignTo("");
    setTaskAction("");
    setSubCategoryOptions([]);
    setCompanyOptions([]);
    setIsCategoryFetched(false);
    setIsEmployeeFetched(false);

    setIsCustomCategory(false);
    setIsCustomSubCategory(false);
    setIsCustomCompany(false);
    setCustomCategoryText("");
    setCustomSubCategoryText("");
    setCustomCompanyText("");

    setAmount("");
    setPolicyNumber("");
    setRenewalStatus(false);
    setErrors({});
  };

  const clearAllFilters = async () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterFromDate("");
    setFilterToDate("");
    setCurrentPage(1);

    try {
      setLoading(true);
      setError(null);

      let apiUrl = constant.API.EMPLOYEE.MYTASK || "/api/employee/tasks";

      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("perPage", itemsPerPage);
      if (activeTab !== "All") params.append("category", activeTab);

      apiUrl = `${apiUrl.split('?')[0]}?${params.toString()}`;

      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        const taskData = response.data.data || [];
        const meta = response.data.meta || {};

        setLeads(taskData);
        setTotalPages(meta.lastPage || 1);
        setTotalEntries(meta.total || taskData.length);
        toast.info("Filters cleared, showing all tasks.");
      } else {
        setLeads([]);
        setTotalPages(1);
        setTotalEntries(0);
      }
    } catch (err) {
      console.error("API error:", err);
      toast.error("Unable to load tasks from server");
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (lead) => {
    setSelectedLead(lead);

    setCallResponse(lead.callResponse || "");
    setNotRespondedAction(lead.notRespondedAction || "");
    setRespondedOption(lead.respondedOption || "");
    setFlowComment(lead.flowComment || "");
    setFlowAmount(lead.flowAmount || "");
    setQuoteSent(lead.quoteSent || "no");

    if (lead.flowDateTime) {
      try {
        const localISOTime = lead.flowDateTime.slice(0, 16);
        setFlowDateTime(localISOTime);
      } catch (e) {
        setFlowDateTime("");
      }
    } else {
      setFlowDateTime("");
    }
    setRenewalDate(lead.renewalDate ? lead.renewalDate.split("T")[0] : "");
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.split("T")[0] : "");

    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedLead(null);
    setCallResponse("");
    setNotRespondedAction("");
    setRespondedOption("");
    setFlowDateTime("");
    setFlowComment("");
    setFlowAmount("");
    setRenewalDate("");
    setFollowUpDate("");
    setQuoteSent("no");
  };

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Task
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">
            Manage and respond to your leads
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shrink-0 cursor-pointer self-start md:self-auto"
        >
          <FiPlus size={16} /> Add Task
        </button>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-end gap-4 w-full">

        <div className="w-full xl:flex-1 flex flex-col gap-1.5">
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
              placeholder="Client Name, Mobile, RTO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchButtonClick();
              }}
              className="w-full h-11 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00a896] focus:bg-white outline-none transition"
            />
          </div>
        </div>

        <div className="w-full xl:w-44 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Lead Date
          </label>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        <div className="w-full xl:w-44 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Follow up Date
          </label>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition cursor-pointer"
          />
        </div>

        <div className="w-full xl:w-44 flex flex-col gap-1.5">
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

        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 pb-0.5">
          <button
            type="button"
            disabled={searchApiLoading}
            onClick={handleSearchButtonClick}
            className="flex-1 xl:flex-none h-11 px-6 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <FiFilter size={15} />
            {searchApiLoading ? "Searching..." : "Search"}
          </button>

          {(filterStatus || filterFromDate || filterToDate || searchTerm) && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-2 transition cursor-pointer whitespace-nowrap mb-1"
            >
              Clear Filters
            </button>
          )}
        </div>

      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <th className="py-4 px-6">Insurance</th>
                <th className="py-4 px-6">Client Name</th>
                <th className="py-4 px-6">Client Contact</th>
                <th className="py-4 px-6">Reg No.</th>
                <th className="py-4 px-6">Lead Date</th>
                <th className="py-4 px-6">Follow Up</th>
                <th className="py-4 px-4">Last Update</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400 font-medium">
                    Data loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400 font-medium">
                    No Task Available.
                  </td>
                </tr>
              )}

              {!loading && !error && filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getCategoryStyles(lead.insuranceCategory?.name)}`}>
                      {lead.insuranceCategory?.name || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-900 font-bold">
                    {lead.clientName || lead.user?.name || "—"}
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {lead.clientContactNumber || "—"}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {lead.registrationNumber || "—"}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {lead.leadDate ? lead.leadDate.split("T")[0].split("-").reverse().join("-") : "—"}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {lead.followUpDate ? lead.followUpDate.split("T")[0].split("-").reverse().join("-") : "—"}
                  </td>
                  <td className="py-4 px-2 text-slate-600">
                    {lead.updatedAt
                      ? new Date(lead.updatedAt).toLocaleString("en-GB", {
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
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wide ${lead.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {lead.priority || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold tracking-wide ${lead.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                      {lead.status ? lead.status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "—"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => openViewModal(lead)} className="text-[#00a896] hover:bg-teal-50 p-2 rounded-lg transition-colors cursor-pointer" title="View Details">
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Block */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium w-full">
            <div>
              Showing <span className="text-slate-700 font-bold">{totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-slate-700 font-bold">{((currentPage - 1) * itemsPerPage) + leads.length}</span> of <span className="text-slate-700 font-bold">{totalEntries}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} type="button" onClick={() => setCurrentPage((prev) => prev - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer">
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                  return (
                    <button key={index} type="button" onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition border ${currentPage === pageNum ? "bg-[#00a896] border-[#00a896] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return <span key={index} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
              <button disabled={currentPage === totalPages || totalPages <= 1} type="button" onClick={() => setCurrentPage((prev) => prev + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold cursor-pointer">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title={<div className="flex items-center gap-2"><FiCheckCircle size={18} className="text-[#00a896]" /><span>Lead Workflow Execution</span></div>} widthClass="sm:w-[620px]">
        <form onSubmit={handleWorkflowSubmit} className="space-y-5 text-left">
          {/* Selected Lead Summary Grid */}
<div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
  <div>
    <span className="block text-slate-400 font-bold uppercase tracking-wider">Client</span>
    <span className="font-bold text-slate-800">{selectedLead?.clientName || selectedLead?.user?.name || "—"}</span>
  </div>
  <div>
    <span className="block text-slate-400 font-bold uppercase tracking-wider">Contact Number</span>
    <span className="font-semibold text-slate-700">{selectedLead?.clientContactNumber || "—"}</span>
  </div>


  {(selectedLead?.insuranceCategory?.name?.toLowerCase() === "motor" ||
    selectedLead?.insuranceSubCategory?.category?.name?.toLowerCase() === "motor") && (
    <>
      <div>
        <span className="block text-slate-400 font-bold uppercase tracking-wider">Reg No. / RTO</span>
        <span className="font-semibold text-slate-700">{selectedLead?.registrationNumber || "—"}</span>
      </div>
      <div>
        <span className="block text-slate-400 font-bold uppercase tracking-wider">Registration Date</span>
        <span className="font-semibold text-slate-700">
          {selectedLead?.regDate
            ? selectedLead.regDate.split("T")[0].split("-").reverse().join("-")
            : selectedLead?.registration_date
            ? selectedLead.registration_date.split("T")[0].split("-").reverse().join("-")
            : "—"}
        </span>
      </div>
    </>
  )}

  <div className="col-span-2 mt-1 border-t border-slate-200 pt-2">
    <span className="block text-slate-400 font-bold uppercase tracking-wider">Task Action / Remark</span>
    <p className="font-semibold text-slate-700 whitespace-pre-line mt-0.5">{selectedLead?.taskAction || "—"}</p>
  </div>
</div>

          <hr className="border-slate-100" />

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1. Call Action Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setCallResponse("Responded"); setNotRespondedAction(""); }} className={`py-2 px-4 text-sm font-semibold rounded-xl border transition-all text-center cursor-pointer ${callResponse === "Responded" ? "bg-[#00a896] border-[#00a896] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Responded</button>
              <button type="button" onClick={() => { setCallResponse("Not Responded"); setRespondedOption(""); }} className={`py-2 px-4 text-sm font-semibold rounded-xl border transition-all text-center cursor-pointer ${callResponse === "Not Responded" ? "bg-rose-500 border-rose-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Not Responded</button>
            </div>
          </div>

          {callResponse === "Not Responded" && (
            <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100/50 space-y-3">
              <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-wider">Action Required</label>
              <select required value={notRespondedAction} onChange={(e) => setNotRespondedAction(e.target.value)} className="w-full h-10 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:border-rose-400 cursor-pointer">
                <option value="">— Select action —</option>
                <option value="Call Again">Call Again (Call not picked)</option>
              </select>
              {notRespondedAction === "Call Again" && (
                <div className="space-y-1.5 mt-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow Up Date & Time</label>
                  <input type="datetime-local" required value={flowDateTime} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setFlowDateTime(e.target.value)} className="w-full h-10 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 focus:outline-none focus:border-[#00a896] cursor-pointer" />
                </div>
              )}
            </div>
          )}

          {callResponse === "Responded" && (
            <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100/50 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#008f80] uppercase tracking-wider mb-2">2. Responded Actions Flow</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Call Again", "Share quote", "Converted", "Not Converted"].map((opt) => (
                    <button key={opt} type="button" onClick={() => { setRespondedOption(opt); if (opt !== "Converted") { setFlowAmount(""); } }} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all text-center uppercase tracking-wide cursor-pointer ${respondedOption === opt ? "bg-[#00a896] border-[#00a896] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{opt}</button>
                  ))}
                </div>
              </div>

              {respondedOption === "Call Again" && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow up Date & Time</label>
                  <input type="datetime-local" required value={flowDateTime} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setFlowDateTime(e.target.value)} className="w-full h-10 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 focus:border-[#00a896] outline-none cursor-pointer" />
                </div>
              )}

              {respondedOption === "Not Converted" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reason / Comments</label>
                    <textarea required rows={2} value={flowComment} onChange={(e) => setFlowComment(e.target.value)} placeholder="Write reason for non-conversion here..." className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-[#00a896] outline-none resize-none" />
                  </div>
                  <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-xs font-medium text-amber-800">⚠️ Current State Status marked as: <strong>Pending in quote share (Not Converted)</strong></div>
                </>
              )}

              {respondedOption === "Share quote" && (
                  <div className="space-y-4 border-t border-slate-200/60 pt-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quote Shared Comments</label>
                      <textarea required rows={2} value={flowComment} onChange={(e) => setFlowComment(e.target.value)} placeholder="Write internal quotation comments here..." className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-[#00a896] outline-none resize-none" />
                    </div>
                    {(selectedLead?.insuranceCategory?.name?.toLowerCase() === "motor" || selectedLead?.insuranceCategory?.name?.toLowerCase() === "two wheeler") && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Taken?</label>
                        <div className="flex gap-2 w-48">
                          <button type="button" onClick={() => setQuoteSent("yes")} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all text-center uppercase tracking-wide cursor-pointer ${quoteSent === "yes" ? "bg-[#00a896] border-[#00a896] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Yes</button>
                          <button type="button" onClick={() => setQuoteSent("no")} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all text-center uppercase tracking-wide cursor-pointer ${quoteSent === "no" ? "bg-rose-500 border-rose-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>No</button>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Renewal Target Date</label>
                        <input type="date" value={renewalDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setRenewalDate(e.target.value)} className="w-full h-10 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Follow Up Date & Time</label>
                        <input 
                          type="datetime-local" 
                          required 
                          value={followUpDate} 
                          min={new Date().toISOString().slice(0, 16)} 
                          onChange={(e) => setFollowUpDate(e.target.value)} 
                          className="w-full h-10 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                )}

              {respondedOption === "Converted" && (
                <div className="space-y-4 border-t border-slate-200/60 pt-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#00a896] uppercase tracking-wider">Premium Amount</label>
                    <input type="number" required placeholder="Enter converted amount" value={flowAmount} onChange={(e) => setFlowAmount(e.target.value)} className="w-full h-10 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 focus:border-[#00a896] outline-none" />
                  </div>
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Renewal Target Date</label>
                      <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full h-10 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Follow Up Date</label>
                      <input type="date" required value={followUpDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full h-10 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 cursor-pointer" />
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={closeViewModal} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Close</button>
            <button type="submit" disabled={!callResponse} className="flex items-center gap-1 bg-[#00a896] hover:bg-[#009282] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 cursor-pointer"><FiCheckCircle size={15} /> Update Flow</button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title="Add New Task" widthClass="sm:w-[620px]">
        <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurance Category</label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <input type="text" required placeholder="Enter custom category" value={customCategoryText} onChange={(e) => { setCustomCategoryText(e.target.value); if (errors.category) setErrors((prev) => ({ ...prev, category: false })); }} className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.category ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} />
                  <button type="button" onClick={() => { setIsCustomCategory(false); setCustomCategoryText(""); handleCategoryChange(""); }} className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"><FiX size={14} /></button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select onFocus={handleCategoryFocus} className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10 ${errors.category ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} value={selectedCategory} onChange={(e) => { if (e.target.value === "custom_input") { setIsCustomCategory(true); handleCategoryChange(""); } else { handleCategoryChange(e.target.value); } }}><option value="">— Select category —</option>{apiCategories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}<option value="custom_input" className="text-[#00a896] font-bold">+ Add Custom Category</option></select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurance Sub Category</label>
              {isCustomSubCategory ? (
                <div className="flex gap-2">
                  <input type="text" required placeholder="Enter custom sub-category" value={customSubCategoryText} onChange={(e) => { setCustomSubCategoryText(e.target.value); if (errors.subCategory) setErrors((prev) => ({ ...prev, subCategory: false })); }} className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.subCategory ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} />
                  <button type="button" onClick={() => { setIsCustomSubCategory(false); setCustomSubCategoryText(""); setSelectedSubCategory(""); }} className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"><FiX size={14} /></button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select disabled={!selectedCategory && !isCustomCategory} className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10 ${errors.subCategory ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} value={selectedSubCategory} onChange={(e) => { if (e.target.value === "custom_input") { setIsCustomSubCategory(true); setSelectedSubCategory(""); } else { handleSubCategoryChange(e.target.value); } }}><option value="">— Select sub category —</option>{subCategoryOptions.map((sub, idx) => (<option key={idx} value={sub.id}>{sub.name}</option>))}{(selectedCategory || isCustomCategory) && (<option value="custom_input" className="text-[#00a896] font-bold">+ Add Custom Sub-Category</option>)}</select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
              {isCustomCompany ? (
                <div className="flex gap-2">
                  <input type="text" required placeholder="Enter custom company" value={customCompanyText} onChange={(e) => setCustomCompanyText(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
                  <button type="button" onClick={() => { setIsCustomCompany(false); setCustomCompanyText(""); setSelectedCompany(""); }} className="text-rose-500 hover:bg-rose-50 px-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"><FiX size={14} /></button>
                </div>
              ) : (
                <div className="relative w-full">
                  <select disabled={!selectedSubCategory && !isCustomSubCategory} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer disabled:opacity-60 disabled:bg-slate-100 appearance-none pr-10" value={selectedCompany} onChange={(e) => { if (e.target.value === "custom_input") { setIsCustomCompany(true); setSelectedCompany(""); } else { setSelectedCompany(e.target.value); } }}><option value="">— Select company —</option>{companyOptions.map((comp, idx) => (<option key={idx} value={comp.id}>{comp.name}</option>))}{(selectedSubCategory || isCustomSubCategory) && (<option value="custom_input" className="text-[#00a896] font-bold">+ Add Custom Company</option>)}</select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reference Name</label>
              <input type="text" value={referenceName} onChange={(e) => setReferenceName(e.target.value)} placeholder="e.g. Dr. Sharma referrals..." className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client Name</label>
              <input type="text" required value={clientName} onChange={(e) => { setClientName(e.target.value); if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: false })); }} placeholder="e.g. Priya Mehta" className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400 ${errors.clientName ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client Contact Number</label>
              <input type="text" required value={clientPhone} maxLength={10} placeholder="Enter 10 digit number" onChange={(e) => { setClientPhone(e.target.value.replace(/\D/g, "")); if (errors.clientPhone) setErrors((prev) => ({ ...prev, clientPhone: false })); }} className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400 ${errors.clientPhone ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} />
            </div>

          {(apiCategories.find(c => Number(c.id) === Number(selectedCategory))?.name?.toLowerCase() === "motor") && (
          <>
            {/* RTO Number Field */}
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
                className={`w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 focus:outline-none focus:border-[#00a896] ${errors.motorRto ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} 
              />
            </div>

            {/* Registration Date Field (Only for Motor) */}
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

            {apiCategories.find(c => Number(c.id) === Number(selectedCategory))?.name?.toLowerCase() === "health" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Variant Type</label>
                <div className="relative w-full">
                  <select value={healthType} onChange={(e) => setHealthType(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10">
                    <option value="new_business">New Policy</option>
                    <option value="port">Port Policy</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
              <div className="relative w-full">
                <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none pr-10">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><FiChevronDown size={16} /></div>
              </div>
            </div>

            {isRenewalSelected() ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Number</label>
                  <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="Enter policy number" className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Date</label>
                  <input type="date" value={renewalDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setRenewalDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer" />
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
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Status</label>
                  <div className="flex items-center mt-2">
                    <button type="button" onClick={() => setRenewalStatus(!renewalStatus)} className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer ${renewalStatus ? "bg-[#00a896]" : "bg-slate-300"}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${renewalStatus ? "translate-x-6" : ""}`} /></button>
                    <span className="text-xs font-semibold ml-3 text-slate-600">{renewalStatus ? "Active / Done" : "Pending"}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lead Date</label>
                  <input type="date" value={leadDate} onChange={(e) => setLeadDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Follow Up Date</label>
                  <input type="date" value={followUpDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer" />
                </div>
              </>
            )}

            {!isRenewalSelected() && !(apiCategories.find((c) => Number(c.id) === Number(selectedCategory))?.name?.toLowerCase() === "health" && healthType === "new_business") && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal Date</label>
                <input type="date" value={renewalDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setRenewalDate(e.target.value)} className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer" />
              </div>
            )}


            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remark</label>
              <textarea rows={2} value={taskAction} onChange={(e) => { setTaskAction(e.target.value); if (errors.taskAction) setErrors((prev) => ({ ...prev, taskAction: false })); }} placeholder="e.g. Call client for renewal option updates..." className={`w-full text-sm font-medium text-slate-700 bg-slate-50/50 border rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400 resize-none ${errors.taskAction ? "border-rose-500 bg-rose-50/30" : "border-slate-200"}`} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#00a896] hover:bg-[#009282] text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer">Save & Assign Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}