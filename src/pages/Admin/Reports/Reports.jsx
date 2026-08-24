"use client";
import React, { useState, useEffect } from "react";
import constant from "../../../env";
import { CallApi } from "../../../api";
import { toast } from "react-toastify";

import {
  FiInfo,
  FiFilter,
  FiRotateCcw,
  FiUsers,
  FiFileText,
  FiTarget,
  FiPercent,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiCalendar,
} from "react-icons/fi";

import { FaFileDownload } from "react-icons/fa";

export default function EmployeePerformance() {
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // 1. States Define
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_leads: "0",
    quotes_shared: "0",
    converted_leads: "0",
    conversion_rate: "0%",
    net_premium: "₹0",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const [loading, setLoading] = useState(false);

  // Manual Filter State (No Hardcoded Values)
  const [filters, setFilters] = useState({
    employeeId: "",
    categoryId: "",
    companyId: "",
    selectedDate: getTodayDate(),
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    companies: [],
  });

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getEmployeesList();
    getReports(1);
  }, []);

  // Fetch Employees List for Dynamic Dropdown
  const getEmployeesList = async () => {
    try {
      const endpoint =
        constant.API?.ADMIN?.REPORT?.EMPLOYEES_LIST ||
        "/api/admin/daily-report/employees";

      const response = await CallApi(endpoint, "GET");

      if (response && response.status) {
        setEmployeeOptions(response.data || response.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees dropdown:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch Reports Dashboard Data Dynamically
  const getReports = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);

      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.companyId) params.append("companyId", filters.companyId);
      if (filters.selectedDate) params.append("date", filters.selectedDate);

      const endpoint = `${constant.API?.ADMIN?.REPORT?.DASHBOARD}?${params.toString()}`;
      const response = await CallApi(endpoint, "GET");

      if (response && response.status) {
        const resData = response.data;

        if (resData.employees) {
          setEmployeeData(resData.employees);
        }

        if (resData.summary) {
          setSummaryData({
            total_leads: resData.summary.total_leads || "0",
            quotes_shared: resData.summary.quotes_shared || "0",
            converted_leads: resData.summary.converted_leads || "0",
            conversion_rate: resData.summary.conversion_rate || "0%",
            net_premium: `₹${Number(
              resData.summary.net_premium || 0
            ).toLocaleString("en-IN")}`,
          });
        }

        if (resData.pagination) {
          setPagination({
            currentPage: resData.pagination.page,
            lastPage: resData.pagination.last_page,
            total: resData.pagination.total,
            perPage: resData.pagination.per_page,
          });
        }

        if (resData.filter_options) {
          setFilterOptions({
            categories: resData.filter_options.categories || [],
            companies: resData.filter_options.companies || [],
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch employees report");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const clearedFilters = {
      employeeId: "",
      categoryId: "",
      companyId: "",
      selectedDate: getTodayDate(),
    };
    setFilters(clearedFilters);

    setLoading(true);
    CallApi(
      `${constant.API?.ADMIN?.REPORT?.DASHBOARD}?page=1&date=${getTodayDate()}`,
      "GET"
    )
      .then((response) => {
        if (response && response.status) {
          setEmployeeData(response.data.employees || []);
          if (response.data.summary) {
            setSummaryData({
              total_leads: response.data.summary.total_leads || "0",
              quotes_shared: response.data.summary.quotes_shared || "0",
              converted_leads: response.data.summary.converted_leads || "0",
              conversion_rate: response.data.summary.conversion_rate || "0%",
              net_premium: `₹${Number(
                response.data.summary.net_premium || 0
              ).toLocaleString("en-IN")}`,
            });
          }
          if (response.data.pagination) {
            setPagination({
              currentPage: response.data.pagination.page,
              lastPage: response.data.pagination.last_page,
              total: response.data.pagination.total,
              perPage: response.data.pagination.per_page,
            });
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Dynamic API Call for PDF Download
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      toast.info("Downloading Performance PDF Report...");

      const params = new URLSearchParams();
      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.companyId) params.append("companyId", filters.companyId);
      if (filters.selectedDate) params.append("date", filters.selectedDate);

      const baseUrl =
        constant.API?.ADMIN?.REPORT?.PDF_DOWNLOAD ||
        "/api/admin/daily-report/pdf";
      const endpoint = `${baseUrl}?${params.toString()}`;

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `Daily_Report_${filters.employeeId || "All"}_${filters.selectedDate}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("PDF Report downloaded successfully!");
    } catch (err) {
      console.error("PDF Download error:", err);
      toast.error("Failed to download PDF report!");
    } finally {
      setIsDownloading(false);
    }
  };

  const kpiData = [
    {
      title: "Total Leads",
      value: summaryData.total_leads,
      trend: "12.5%",
      icon: FiUsers,
      bgColor: "bg-indigo-50/60",
      iconColor: "text-indigo-600",
    },
    {
      title: "Quotes Shared",
      value: summaryData.quotes_shared,
      trend: "10.8%",
      icon: FiFileText,
      bgColor: "bg-sky-50/60",
      iconColor: "text-sky-600",
    },
    {
      title: "Converted Leads",
      value: summaryData.converted_leads,
      trend: "15.3%",
      icon: FiTarget,
      bgColor: "bg-emerald-50/60",
      iconColor: "text-emerald-600",
    },
    {
      title: "Conversion Rate",
      value: summaryData.conversion_rate,
      trend: "4.1%",
      icon: FiPercent,
      bgColor: "bg-amber-50/60",
      iconColor: "text-amber-600",
    },
    {
      title: "Net Premium",
      value: summaryData.net_premium,
      trend: "18.6%",
      icon: null,
      isCurrency: true,
      bgColor: "bg-rose-50/60",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="max-w-7xl py-6 space-y-6 bg-slate-50/50 min-h-screen text-slate-700 font-sans antialiased">
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Employee Performance
          </h1>
          <div className="group relative">
            <FiInfo className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
            <div className="absolute left-6 top-0 hidden group-hover:block bg-slate-900 text-white text-xs p-2 rounded shadow-md whitespace-nowrap z-10">
              Track conversion lifecycle performance matrices.
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 bg-[#00a896] hover:bg-[#0b4885] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 ml-auto cursor-pointer"
          >
            <FaFileDownload size={13} />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          {/* Calendar Select Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FiCalendar size={12} /> Select Date
            </label>
            <input
              type="date"
              name="selectedDate"
              value={filters.selectedDate}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 cursor-pointer"
            />
          </div>

          {/* Employee Dynamic Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Employee
            </label>
            <select
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 cursor-pointer"
            >
              <option value="">All Employees</option>
              {employeeOptions.map((emp) => (
                <option
                  key={emp.id || emp.employee_id}
                  value={emp.id || emp.employee_id}
                >
                  {emp.name || emp.employee_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Insurance Category
            </label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 cursor-pointer"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Company
            </label>
            <select
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 cursor-pointer"
            >
              <option value="">All Companies</option>
              {filterOptions.companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => getReports(1)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <FiFilter className="w-4 h-4" /> <span>Filter</span>
            </button>
          </div>

          <div>
            <button
              onClick={handleReset}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <FiRotateCcw className="w-4 h-4" /> <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:translate-y-[-2px] transition-all duration-300"
          >
            <div
              className={`p-3 shrink-0 ${kpi.bgColor} ${kpi.iconColor} rounded-xl`}
            >
              {kpi.icon ? (
                <kpi.icon className="w-5 h-5" />
              ) : (
                <span className="font-bold text-lg leading-none flex items-center justify-center w-5 h-5">
                  ₹
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-400 truncate uppercase tracking-wider">
                {kpi.title}
              </p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span
                  className={`font-bold tracking-tight text-slate-900 truncate ${
                    kpi.isCurrency ? "text-xl" : "text-2xl"
                  }`}
                >
                  {kpi.value}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-400 mt-1">
                <FiTrendingUp className="w-2.5 h-2.5 mr-0.5 text-emerald-500" />
                <span>{kpi.trend} vs last 30 days</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Performance Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual conversion tracking logs parameters.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center font-semibold text-slate-500">
              Loading reports...
            </div>
          ) : employeeData.length === 0 ? (
            <div className="p-10 text-center font-semibold text-slate-500">
              No records found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4 text-center">Leads</th>
                  <th className="p-4 text-center">Quotes Shared</th>
                  <th className="p-4 text-center">Converted</th>
                  <th className="p-4">Conversion Ratio</th>
                  <th className="p-4 text-right pr-6">Net Premium</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {employeeData.map((emp, index) => {
                  const isTelesales =
                    emp.designation?.toLowerCase() === "telesales";
                  const initials = emp.employee_name
                    ? emp.employee_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "EE";

                  const progressWidth = emp.conversion_rate
                    ? parseFloat(emp.conversion_rate.replace("%", ""))
                    : 0;
                  const conversionRateDisplay =
                    emp.conversion_rate || "0.0%";

                  return (
                    <tr
                      key={emp.employee_id || index}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      <td className="p-4 text-center text-slate-400 font-normal">
                        {(pagination.currentPage - 1) * pagination.perPage +
                          index +
                          1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-[11px] tracking-wider shrink-0 ${
                              isTelesales
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {emp.employee_name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                            isTelesales
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {emp.designation || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {emp.leads || 0}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {emp.quotes_shared || 0}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {emp.converted || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3 min-w-[120px]">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden shrink-0">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressWidth}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {conversionRateDisplay}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6 font-bold text-slate-900">
                        ₹{Number(emp.net_premium || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-center text-slate-400">
                        <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
          <div>
            Showing{" "}
            {employeeData.length > 0
              ? (pagination.currentPage - 1) * pagination.perPage + 1
              : 0}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.total
            )}{" "}
            of {pagination.total} entries
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-1 order-2 sm:order-none">
              <button
                onClick={() =>
                  pagination.currentPage > 1 &&
                  getReports(pagination.currentPage - 1)
                }
                disabled={pagination.currentPage === 1}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from(
                { length: pagination.lastPage },
                (_, i) => i + 1
              ).map((pageNo) => (
                <button
                  key={pageNo}
                  onClick={() => getReports(pageNo)}
                  className={`w-8 h-8 rounded-xl border font-bold flex items-center justify-center transition-all cursor-pointer ${
                    pagination.currentPage === pageNo
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNo}
                </button>
              ))}

              <button
                onClick={() =>
                  pagination.currentPage < pagination.lastPage &&
                  getReports(pagination.currentPage + 1)
                }
                disabled={pagination.currentPage === pagination.lastPage}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}