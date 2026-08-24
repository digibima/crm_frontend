import React, { useState, useEffect, useRef } from "react";
import constant from "../../../env";
import { CallApi } from "../../../api";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import Modal from "../../../components/Modal";
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiRotateCcw,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiUsers,
  FiDollarSign,
  FiGift,
  FiClock,
  FiCreditCard,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
} from "react-icons/fi";

const SalaryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const [employeesListOptions, setEmployeesListOptions] = useState([]);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");

  // ================= GLOBAL ADD INCENTIVE MODAL STATES =================
  const [isIncentiveModalOpen, setIsIncentiveModalOpen] = useState(false);
  const [isIncentiveSubmitting, setIsIncentiveSubmitting] = useState(false);
  const [incentiveEmployeeId, setIncentiveEmployeeId] = useState("");
  const [addIncentiveRules, setAddIncentiveRules] = useState([
    {
      ruleName: "Tier 1 - Basic",
      excessFrom: 0,
      excessTo: 50000,
      incentivePercent: 2.5,
    },
  ]);

  // ================= VIEW / EDIT / DELETE INCENTIVE MODAL STATES =================
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmpForRules, setSelectedEmpForRules] = useState(null);
  const [viewRulesList, setViewRulesList] = useState([]);
  const [isCustomRule, setIsCustomRule] = useState(false);


  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfEmp, setPdfEmp] = useState(null);
  const payslipPdfRef = useRef(null);

  // Filters State
  const [filterMonth, setFilterMonth] = useState("8");
  const [filterYear, setFilterYear] = useState("2026");
  const [filterDept, setFilterDept] = useState("All");
  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Selection & Pagination
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, [currentPage, filterMonth, filterYear, filterDept, filterStatus]);

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  const fetchEmployeesList = async () => {
    try {
      const empApiUrl = constant.API.ADMIN.EMPLOYEELIST || "/api/employees";
      const response = await CallApi(empApiUrl, "GET");
      if (response && response.status) {
        setEmployeesListOptions(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error("Error fetching employee options:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("per_page", itemsPerPage);
      if (filterMonth) params.append("month", filterMonth);
      if (filterYear) params.append("year", filterYear);
      if (filterDept !== "All") params.append("department", filterDept);
      if (filterEmployee !== "All") params.append("employee_id", filterEmployee);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const apiUrl = `${
        constant.API.ADMIN.SALARY_DASHBOARD || "/api/admin/salary/dashboard"
      }?${params.toString()}`;
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status) {
        setDashboardData(response.data);
      } else {
        toast.error(response?.message || "Failed to load salary dashboard data");
      }
    } catch (error) {
      console.error("Salary Dashboard API Error:", error);
      toast.error("Error fetching salary dashboard details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRulesForEmployee = async (empId) => {
    setIsViewLoading(true);
    try {
      const baseUrl =
        constant.API.ADMIN.INCENTIVE_RULES ||
        "/api/admin/salary/incentive-rules";
      const response = await CallApi(`${baseUrl}/${empId}`, "GET");

      if (response && response.status && response.data) {
        const customRules = response.data.custom || [];
        const defaultRules = response.data.default || [];

        if (customRules.length > 0) {
          setIsCustomRule(true);
          setViewRulesList(
            customRules.map((r, idx) => ({
              id: r.id,
              ruleName: r.ruleName || `Tier ${idx + 1}`,
              excessFrom: parseFloat(r.excessFrom) || 0,
              excessTo: parseFloat(r.excessTo) || 0,
              incentivePercent: parseFloat(r.incentivePercent) || 0,
            }))
          );
        } else {
          setIsCustomRule(false);
          setViewRulesList(
            defaultRules.map((r, idx) => ({
              id: r.id,
              ruleName: r.ruleName || `Tier ${idx + 1}`,
              excessFrom: parseFloat(r.excessFrom) || 0,
              excessTo: parseFloat(r.excessTo) || 0,
              incentivePercent: parseFloat(r.incentivePercent) || 0,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching incentive rules:", error);
      toast.error("Failed to fetch employee incentive rules");
    } finally {
      setIsViewLoading(false);
    }
  };

  // ================= PDF PAYSLIP GENERATOR FUNCTION =================
  const handleDownloadPayslip = (empData = null) => {
    const targetEmp = empData || currentEmp;
    if (!targetEmp) {
      toast.warning("Please select an employee first");
      return;
    }

    setPdfEmp(targetEmp);
    setDownloadingPdf(true);

    setTimeout(() => {
      const element = payslipPdfRef.current;
      if (!element) {
        setDownloadingPdf(false);
        return;
      }

      const period = `Month_${targetEmp.month || filterMonth}_${targetEmp.year || filterYear}`;
      const fileName = `DigiBima_Payslip_${(targetEmp.employee_name || "Employee").replace(/\s+/g, "_")}_${period}.pdf`;

      const opt = {
        margin: 8,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setDownloadingPdf(false);
          toast.success("Digi Bima Payslip downloaded successfully!");
        })
        .catch((err) => {
          console.error("PDF Download Error:", err);
          setDownloadingPdf(false);
          toast.error("Failed to download PDF payslip");
        });
    }, 150);
  };

  const handleOpenViewModal = (emp) => {
    setSelectedEmpForRules(emp);
    setIsEditMode(false);
    setIsViewModalOpen(true);
    fetchRulesForEmployee(emp.employee_id);
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmpForRules(emp);
    setIsEditMode(true);
    setIsViewModalOpen(true);
    fetchRulesForEmployee(emp.employee_id);
  };

  const handleDirectDeleteRules = async (emp) => {
    if (
      !window.confirm(
        `Are you sure you want to reset custom rules for ${emp.employee_name}? Default system rules will apply.`
      )
    ) {
      return;
    }

    try {
      const deleteApiUrl = `${
        constant.API.ADMIN.INCENTIVE_RULES || "/api/admin/salary/incentive-rules"
      }/${emp.employee_id}`;

      const response = await CallApi(deleteApiUrl, "DELETE");

      if (response && response.status) {
        toast.success("Custom rules deleted successfully!");
        fetchDashboardData();
        if (isViewModalOpen && selectedEmpForRules?.employee_id === emp.employee_id) {
          setIsViewModalOpen(false);
        }
      } else {
        toast.error(response?.message || "Failed to delete custom rules");
      }
    } catch (error) {
      console.error("Delete Rules Error:", error);
      toast.error("Error deleting custom incentive rules");
    }
  };

  const handleUpdateViewRuleField = (index, field, val) => {
    const updated = [...viewRulesList];
    updated[index][field] = val;
    setViewRulesList(updated);
  };

  const handleAddRuleInEdit = () => {
    const tierNum = viewRulesList.length + 1;
    setViewRulesList([
      ...viewRulesList,
      {
        ruleName: `Tier ${tierNum}`,
        excessFrom: 0,
        excessTo: 0,
        incentivePercent: 0,
      },
    ]);
  };

  const handleRemoveRuleInEdit = (index) => {
    if (viewRulesList.length === 1) {
      toast.warning("At least one tier rule is required");
      return;
    }
    setViewRulesList(viewRulesList.filter((_, i) => i !== index));
  };

  const handleSaveIndividualIncentiveRules = async () => {
    if (!selectedEmpForRules) return;

    try {
      setIsViewLoading(true);
      const payload = {
        employeeId: Number(selectedEmpForRules.employee_id),
        rules: viewRulesList.map((rule) => ({
          ruleName: rule.ruleName,
          excessFrom: Number(rule.excessFrom),
          excessTo: Number(rule.excessTo),
          incentivePercent: Number(rule.incentivePercent),
        })),
      };

      const bulkApiUrl =
        constant.API.ADMIN.INCENTIVE_RULES_BULK ||
        "/api/admin/salary/incentive-rules/bulk";
      const response = await CallApi(bulkApiUrl, "POST", payload);

      if (response && (response.status || response.success)) {
        toast.success("Incentive rules updated successfully!");
        setIsEditMode(false);
        setIsViewModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error(response?.message || "Failed to update rules");
      }
    } catch (error) {
      console.error("Save Individual Rules Error:", error);
      toast.error("Error updating incentive rules");
    } finally {
      setIsViewLoading(false);
    }
  };

  const resetIncentiveAddForm = () => {
    setIsIncentiveModalOpen(false);
    setIncentiveEmployeeId("");
    setAddIncentiveRules([
      {
        ruleName: "Tier 1 - Basic",
        excessFrom: 0,
        excessTo: 50000,
        incentivePercent: 2.5,
      },
    ]);
  };

  const handleGlobalAddSubmit = async (e) => {
    e.preventDefault();
    if (!incentiveEmployeeId) {
      toast.warning("Please select an employee");
      return;
    }

    try {
      setIsIncentiveSubmitting(true);
      const payload = {
        employeeId: Number(incentiveEmployeeId),
        rules: addIncentiveRules.map((rule) => ({
          ruleName: rule.ruleName,
          excessFrom: Number(rule.excessFrom),
          excessTo: Number(rule.excessTo),
          incentivePercent: Number(rule.incentivePercent),
        })),
      };

      const bulkApiUrl =
        constant.API.ADMIN.INCENTIVE_RULES_BULK ||
        "/api/admin/salary/incentive-rules/bulk";
      const response = await CallApi(bulkApiUrl, "POST", payload);

      if (response && (response.status || response.success)) {
        toast.success(response.message || "Incentive rule created!");
        resetIncentiveAddForm();
        fetchDashboardData();
      } else {
        toast.error(response?.message || "Failed to add incentive rule");
      }
    } catch (error) {
      console.error("Global Add Error:", error);
      toast.error("Error saving incentive rules");
    } finally {
      setIsIncentiveSubmitting(false);
    }
  };

  // Generate Salary Submission Handler
  const handleGenerateSalarySubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !basicSalary || !monthlyTarget || !effectiveFrom) {
      toast.warning("Please fill in all mandatory fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        employeeId: Number(employeeId),
        basicSalary: Number(basicSalary),
        monthlyTarget: Number(monthlyTarget),
        effectiveFrom: effectiveFrom,
      };

      const generateApiUrl =
        constant.API.ADMIN.SALARY_GENERATE || "/api/admin/salary-structure";
      const response = await CallApi(generateApiUrl, "POST", payload);

      if (response && response.status) {
        toast.success(response.message || "Salary generated successfully!");
        resetGenerateForm();
        fetchDashboardData();
      } else {
        toast.error(response?.message || "Failed to generate salary");
      }
    } catch (error) {
      console.error("Salary Generation Error:", error);
      toast.error("Something went wrong while generating salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetGenerateForm = () => {
    setIsGenerateModalOpen(false);
    setEmployeeId("");
    setBasicSalary("");
    setMonthlyTarget("");
    setEffectiveFrom("");
  };

  const clearFilters = () => {
    setFilterMonth("8");
    setFilterYear("2026");
    setFilterDept("All");
    setFilterEmployee("All");
    setFilterStatus("All");
    setCurrentPage(1);
  };

  const summary = dashboardData?.summary || {};
  const employeesList = dashboardData?.employees || [];
  const pagination = dashboardData?.pagination || {};
  const currentEmp = employeesList[selectedEmployeeIndex] || null;

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "₹0";
    const num = parseFloat(val);
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Salary Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            Manage employee salaries, incentives and payroll
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsIncentiveModalOpen(true)}
            className="flex items-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-sm font-bold px-5 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FiPlus size={16} /> Add Incentive Rule
          </button>
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-sm font-bold px-5 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FiPlus size={16} /> Generate Salary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Employees
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : summary.total_employees || 0}
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 inline-block mt-1">
              Active Employees
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FiDollarSign size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Basic Salary
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : formatCurrency(summary.total_salary)}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 inline-block mt-1">
              This Month
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FiGift size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Incentives
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : formatCurrency(summary.total_incentive)}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 inline-block mt-1">
              This Month
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Late Deduction
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : formatCurrency(summary.total_late_deduction)}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 inline-block mt-1">
              This Month
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00a896] flex items-center justify-center shrink-0">
            <FiCreditCard size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Net Payroll
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : formatCurrency(summary.net_payroll)}
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 inline-block mt-1">
              Paid: {summary.paid || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Items
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? "..." : summary.pending || 0}
            </h3>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 inline-block mt-1">
              Pending
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-end gap-4 w-full">
        <div className="w-full xl:flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Month
            </label>
            <div className="relative w-full">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Year
            </label>
            <div className="relative w-full">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Department
            </label>
            <div className="relative w-full">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="it">IT</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Employee
            </label>
            <div className="relative w-full">
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="All">All Employees</option>
                {employeesListOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Status
            </label>
            <div className="relative w-full">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 pl-3 pr-9 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:border-[#00a896] focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Generated">Generated</option>
                <option value="Paid">Paid</option>
                <option value="Approved">Approved</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 pb-0.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="flex-1 xl:flex-none h-11 px-6 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <FiFilter size={15} /> Filter
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="h-11 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiRotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Salary Overview
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    <th className="py-4 px-4">#</th>
                    <th className="py-4 px-4">Employee</th>
                    <th className="py-4 px-4">Designation</th>
                    <th className="py-4 px-4">Target (₹)</th>
                    <th className="py-4 px-4">Achieved (₹)</th>
                    <th className="py-4 px-4">Incentive (₹)</th>
                    <th className="py-4 px-4">Late Days</th>
                    <th className="py-4 px-4">Late Deduction (₹)</th>
                    <th className="py-4 px-4">Net Salary (₹)</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {loading && (
                    <tr>
                      <td colSpan="11" className="text-center py-8 text-gray-400 font-medium">
                        Loading salary logs...
                      </td>
                    </tr>
                  )}

                  {!loading && employeesList.length === 0 && (
                    <tr>
                      <td colSpan="11" className="text-center py-8 text-gray-400 font-medium">
                        No salary records found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    employeesList.map((item, index) => (
                      <tr
                        key={item.employee_id || index}
                        onClick={() => setSelectedEmployeeIndex(index)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${
                          selectedEmployeeIndex === index ? "bg-teal-50/30" : ""
                        }`}
                      >
                        <td className="py-4 px-4 text-slate-400 font-bold">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-[#00a896] font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-teal-200">
                              {getInitials(item.employee_name)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.employee_name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                ID: {item.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider bg-teal-50 text-[#00a896] border-teal-100">
                            {item.designation || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {formatCurrency(item.target)}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-600">
                          {formatCurrency(item.achieved_premium)}
                        </td>
                        <td className="py-4 px-4 text-emerald-600 font-bold">
                          {formatCurrency(item.incentive)}
                        </td>
                        <td className="py-4 px-4 text-amber-600 font-bold">{item.late_count}</td>
                        <td className="py-4 px-4 text-rose-500 font-bold">
                          {formatCurrency(item.late_deduction)}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {formatCurrency(item.net_salary)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.status}
                          </span>
                        </td>

                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <button
                              type="button"
                              onClick={() => handleDownloadPayslip(item)}
                              title="Download Payslip PDF"
                              className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 text-slate-500 rounded-lg transition cursor-pointer"
                            >
                              <FiDownload size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(item)}
                              title="View Incentive Rules"
                              className="p-1.5 hover:text-[#00a896] hover:bg-teal-50 text-slate-500 rounded-lg transition cursor-pointer"
                            >
                              <FiEye size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Incentive Rules"
                              className="p-1.5 hover:text-amber-600 hover:bg-amber-50 text-slate-500 rounded-lg transition cursor-pointer"
                            >
                              <FiEdit2 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDirectDeleteRules(item)}
                              title="Delete/Reset Custom Rules"
                              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 text-slate-500 rounded-lg transition cursor-pointer"
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
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium w-full">
            <div>
              Showing{" "}
              <span className="text-slate-700 font-bold">
                {employeesList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="text-slate-700 font-bold">
                {Math.min(currentPage * itemsPerPage, pagination.total || employeesList.length)}
              </span>{" "}
              of <span className="text-slate-700 font-bold">{pagination.total || employeesList.length}</span>{" "}
              entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition font-semibold"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-[#00a896] text-white font-bold rounded-lg">
                {currentPage}
              </span>
              <button
                disabled={currentPage >= (pagination.last_page || 1)}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition font-semibold"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-3">
            Employee Salary Summary
          </h3>

          {currentEmp ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-[#00a896] font-bold text-sm flex items-center justify-center shrink-0 uppercase border border-teal-200">
                    {getInitials(currentEmp.employee_name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{currentEmp.employee_name}</h4>
                    <p className="text-xs font-semibold text-[#00a896] uppercase mt-0.5">
                      {currentEmp.designation || "IT"}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1 space-x-2 font-medium">
                      <span>
                        ID: <strong className="text-slate-600">{currentEmp.employee_id}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {currentEmp.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Salary Breakup{" "}
                  <span className="text-slate-400 font-normal lowercase">
                    (Month {currentEmp.month || filterMonth}, {currentEmp.year || filterYear})
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-emerald-600 border-b border-slate-100 pb-1">
                    <span>Earnings</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Basic Salary</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentEmp.basic_salary)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Incentive (Target Based)</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentEmp.incentive)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Bonus</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentEmp.bonus)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 pt-1.5 border-t border-slate-100">
                    <span>Total Earnings</span>
                    <span>
                      {formatCurrency(
                        parseFloat(currentEmp.basic_salary || 0) +
                          parseFloat(currentEmp.incentive || 0) +
                          parseFloat(currentEmp.bonus || 0)
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between font-bold text-rose-500 border-b border-slate-100 pb-1">
                    <span>Deductions</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Late Count</span>
                    <span className="font-semibold text-slate-800">{currentEmp.late_count} Days</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Late Deduction</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentEmp.late_deduction)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-500 pt-1.5 border-t border-slate-100">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(currentEmp.late_deduction)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Net Salary
                  </span>
                  <span className="font-extrabold text-lg text-[#00a896]">
                    {formatCurrency(currentEmp.net_salary)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadPayslip(currentEmp)}
                  disabled={downloadingPdf}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <FiDownload size={16} /> {downloadingPdf ? "Generating PDF..." : "Download Payslip"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              Select an employee row to view summary details.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={resetGenerateForm}
        title="Generate Employee Salary"
        widthClass="sm:w-[500px]"
      >
        <form className="space-y-4 text-left" onSubmit={handleGenerateSalarySubmit}>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Employee
            </label>
            <div className="relative w-full">
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-11 pl-4 pr-10 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none"
              >
                <option value="">— Select Employee —</option>
                {employeesListOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.id})
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
              Basic Salary (₹)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 20000"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Monthly Target (₹)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 100000"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="w-full h-11 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Effective From Date
            </label>
            <input
              type="date"
              required
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full h-11 text-sm font-medium text-slate-600 bg-slate-50/50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-[#00a896] cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={resetGenerateForm}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00a896] hover:bg-[#009282] disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {isSubmitting ? "Generating..." : "Generate Salary"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isIncentiveModalOpen}
        onClose={resetIncentiveAddForm}
        title="Add Incentive Rules"
        widthClass="sm:w-[650px]"
      >
        <form className="space-y-5 text-left" onSubmit={handleGlobalAddSubmit}>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Employee
            </label>
            <div className="relative w-full">
              <select
                required
                value={incentiveEmployeeId}
                onChange={(e) => setIncentiveEmployeeId(e.target.value)}
                className="w-full h-11 pl-4 pr-10 text-sm font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896] cursor-pointer appearance-none"
              >
                <option value="">— Select Employee —</option>
                {employeesListOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.id})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <FiChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Incentive Tiers
              </label>
              <button
                type="button"
                onClick={() =>
                  setAddIncentiveRules([
                    ...addIncentiveRules,
                    {
                      ruleName: `Tier ${addIncentiveRules.length + 1}`,
                      excessFrom: 0,
                      excessTo: 0,
                      incentivePercent: 0,
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs font-bold text-[#00a896]"
              >
                <FiPlus size={14} /> Add Tier
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {addIncentiveRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      required
                      placeholder="Rule Name"
                      value={rule.ruleName}
                      onChange={(e) => {
                        const updated = [...addIncentiveRules];
                        updated[idx].ruleName = e.target.value;
                        setAddIncentiveRules(updated);
                      }}
                      className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    {addIncentiveRules.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddIncentiveRules(
                            addIncentiveRules.filter((_, i) => i !== idx)
                          )
                        }
                        className="ml-2 p-1 text-slate-400 hover:text-rose-500"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Excess From"
                      value={rule.excessFrom}
                      onChange={(e) => {
                        const updated = [...addIncentiveRules];
                        updated[idx].excessFrom = e.target.value;
                        setAddIncentiveRules(updated);
                      }}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Excess To"
                      value={rule.excessTo}
                      onChange={(e) => {
                        const updated = [...addIncentiveRules];
                        updated[idx].excessTo = e.target.value;
                        setAddIncentiveRules(updated);
                      }}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Incentive %"
                      value={rule.incentivePercent}
                      onChange={(e) => {
                        const updated = [...addIncentiveRules];
                        updated[idx].incentivePercent = e.target.value;
                        setAddIncentiveRules(updated);
                      }}
                      className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={resetIncentiveAddForm}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isIncentiveSubmitting}
              className="bg-[#00a896] hover:bg-[#009282] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {isIncentiveSubmitting ? "Saving..." : "Save Rules"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Incentive Rules - ${selectedEmpForRules?.employee_name || "Employee"}`}
        widthClass="sm:w-[700px]"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Employee ID: <span className="text-[#00a896]">{selectedEmpForRules?.employee_id}</span>
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Rule Type:{" "}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCustomRule
                      ? "bg-purple-50 text-purple-600 border border-purple-100"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}
                >
                  {isCustomRule ? "Custom Rules Applied" : "Default System Rules Active"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#00a896] text-white px-3.5 py-1.5 rounded-lg transition"
                >
                  <FiEdit2 size={13} /> Edit Rules
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddRuleInEdit}
                  className="flex items-center gap-1 text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <FiPlus size={13} /> Add Tier
                </button>
              )}
            </div>
          </div>

          {/* Modal Body */}
          {isViewLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">
              Loading incentive rules...
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {viewRulesList.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={rule.ruleName}
                        onChange={(e) =>
                          handleUpdateViewRuleField(idx, "ruleName", e.target.value)
                        }
                        className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 w-full"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-800">
                        {rule.ruleName}
                      </span>
                    )}

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRuleInEdit(idx)}
                        className="ml-2 text-slate-400 hover:text-rose-500 p-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Excess From
                      </span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={rule.excessFrom}
                          onChange={(e) =>
                            handleUpdateViewRuleField(idx, "excessFrom", e.target.value)
                          }
                          className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs w-full mt-0.5"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">
                          {formatCurrency(rule.excessFrom)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Excess To
                      </span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={rule.excessTo}
                          onChange={(e) =>
                            handleUpdateViewRuleField(idx, "excessTo", e.target.value)
                          }
                          className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs w-full mt-0.5"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">
                          {formatCurrency(rule.excessTo)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Incentive %
                      </span>
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.01"
                          value={rule.incentivePercent}
                          onChange={(e) =>
                            handleUpdateViewRuleField(
                              idx,
                              "incentivePercent",
                              e.target.value
                            )
                          }
                          className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-600 w-full mt-0.5"
                        />
                      ) : (
                        <span className="text-xs font-extrabold text-emerald-600">
                          {rule.incentivePercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  onClick={handleSaveIndividualIncentiveRules}
                  className="bg-[#00a896] hover:bg-[#009282] text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FiSave size={14} /> Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </Modal>

     
      <div className="hidden">
        <div
          ref={payslipPdfRef}
          className="relative p-8 bg-white text-slate-800 font-sans text-sm min-h-[980px] flex flex-col justify-between overflow-hidden"
        >
       
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
            <img
              src="/profile/policypdf-watermark.png"
              alt="Watermark"
              className="w-[450px] object-contain"
            />
          </div>

        
          <div className="relative z-10 space-y-6">
          
            <div className="flex justify-between items-center border-b-2 border-[#0f4c81] pb-5">
              <div>
                <img
                  src="/profile/logo.png"
                  alt="DIGI BIMA"
                  className="h-12 object-contain"
                />
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Digital Insurance & Financial Services
                </p>
              </div>

              <div className="text-right">
                <span className="bg-[#20bfa9]/10 text-[#0f4c81] border border-[#20bfa9]/30 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                  Payslip: Month {pdfEmp?.month || filterMonth}, {pdfEmp?.year || filterYear}
                </span>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Issued Date: {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

       
            <div className="grid grid-cols-2 gap-4 bg-slate-50/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1.5">
                <p className="text-slate-500">
                  Employee Name:{" "}
                  <strong className="text-slate-900 font-bold">
                    {pdfEmp?.employee_name || "N/A"}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Employee ID:{" "}
                  <strong className="text-[#0f4c81] font-bold">
                    {pdfEmp?.employee_id || "N/A"}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Designation:{" "}
                  <strong className="text-slate-900 font-bold">
                    {pdfEmp?.designation || "N/A"}
                  </strong>
                </p>
              </div>

              <div className="text-right space-y-1.5">
                <p className="text-slate-500">
                  Status:{" "}
                  <strong className="text-emerald-600 font-bold uppercase">
                    {pdfEmp?.status || "Generated"}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Monthly Target:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {formatCurrency(pdfEmp?.target)}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Achieved Premium:{" "}
                  <strong className="text-[#20bfa9] font-bold">
                    {formatCurrency(pdfEmp?.achieved_premium)}
                  </strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
        
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-[#20bfa9] border-b border-slate-200 pb-1.5 mb-3 text-xs uppercase tracking-wider">
                  Earnings
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Basic Salary</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(pdfEmp?.basic_salary)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Incentive (Target Based)</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(pdfEmp?.incentive)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Bonus</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(pdfEmp?.bonus)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-2.5 text-[#0f4c81] text-xs">
                    <span>Total Gross Earnings</span>
                    <span>
                      {formatCurrency(
                        parseFloat(pdfEmp?.basic_salary || 0) +
                          parseFloat(pdfEmp?.incentive || 0) +
                          parseFloat(pdfEmp?.bonus || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-rose-500 border-b border-slate-200 pb-1.5 mb-3 text-xs uppercase tracking-wider">
                  Deductions
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>
                      Late Deductions ({pdfEmp?.late_count || 0} Days)
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(pdfEmp?.late_deduction)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-2.5 text-rose-600 text-xs">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(pdfEmp?.late_deduction)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f4c81] text-white p-5 rounded-2xl flex justify-between items-center shadow-md">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#20bfa9]">
                  Total Net Payable Salary
                </p>
                <p className="text-[10px] text-slate-200 mt-0.5">
                  (Gross Earnings - Total Deductions)
                </p>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-white">
                {formatCurrency(pdfEmp?.net_salary)}
              </h3>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src="/profile/logoicon.png"
                  alt="Icon"
                  className="w-5 h-5 object-contain opacity-70"
                />
                <p className="font-bold text-[#0f4c81]">DIGI BIMA Payroll Division</p>
              </div>
              <p className="text-[10px] text-slate-400">
                This is a computer-generated salary document and does not require a physical signature.
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 border-b border-slate-300 w-36 ml-auto mb-1"></div>
              <p className="font-bold text-slate-800 text-[11px]">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDashboard;