import * as XLSX from "xlsx";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDownload,
  FiUsers,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiSearch,
  FiFilter,
  FiEye,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiX,
  FiGift
} from "react-icons/fi";
import Modal from "../../../components/Modal";
import { CallApi } from "../../../api";
import constant from "../../../env";
import { toast } from "react-toastify";

const AttendanceTracker = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [inspectEmpId, setInspectEmpId] = useState("");

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Deep Ledger Filtered State & Summary
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState(null);
  const [filteredLoading, setFilteredLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedDate, setSelectedDate] = useState("");

  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leavesDashboardData, setLeavesDashboardData] = useState(null);
  const [attendanceRequests, setAttendanceRequests] = useState([]);

  // CALENDAR API DATA STATE
  const [calendarOverviewData, setCalendarOverviewData] = useState({
    allHolidays: [],
    holidays: [],
    sundays: [],
  });

  // Client-Side Pagination States
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState(1);
  const ledgerEntriesPerPage = 5;

  const [timelineCurrentPage, setTimelineCurrentPage] = useState(1);
  const timelineEntriesPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    setLedgerCurrentPage(1);
    setTimelineCurrentPage(1);
  }, [activeTab, inspectEmpId, selectedMonth, selectedYear, selectedDate]);

  // ================= FETCH CALENDAR OVERVIEW API =================
  const fetchCalendarOverview = async (month, year) => {
    try {
      const apiUrl = `/api/admin/holidays/calendar?month=${month}&year=${year}`;
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        setCalendarOverviewData({
          allHolidays: response.data.allHolidays || [],
          holidays: response.data.holidays || [],
          sundays: response.data.sundays || [],
        });
      }
    } catch (err) {
      console.error("Calendar Overview API error:", err);
    }
  };

  // ================= 1. FETCH LIVE DASHBOARD DATA =================
  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = constant.API.ADMIN.ATTENDANCE.HISTORY;
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        setDashboardData(response.data);

        if (response.data.employeeMonthlySummary?.length > 0) {
          setInspectEmpId((prev) => prev || response.data.employeeMonthlySummary[0].employee?.id);
        }
      }
    } catch (err) {
      console.error("Dashboard API execution error:", err);
      toast.error("Failed to load live server metrics.");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH FILTERED DEEP LEDGER DATA =================
  const fetchFilteredAttendance = async () => {
    try {
      setFilteredLoading(true);

      const currentEmp = employeeSummary.find(
        (item) => String(item.employee.id) === String(inspectEmpId)
      );
      const searchVal = currentEmp?.employee?.name || inspectEmpId || "";

      let apiUrl = `/api/admin/attendance/filter?month=${selectedMonth}&year=${selectedYear}`;
      if (searchVal) {
        apiUrl += `&search=${encodeURIComponent(searchVal)}`;
      }

      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        // Handle new nested response format (response.data.data -> array)
        const logsList = response.data.data || response.data.attendanceList?.data || response.data || [];
        setFilteredLogs(Array.isArray(logsList) ? logsList : []);
        setFilteredSummary(response.data.summary || null);
      } else {
        setFilteredLogs([]);
        setFilteredSummary(null);
      }
    } catch (err) {
      console.error("Filtered Attendance API execution error:", err);
      toast.error("Failed to fetch filtered attendance ledger.");
      setFilteredLogs([]);
      setFilteredSummary(null);
    } finally {
      setFilteredLoading(false);
    }
  };

  const fetchLeavesDashboardData = async () => {
    try {
      const apiUrl = "/api/admin/leaves/dashboard";
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status && response.data) {
        setLeavesDashboardData(response.data);
      }
    } catch (err) {
      console.error("Leaves Dashboard API execution error:", err);
      toast.error("Failed to load live server leave metrics.");
    }
  };

  // ================= FETCH ATTENDANCE REQUESTS =================
  const fetchAttendanceRequests = async () => {
    try {
      const apiUrl = "/api/admin/attendance/requests";
      const response = await CallApi(apiUrl, "GET");

      if (response && response.status) {
        const slots = response.data?.data || response.data || [];
        setAttendanceRequests(slots);
      }
    } catch (err) {
      console.error("Attendance Requests API error:", err);
      toast.error("Failed to load attendance adjustment requests.");
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
    fetchLeavesDashboardData();
    fetchAttendanceRequests();
  }, []);

  // TRIGGER FILTER API WHEN EMP, MONTH OR YEAR CHANGES
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchFilteredAttendance();
    }
  }, [inspectEmpId, selectedMonth, selectedYear]);

  // CALENDAR API TRIGGER ON MONTH / YEAR CHANGE
  useEffect(() => {
    fetchCalendarOverview(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const todayStats = dashboardData?.today || {
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
  };
  const monthlyStats = dashboardData?.monthly || {
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    month: selectedMonth,
    year: selectedYear,
  };
  const attendanceLog = dashboardData?.attendanceList?.data || [];
  const employeeSummary = dashboardData?.employeeMonthlySummary || [];
  const pendingRequests = dashboardData?.pendingRequests?.list || [];

  // Data Filtering for Ledger
  const displayLogs = filteredLogs.filter(
    (log) => !selectedDate || log.attendanceDate === selectedDate
  );

  // Client-Side Pagination Calculations for Deep Ledger
  const ledgerIndexOfLastRow = ledgerCurrentPage * ledgerEntriesPerPage;
  const ledgerIndexOfFirstRow = ledgerIndexOfLastRow - ledgerEntriesPerPage;
  const currentLedgerRows = displayLogs.slice(ledgerIndexOfFirstRow, ledgerIndexOfLastRow);
  const ledgerTotalPages = Math.ceil(displayLogs.length / ledgerEntriesPerPage) || 1;

  // Client-Side Pagination Calculations for Timeline Feed
  const timelineIndexOfLastRow = timelineCurrentPage * timelineEntriesPerPage;
  const timelineIndexOfFirstRow = timelineIndexOfLastRow - timelineEntriesPerPage;
  const currentTimelineRows = attendanceLog.slice(timelineIndexOfFirstRow, timelineIndexOfLastRow);
  const timelineTotalPages = Math.ceil(attendanceLog.length / timelineEntriesPerPage) || 1;

  // ================= DYNAMIC CALENDAR GENERATION LOGIC =================
  const generateCalendarDays = () => {
    const year = selectedYear || new Date().getFullYear();
    const month = selectedMonth ? selectedMonth - 1 : new Date().getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const daySlots = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      daySlots.push({
        day: totalDaysInPrevMonth - i,
        isCurrentMonth: false,
        fullDateStr: "",
      });
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dynamicMonthStr = String(month + 1).padStart(2, "0");
      const dynamicDayStr = String(day).padStart(2, "0");
      const fullDateStr = `${year}-${dynamicMonthStr}-${dynamicDayStr}`;

      daySlots.push({
        day: day,
        isCurrentMonth: true,
        fullDateStr: fullDateStr,
      });
    }

    return daySlots;
  };

  // ➕ CALENDAR API DATA & HOVER DETAILS MAPPING
  const getDayDetails = (fullDateStr) => {
    if (!fullDateStr) return { dotColor: null, detailText: null };

    // 1. API - Check Sunday / Weekend
    const sundayObj = calendarOverviewData.sundays?.find(
      (item) => item.date === fullDateStr
    );
    if (sundayObj) {
      return {
        dotColor: "bg-slate-400",
        detailText: `Sunday (${sundayObj.title || "Weekly Off"})`,
      };
    }

    // 2. API - Check Holiday
    const holidayObj = calendarOverviewData.holidays?.find(
      (item) => item.date === fullDateStr
    );
    if (holidayObj) {
      return {
        dotColor: "bg-purple-600",
        detailText: `Holiday: ${holidayObj.title || "Official Holiday"}`,
      };
    }

    // 3. API - Fallback Check allHolidays
    const allHolidayObj = calendarOverviewData.allHolidays?.find(
      (item) => item.date === fullDateStr
    );
    if (allHolidayObj) {
      return {
        dotColor: allHolidayObj.type === "weekend" ? "bg-slate-400" : "bg-purple-600",
        detailText: `${allHolidayObj.type === "weekend" ? "Sunday" : "Holiday"}: ${allHolidayObj.title}`,
      };
    }

    // 4. Employee Attendance Log Status
    const dayLogs = attendanceLog.filter(
      (log) => log.attendanceDate === fullDateStr
    );
    if (dayLogs.length > 0) {
      const statuses = dayLogs.map((l) =>
        l.status ? l.status.toLowerCase() : ""
      );
      if (statuses.includes("absent")) return { dotColor: "bg-rose-500", detailText: "Status: Absent" };
      if (statuses.includes("half day") || statuses.includes("half_day"))
        return { dotColor: "bg-blue-500", detailText: "Status: Half Day" };
      if (statuses.includes("late")) return { dotColor: "bg-amber-500", detailText: "Status: Late Arrival" };
      if (statuses.includes("present")) return { dotColor: "bg-[#00a896]", detailText: "Status: Present" };
    }

    return { dotColor: null, detailText: "Working Day" };
  };

  const getMonthNameStr = () => {
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const formatIsoTime = (timeVal) => {
    if (!timeVal) return "—";

    // Handle plain HH:mm or HH:mm:ss strings
    if (typeof timeVal === "string" && timeVal.includes(":") && !timeVal.includes("T")) {
      const parts = timeVal.split(":");
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }

    // Handle ISO Datetime string
    try {
      const dateObj = new Date(timeVal);
      if (isNaN(dateObj.getTime())) return timeVal;
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return timeVal || "—";
    }
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    try {
      const dateObj = new Date(isoString);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();

      const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${day}-${month}-${year} ${timeStr}`;
    } catch (e) {
      return "—";
    }
  };

  const getStatusBadgeStyle = (status) => {
    const formatted = status ? status.toLowerCase() : "";
    if (formatted.includes("present") || formatted.includes("approved"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (formatted.includes("late") || formatted.includes("pending"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (formatted.includes("half"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const formatTimeForInput = (isoString) => {
    if (!isoString) return "";
    if (typeof isoString === "string" && isoString.includes(":") && !isoString.includes("T")) {
      return isoString.substring(0, 5);
    }
    try {
      const dateObj = new Date(isoString);
      if (isNaN(dateObj.getTime())) throw new Error();
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (e) {
      return isoString.substring(0, 5);
    }
  };

  const calendarDays = generateCalendarDays();

  // ================= LEAVE ACTION CONTROLLER LAYER =================
  const handleRequestAction = async (id, statusAction) => {
    try {
      setLoading(true);

      const payload = {
        status: statusAction,
        remark: `${statusAction} - Processed by system administrator`,
      };

      const response = await CallApi(
        `/api/admin/leaves/request/${id}`,
        "PUT",
        payload
      );

      if (response && response.status) {
        toast.success(`Request successfully ${statusAction}!`);

        await Promise.all([
          fetchAdminDashboardData(),
          fetchLeavesDashboardData(),
        ]);
      } else {
        toast.error(
          response?.message || "Action rejected by remote host configuration."
        );
      }
    } catch (err) {
      console.error(
        "Critical Exception inside request verification runtime:",
        err
      );
      toast.error(
        "Network communication breakdown. Check backend state registers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditFromRequest = (req) => {
    if (req.attendance) {
      setEditRecord({
        ...req.attendance,
        employeeId: req.employeeId,
        requestId: req.id,
      });
    } else {
      toast.error("Attendance record data missing for this request.");
    }
  };

  // ================= ATTENDANCE CORRECTION ACTION CONTROLLER =================
  const handleAttendanceRequestAction = async (id, statusAction) => {
    try {
      setLoading(true);

      const payload = {
        status: statusAction,
        remark: `${statusAction} - Check-in updated by administrator`,
      };

      const response = await CallApi(
        `/api/admin/attendance/request/${id}`,
        "PUT",
        payload
      );

      if (response && response.status) {
        toast.success(`Attendance adjustment successfully ${statusAction}!`);
        await Promise.all([
          fetchAdminDashboardData(),
          fetchAttendanceRequests(),
        ]);
      } else {
        toast.error(
          response?.message || "Action rejected by remote server configuration."
        );
      }
    } catch (err) {
      console.error("Attendance request execution error:", err);
      toast.error("Network synchronization lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

// ================= DYNAMIC COLORED EXCEL REPORT (WITH SUNDAYS & HOLIDAYS) =================
  const downloadExcelReport = () => {
    if (!displayLogs || displayLogs.length === 0) {
      toast.info("No Record Found");
      return;
    }

    const firstRow = displayLogs[0] || {};
    const currentEmp = employeeSummary.find(
      (item) => String(item.employee?.id) === String(inspectEmpId)
    );

    const empName =
      firstRow.employeeName ||
      firstRow.employee?.name ||
      currentEmp?.employee?.name ||
      `Employee #${inspectEmpId}`;

    const empEmail =
      firstRow.employeeEmail ||
      firstRow.employee?.email ||
      currentEmp?.employee?.email ||
      "—";

    // 1. Shift End: 7:00 PM (19:00) ke baad ka exact overtime calculate karna
    const calculateRowOvertimeMinutes = (checkOutVal) => {
      if (!checkOutVal) return 0;

      let outH = 0;
      let outM = 0;

      if (typeof checkOutVal === "string" && checkOutVal.includes(":") && !checkOutVal.includes("T")) {
        const parts = checkOutVal.split(":");
        outH = parseInt(parts[0], 10) || 0;
        outM = parseInt(parts[1], 10) || 0;
      } else {
        try {
          const d = new Date(checkOutVal);
          if (!isNaN(d.getTime())) {
            outH = d.getHours();
            outM = d.getMinutes();
          }
        } catch (e) {
          return 0;
        }
      }

      const totalOutMinutes = outH * 60 + outM;
      const shiftEndMinutes = 19 * 60; // 7:00 PM = 1140 minutes

      return totalOutMinutes > shiftEndMinutes ? totalOutMinutes - shiftEndMinutes : 0;
    };

    let totalOtMinutes = 0;
    const computedLogs = displayLogs.map((log) => {
      const otMins = calculateRowOvertimeMinutes(log.checkOut);
      totalOtMinutes += otMins;

      const formattedRowOt =
        otMins > 0
          ? `${String(Math.floor(otMins / 60)).padStart(2, "0")}:${String(otMins % 60).padStart(2, "0")}`
          : "00:00";

      return {
        ...log,
        computedOtMinutes: otMins,
        computedOvertimeStr: formattedRowOt,
      };
    });

    const dynamicTotalOvertimeStr =
      totalOtMinutes > 0
        ? `${String(Math.floor(totalOtMinutes / 60)).padStart(2, "0")}h ${String(
            totalOtMinutes % 60
          ).padStart(2, "0")}m`
        : "00h 00m";

    // 2. Logs ke status se dynamic counts (Sundays, Holidays, Present, etc.)
    const statusCounts = computedLogs.reduce((acc, curr) => {
      const s = (curr.status || "Unknown").trim();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // 3. Dynamic Summary Construction
    const summaryMetrics = [];

    if (filteredSummary && typeof filteredSummary === "object") {
      Object.entries(filteredSummary).forEach(([key, val]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        summaryMetrics.push({
          rawKey: key.toLowerCase(),
          label,
          value: val !== null && val !== undefined ? val : "0",
        });
      });

      // Backend summary me agar Sunday / Holiday keys nahi hain toh logs se auto-add
      Object.entries(statusCounts).forEach(([statusName, count]) => {
        const sLower = statusName.toLowerCase();
        if (sLower.includes("sunday") || sLower.includes("holiday")) {
          const alreadyExists = summaryMetrics.some((m) =>
            m.label.toLowerCase().includes(sLower)
          );
          if (!alreadyExists) {
            summaryMetrics.push({
              rawKey: sLower,
              label: `Total ${statusName}`,
              value: count,
            });
          }
        }
      });

      summaryMetrics.push({
        rawKey: "overtime",
        label: "Total Overtime (After 7 PM)",
        value: dynamicTotalOvertimeStr,
      });
    } else {
      summaryMetrics.push({
        rawKey: "records",
        label: "Total Records",
        value: computedLogs.length,
      });

      Object.entries(statusCounts).forEach(([statusName, count]) => {
        summaryMetrics.push({
          rawKey: statusName.toLowerCase(),
          label: `Total ${statusName}`,
          value: count,
        });
      });

      summaryMetrics.push({
        rawKey: "overtime",
        label: "Total Overtime (After 7 PM)",
        value: dynamicTotalOvertimeStr,
      });
    }

    // 4. Highlight Colors Palette (Including Sundays & Holidays)
    const getThemeColor = (keyOrStatus) => {
      const val = (keyOrStatus || "").toLowerCase();
      if (val.includes("absent")) return { bg: "#FFEBEB", color: "#C53030", border: "#FEB2B2" }; // Red
      if (val.includes("late")) return { bg: "#FEF3C7", color: "#B45309", border: "#FCD34D" }; // Amber
      if (val.includes("half")) return { bg: "#DBEAFE", color: "#1D4ED8", border: "#93C5FD" }; // Blue
      if (val.includes("overtime")) return { bg: "#F3E8FF", color: "#6B21A8", border: "#D8B4FE" }; // Purple
      if (val.includes("sunday")) return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" }; // Slate/Grey
      if (val.includes("holiday")) return { bg: "#FDF2F8", color: "#BE185D", border: "#FBCFE8" }; // Pink/Rose
      if (val.includes("present")) return { bg: "#E6FFFA", color: "#007A6C", border: "#81E6D9" }; // Teal/Green
      return { bg: "#F8FAFC", color: "#334155", border: "#CBD5E1" };
    };

    // 5. Excel XML Document Construction
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          td, th { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
        </style>
      </head>
      <body>
        <table border="0" cellpadding="6" cellspacing="0">
          <tr>
            <td colspan="9" style="background-color: #00a896; color: #ffffff; font-size: 14pt; font-weight: bold; text-align: center; padding: 10px;">
              MONTHLY ATTENDANCE & SUMMARY REPORT
            </td>
          </tr>
          <tr>
            <td colspan="4" style="font-weight: bold; color: #1e293b;">Employee: ${empName}</td>
            <td colspan="5" style="font-weight: bold; color: #1e293b; text-align: right;">Month / Year: ${selectedMonth}/${selectedYear}</td>
          </tr>
          <tr>
            <td colspan="4" style="color: #64748b;">Email: ${empEmail}</td>
            <td colspan="5" style="color: #64748b; text-align: right;">Office Shift: 10:00 AM - 07:00 PM</td>
          </tr>
          <tr><td colspan="9"></td></tr>

          <!-- HIGHLIGHTED SUMMARY SECTION -->
          <tr>
            <td colspan="4" style="background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 8px;">
              PERFORMANCE & ATTENDANCE SUMMARY
            </td>
            <td colspan="5"></td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #cbd5e1;">Metric Description</td>
            <td colspan="2" style="border: 1px solid #cbd5e1; text-align: center;">Summary Value</td>
            <td colspan="5"></td>
          </tr>
    `;

    summaryMetrics.forEach((metric) => {
      const theme = getThemeColor(metric.rawKey);
      tableHtml += `
        <tr>
          <td colspan="2" style="background-color: ${theme.bg}; color: ${theme.color}; border: 1px solid ${theme.border}; font-weight: 600;">
            ${metric.label}
          </td>
          <td colspan="2" style="background-color: ${theme.bg}; color: ${theme.color}; border: 1px solid ${theme.border}; font-weight: bold; text-align: center;">
            ${metric.value}
          </td>
          <td colspan="5"></td>
        </tr>
      `;
    });

    tableHtml += `
          <tr><td colspan="9"></td></tr>
          <tr><td colspan="9"></td></tr>

          <!-- DAILY ATTENDANCE LEDGER HEADERS -->
          <tr style="background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left;">
            <th style="padding: 8px; border: 1px solid #475569;">Date</th>
            <th style="padding: 8px; border: 1px solid #475569;">Employee Name</th>
            <th style="padding: 8px; border: 1px solid #475569;">Email</th>
            <th style="padding: 8px; border: 1px solid #475569;">Punch In</th>
            <th style="padding: 8px; border: 1px solid #475569;">Punch Out</th>
            <th style="padding: 8px; border: 1px solid #475569;">Working Hours</th>
            <th style="padding: 8px; border: 1px solid #475569; text-align: center;">Overtime (> 7:00 PM)</th>
            <th style="padding: 8px; border: 1px solid #475569; text-align: center;">Status</th>
            <th style="padding: 8px; border: 1px solid #475569;">Remarks</th>
          </tr>
    `;

    computedLogs.forEach((record) => {
      const workingHoursDisplay =
        record.workingHours ||
        (record.workingMinutes !== undefined
          ? record.workingMinutes > 0
            ? `${Math.floor(record.workingMinutes / 60)}h ${record.workingMinutes % 60}m`
            : "00h 00m"
          : "—");

      const statusTheme = getThemeColor(record.status);
      const isOt = record.computedOtMinutes > 0;
      const otBg = isOt ? "#F3E8FF" : "#ffffff";
      const otColor = isOt ? "#6B21A8" : "#64748b";

      tableHtml += `
        <tr>
          <td style="border: 1px solid #e2e8f0; font-weight: 600;">${formatDateToDDMMYYYY(record.attendanceDate)}</td>
          <td style="border: 1px solid #e2e8f0;">${record.employeeName || record.employee?.name || empName}</td>
          <td style="border: 1px solid #e2e8f0; color: #64748b;">${record.employeeEmail || record.employee?.email || empEmail}</td>
          <td style="border: 1px solid #e2e8f0; color: #007A6C; font-weight: 600;">${formatIsoTime(record.checkIn)}</td>
          <td style="border: 1px solid #e2e8f0;">${formatIsoTime(record.checkOut)}</td>
          <td style="border: 1px solid #e2e8f0; font-weight: 600;">${workingHoursDisplay}</td>
          <td style="border: 1px solid #e2e8f0; background-color: ${otBg}; color: ${otColor}; font-weight: ${isOt ? "bold" : "normal"}; text-align: center;">
            ${record.computedOvertimeStr}
          </td>
          <td style="border: 1px solid #e2e8f0; background-color: ${statusTheme.bg}; color: ${statusTheme.color}; font-weight: bold; text-align: center;">
            ${record.status || "—"}
          </td>
          <td style="border: 1px solid #e2e8f0; font-style: italic; color: #64748b;">${record.remarks || "—"}</td>
        </tr>
      `;
    });

    tableHtml += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `Attendance_${empName.replace(/\s+/g, "_")}_${selectedMonth}_${selectedYear}.xls`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);

    toast.success("Excel report with Sundays and Holidays downloaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Manage
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 italic">
            "Your leadership shapes our excellence. Monitor growth, manage
            workflows, and inspire daily achievements."
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate("/admin/manageholidays")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <FiGift size={14} />
            <span>Manage Holidays</span>
          </button>
          <button
            onClick={() => {
              fetchAdminDashboardData();
              fetchAttendanceRequests();
              fetchFilteredAttendance();
              fetchCalendarOverview(selectedMonth, selectedYear);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm"
          >
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Total Employees
            </p>
            <h3 className="text-lg font-bold">{todayStats.totalEmployees}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Present Today
            </p>
            <h3 className="text-lg font-bold">{todayStats.present}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <FiXCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Absent Today
            </p>
            <h3 className="text-lg font-bold">{todayStats.absent}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <FiAlertCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Late Arrivals
            </p>
            <h3 className="text-lg font-bold">{todayStats.late}</h3>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "attendance" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Attendance Record
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === "leaves" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Leave Approvals
          {pendingRequests.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "employees" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Employee Leaves Ledger
        </button>
        <button
          onClick={() => setActiveTab("attendancerequest")}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === "attendancerequest" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Attendance Request
          {attendanceRequests.filter(r => r.status?.toLowerCase() === "pending").length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {attendanceRequests.filter(r => r.status?.toLowerCase() === "pending").length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Monthly Graphical Summary
            </h3>
            <div className="flex items-center justify-around h-44">
              <div className="relative w-28 h-28 rounded-full border-[12px] border-emerald-500 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[12px] border-t-orange-500 border-r-amber-500 border-b-transparent border-l-transparent -m-[12px]"></div>
                <div className="text-center">
                  <span className="text-xl font-bold block">
                    {filteredSummary?.totalRecords ?? monthlyStats.totalRecords ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Logs
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                  <span>Present</span>{" "}
                  <span className="text-slate-400 ml-auto">
                    {filteredSummary?.present ?? monthlyStats.present}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>{" "}
                  <span>Late</span>{" "}
                  <span className="text-slate-400 ml-auto">
                    {filteredSummary?.late ?? monthlyStats.late}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>{" "}
                  <span>Half Day</span>{" "}
                  <span className="text-slate-400 ml-auto">
                    {filteredSummary?.halfDay ?? monthlyStats.halfDay}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>{" "}
                  <span>Absent</span>{" "}
                  <span className="text-slate-400 ml-auto">
                    {filteredSummary?.absent ?? monthlyStats.absent}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Attendance Calendar Overview
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border uppercase tracking-wider">
                  {getMonthNameStr()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b pb-2 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-y-3 text-xs font-medium text-center items-center">
              {calendarDays.map((slot, index) => {
                const { dotColor, detailText } = getDayDetails(slot.fullDateStr);
                return (
                  <div
                    key={index}
                    className="py-1 flex flex-col items-center justify-center relative min-h-[40px] group cursor-pointer"
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-xl transition ${!slot.isCurrentMonth
                        ? "text-slate-300"
                        : "text-slate-700 font-semibold group-hover:bg-slate-100"
                        }`}
                    >
                      {slot.day}
                    </span>
                    {slot.isCurrentMonth && dotColor && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${dotColor} absolute bottom-0`}
                      />
                    )}

                    {slot.isCurrentMonth && slot.fullDateStr && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] font-semibold rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap space-y-0.5 text-center border border-slate-700">
                          <p className="text-slate-300 text-[9px] font-bold border-b border-slate-700 pb-0.5">
                            {formatDateToDDMMYYYY(slot.fullDateStr)}
                          </p>
                          <p className="text-emerald-400 font-medium pt-0.5">
                            {detailText}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-3 mt-3 text-[10px] font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00a896]"></span> Present
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span> Holiday
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Sunday
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MONTHLY EMPLOYEE DEEP LEDGER ================= */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FiActivity size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Monthly Employee Deep Ledger
                </h3>
                {filteredSummary?.totalWorkingHours && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Total Hours Worked: <strong className="text-slate-700">{filteredSummary.totalWorkingHours} hrs</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

              <div className="relative flex items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold outline-none cursor-pointer pr-7"
                  title="Filter by Particular Date"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold outline-none cursor-pointer"
              >
                {[2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={inspectEmpId}
                onChange={(e) => setInspectEmpId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold outline-none cursor-pointer"
              >
                {employeeSummary.map((item) => (
                  <option key={item.employee.id} value={item.employee.id}>
                    {item.employee.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={downloadExcelReport}
                className="flex items-center gap-2 bg-[#00a896] hover:bg-[#009282] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <FiDownload size={14} />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Punch In Time</th>
                  <th className="py-2.5 px-4">Punch Out Time</th>
                  <th className="py-2.5 px-4">Working Hours</th>
                  <th className="py-2.5 px-4">Remarks Context</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filteredLoading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-semibold">
                      Loading Filtered Ledger Data...
                    </td>
                  </tr>
                ) : displayLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium italic">
                      No matching records found in deep ledger.
                    </td>
                  </tr>
                ) : (
                  currentLedgerRows.map((record, index) => (
                    <tr key={record.id || index} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {formatDateToDDMMYYYY(record.attendanceDate)}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">
                        {formatIsoTime(record.checkIn)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {formatIsoTime(record.checkOut)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-semibold">
                        {record.workingHours || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">
                        "{record.remarks || "No remarks"}"
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(record.status)}`}
                        >
                          {record.status || "Present"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewRecord(record)}
                            className="flex items-center gap-1 text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                            title="View Details"
                          >
                            <FiEye size={12} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => setEditRecord(record)}
                            className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                            title="Edit Record"
                          >
                            <FiEdit size={12} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CLIENT SIDE PAGINATION FOR DEEP LEDGER TABLE */}
          {ledgerTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 pt-3 bg-white select-none">
              <div className="text-xs text-slate-500">
                Showing <span className="font-semibold">{ledgerIndexOfFirstRow + 1}</span> to{" "}
                <span className="font-semibold">
                  {ledgerIndexOfLastRow > displayLogs.length ? displayLogs.length : ledgerIndexOfLastRow}
                </span>{" "}
                of <span className="font-semibold">{displayLogs.length}</span> entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLedgerCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={ledgerCurrentPage === 1}
                  className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(ledgerTotalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLedgerCurrentPage(i + 1)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors ${ledgerCurrentPage === i + 1
                        ? "bg-[#00a896] hover:bg-[#009282] text-white"
                        : "text-slate-600 hover:bg-slate-50 border hover:border-slate-200"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setLedgerCurrentPage((prev) => Math.min(prev + 1, ledgerTotalPages))}
                  disabled={ledgerCurrentPage === ledgerTotalPages}
                  className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TIMELINE / APPROVALS ROSTER FEED ================= */}
      <div className="w-full bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm capitalize">
            {activeTab === "attendance" && "Daily Roster Feed Timeline"}
            {activeTab === "leaves" && "Leave Workflow Approvals"}
            {activeTab === "employees" && "Company Leave Ledger"}
            {activeTab === "attendancerequest" && "Attendance Modification Workflow"}
          </h3>
        </div>

        {activeTab === "attendance" && (
          <div className="w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                    <th className="py-3 px-6">Staff Member</th>
                    <th className="py-3 px-6">Attendance Date</th>
                    <th className="py-3 px-6">Check In Log</th>
                    <th className="py-3 px-6">Check Out Log</th>
                    <th className="py-3 px-6">Working Hours</th>
                    <th className="py-3 px-6">Remarks Feedback</th>
                    <th className="py-3 px-6 text-center">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {currentTimelineRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="py-3 px-6 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-[10px] text-slate-600 uppercase">
                          {row.employee?.name ? row.employee.name[0] : "E"}
                        </div>
                        <div>
                          <span className="text-slate-800 font-semibold block">
                            {row.employee?.name || `Employee #${row.employeeId}`}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {row.employee?.email || "No email uploaded"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-slate-500 font-bold">
                        {formatDateToDDMMYYYY(row.attendanceDate)}
                      </td>
                      <td className="py-3 px-6 text-emerald-600 font-semibold">
                        {formatIsoTime(row.checkIn)}
                      </td>
                      <td className="py-3 px-6 text-slate-500">
                        {formatIsoTime(row.checkOut)}
                      </td>
                      <td className="py-3 px-6 text-slate-500">
                        {row.workingMinutes !== undefined
                          ? row.workingMinutes > 0
                            ? `${Math.floor(row.workingMinutes / 60)} : ${String(row.workingMinutes % 60).padStart(2, '0')} `
                            : "00 : 00 "
                          : "—"}
                      </td>

                      <td className="py-3 px-6 text-slate-400 italic">
                        "{row.remarks || "Standard punch"}"
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(row.status)}`}
                        >
                          {row.status || "Present"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {timelineTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white select-none">
                <div className="text-xs text-slate-500">
                  Showing <span className="font-semibold">{timelineIndexOfFirstRow + 1}</span> to{" "}
                  <span className="font-semibold">
                    {timelineIndexOfLastRow > attendanceLog.length ? attendanceLog.length : timelineIndexOfLastRow}
                  </span>{" "}
                  of <span className="font-semibold">{attendanceLog.length}</span> entries
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimelineCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={timelineCurrentPage === 1}
                    className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(timelineTotalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTimelineCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors ${timelineCurrentPage === i + 1
                          ? "bg-[#00a896] hover:bg-[#009282] text-white"
                          : "text-slate-600 hover:bg-slate-50 border hover:border-slate-200"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setTimelineCurrentPage((prev) => Math.min(prev + 1, timelineTotalPages))}
                    disabled={timelineCurrentPage === timelineTotalPages}
                    className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="overflow-x-auto w-full bg-white rounded-xl border border-slate-100 shadow-sm p-2">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                  <th className="py-3 px-6">Staff Member</th>
                  <th className="py-3 px-6">Leave Type</th>
                  <th className="py-3 px-6">Duration & Total Days</th>
                  <th className="py-3 px-6">Reason Statement</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {(() => {
                  const dashboardRequests =
                    leavesDashboardData?.requests?.data || [];

                  if (dashboardRequests.length === 0) {
                    return (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-8 text-slate-400 font-medium italic"
                        >
                          No leaves workflow entries registered in dashboard.
                        </td>
                      </tr>
                    );
                  }

                  return dashboardRequests.map((req, idx) => {
                    const displayDays = req.totalDays
                      ? parseFloat(req.totalDays)
                      : 0;

                    return (
                      <tr
                        key={req.id || idx}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <span className="text-slate-800 font-semibold block">
                            {req.employee?.name || "Unknown Employee"}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {req.employee?.email || "—"}
                          </span>
                        </td>

                        <td className="py-3 px-6">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded">
                            {req.leaveType?.name || "Leave Request"}
                          </span>
                        </td>

                        <td className="py-3 px-6 text-slate-600">
                          <div className="font-semibold text-slate-700">
                            {req.fromDate && formatDateToDDMMYYYY(req.fromDate)}{" "}
                            to {req.toDate && formatDateToDDMMYYYY(req.toDate)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            Duration:{" "}
                            <span className="font-bold text-slate-500">
                              {displayDays} Days
                            </span>
                          </div>
                        </td>

                        <td
                          className="py-3 px-6 text-slate-500 italic max-w-[220px] truncate"
                          title={req.reason}
                        >
                          "{req.reason || "No context statement submitted"}"
                        </td>

                        <td className="py-3 px-6 text-center">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${req.status?.toLowerCase() === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : req.status?.toLowerCase() === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                          >
                            {req.status || "Pending"}
                          </span>
                        </td>

                        <td className="py-3 px-6 text-center">
                          {req.status?.toLowerCase() === "pending" ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "Approved")
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1 text-[10px] font-bold shadow-sm transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "Rejected")
                                }
                                className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded px-3 py-1 text-[10px] font-bold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-normal italic">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "employees" && (
          <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-100 gap-3">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Policy Allotment: 1 Paid Leave & 1 Medical Leave per month.
                  Manage additions, reductions, and LWP.
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="bg-[#00a896] hover:bg-[#009282] text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <FiCalendar size={14} />
                <span>Manage Leave Balances</span>
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4 text-center bg-emerald-50/30 text-emerald-800">
                      Paid Leave (Total / Remaining)
                    </th>
                    <th className="py-3 px-4 text-center bg-blue-50/30 text-blue-800">
                      Medical Leave (Total / Remaining)
                    </th>
                    <th className="py-3 px-4 text-center text-rose-700">
                      Total Taken
                    </th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {employeeSummary.map((emp, idx) => {
                    const leaveSummaryList =
                      leavesDashboardData?.employeeSummary || [];
                    const targetedLeaveMeta = leaveSummaryList.find(
                      (item) =>
                        Number(item.employee?.id) === Number(emp.employee?.id)
                    );

                    const paidMeta = targetedLeaveMeta?.balance?.find(
                      (b) => b.leaveType === "Paid Leaves"
                    );
                    const medicalMeta = targetedLeaveMeta?.balance?.find(
                      (b) => b.leaveType === "Medical Leaves"
                    );

                    const totalPaid = paidMeta ? parseFloat(paidMeta.total) : 0;
                    const remainingPaid = paidMeta
                      ? parseFloat(paidMeta.remaining)
                      : 0;

                    const totalMedical = medicalMeta
                      ? parseFloat(medicalMeta.total)
                      : 0;
                    const remainingMedical = medicalMeta
                      ? parseFloat(medicalMeta.remaining)
                      : 0;

                    const totalTakenStr = targetedLeaveMeta?.totalTaken || "0";
                    const totalTaken = isNaN(parseFloat(totalTakenStr))
                      ? 0
                      : parseFloat(totalTakenStr);

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block">
                            {emp.employee?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {emp.employee?.email}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/10">
                          <span className="text-slate-400">
                            {totalPaid} Allocated
                          </span>
                          <span className="mx-2 font-bold text-slate-300">
                            |
                          </span>
                          <span className="text-emerald-600 font-bold">
                            {remainingPaid} Remaining
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50/10">
                          <span className="text-slate-400">
                            {totalMedical} Allocated
                          </span>
                          <span className="mx-2 font-bold text-slate-300">
                            |
                          </span>
                          <span className="text-blue-600 font-bold">
                            {remainingMedical} Remaining
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-rose-600 font-bold">
                          {totalTaken} Days
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              setSelectedEmployee(targetedLeaveMeta || emp)
                            }
                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
                          >
                            Inspect Ledger
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "attendancerequest" && (
          <div className="overflow-x-auto w-full p-2">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                  <th className="py-3 px-6">Staff Member</th>
                  <th className="py-3 px-6">Requested Action Type</th>
                  <th className="py-3 px-6">Submission Details</th>
                  <th className="py-3 px-6">Reason Statement</th>
                  <th className="py-3 px-6 text-center">Workflow Status</th>
                  <th className="py-3 px-6 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {attendanceRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-slate-400 font-medium italic"
                    >
                      No attendance correction workflows pending review.
                    </td>
                  </tr>
                ) : (
                  attendanceRequests.map((req, idx) => (
                    <tr
                      key={req.id || idx}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <span className="text-slate-800 font-semibold block">
                          {req.employee?.name || `Employee #${req.employeeId}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {req.employee?.email || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-6">
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded">
                          {req.requestType || "Correction"}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-slate-600">
                        <div className="font-semibold text-slate-700">
                          Date: {req.attendance?.attendanceDate ? formatDateToDDMMYYYY(req.attendance.attendanceDate) : "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Current Status: <span className="font-bold text-blue-600">{req.attendance?.status || "—"}</span>
                        </div>
                      </td>

                      <td
                        className="py-3 px-6 text-slate-500 italic max-w-[220px] truncate"
                        title={req.reason}
                      >
                        "{req.reason || "No context submitted"}"
                      </td>

                      <td className="py-3 px-6 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(req.status)}`}
                        >
                          {req.status || "Pending"}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status?.toLowerCase() === "pending" ? (
                            <>
                              <button
                                onClick={() => handleAttendanceRequestAction(req.id, "Approved")}
                                className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded transition shadow-sm cursor-pointer"
                                title="Approve Request"
                              >
                                <FiCheckCircle size={15} />
                              </button>

                              <button
                                onClick={() => handleAttendanceRequestAction(req.id, "Rejected")}
                                className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition shadow-sm cursor-pointer"
                                title="Reject Request"
                              >
                                <FiXCircle size={15} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic select-none">
                              Processed
                            </span>
                          )}

                          <span className="text-slate-200">|</span>

                          <button
                            onClick={() => handleOpenEditFromRequest(req)}
                            className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded transition shadow-sm cursor-pointer"
                            title="Edit Attendance Log"
                          >
                            <FiEdit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= COMPREHENSIVE INSPECT LEDGER MODAL ================= */}
      <Modal
        isOpen={selectedEmployee !== null}
        onClose={() => setSelectedEmployee(null)}
        title={
          selectedEmployee
            ? `Leave Balance Summary — ${selectedEmployee.employee?.name || ""}`
            : ""
        }
        widthClass="sm:w-[500px]"
      >
        {selectedEmployee &&
          (() => {
            const paidMeta = selectedEmployee.balance?.find(
              (b) => b.leaveType === "Paid Leaves"
            );
            const medicalMeta = selectedEmployee.balance?.find(
              (b) => b.leaveType === "Medical Leaves"
            );

            const allowedPaid = paidMeta ? parseFloat(paidMeta.total) : 0;
            const takenPaid = paidMeta ? parseFloat(paidMeta.used) : 0;
            const remainingPaid = paidMeta ? parseFloat(paidMeta.remaining) : 0;

            const allowedMedical = medicalMeta
              ? parseFloat(medicalMeta.total)
              : 0;
            const takenMedical = medicalMeta ? parseFloat(medicalMeta.used) : 0;
            const remainingMedical = medicalMeta
              ? parseFloat(medicalMeta.remaining)
              : 0;

            const totalTakenStr = selectedEmployee.totalTaken || "0";
            const totalTaken = isNaN(parseFloat(totalTakenStr))
              ? 0
              : parseFloat(totalTakenStr);

            return (
              <div className="space-y-4 text-xs select-none">
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-2">
                  <span className="font-bold text-emerald-800 block border-b border-emerald-200/60 pb-1 text-[13px]">
                    Paid Leave Ledger (PL)
                  </span>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Allocated Quota:</span>
                    <span className="font-semibold text-slate-800">
                      {allowedPaid} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Leaves Taken (Used):</span>
                    <span className="font-semibold text-amber-600">
                      {takenPaid} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-slate-700">
                      Remaining Balance:
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {remainingPaid} Days
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 space-y-2">
                  <span className="font-bold text-blue-800 block border-b border-blue-200/60 pb-1 text-[13px]">
                    Medical Leave Ledger (ML)
                  </span>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Allocated Quota:</span>
                    <span className="font-semibold text-slate-800">
                      {allowedMedical} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Leaves Taken (Used):</span>
                    <span className="font-semibold text-amber-600">
                      {takenMedical} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-slate-700">
                      Remaining Balance:
                    </span>
                    <span className="font-bold text-blue-600 text-sm">
                      {remainingMedical} Days
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-slate-600 font-medium">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-400">Total Leaves Taken:</span>
                    <span className="text-rose-600 font-bold">
                      {totalTaken} Days
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">
                      System Registered Email:
                    </span>
                    <span className="text-slate-700 font-semibold">
                      {selectedEmployee.employee?.email || "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* ================= VIEW MODAL ================= */}
      <Modal
        isOpen={viewRecord !== null}
        onClose={() => setViewRecord(null)}
        title={
          viewRecord
            ? `View Attendance — ${formatDateToDDMMYYYY(viewRecord.attendanceDate)}`
            : ""
        }
        widthClass="sm:w-[500px]"
      >
        {viewRecord && (
          <div className="space-y-4 text-xs p-1 text-slate-600">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
              <div>
                <span className="text-slate-400 block mb-0.5">Date</span>
                <span className="font-bold text-slate-800">
                  {formatDateToDDMMYYYY(viewRecord.attendanceDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(viewRecord.status)}`}
                >
                  {viewRecord.status || "Present"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  Punch In Time
                </span>
                <span className="text-emerald-600 font-bold">
                  {formatIsoTime(viewRecord.checkIn)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  Punch Out Time
                </span>
                <span className="text-slate-700 font-bold">
                  {formatIsoTime(viewRecord.checkOut)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">
                  Working Hours
                </span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 border rounded inline-block">
                  {viewRecord.workingHours || "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-semibold">
                Remarks Context
              </span>
              <p className="bg-slate-50/50 p-3 rounded-lg border border-slate-200 italic text-slate-700">
                "{viewRecord.remarks || "No remarks registered"}"
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= EDIT MODAL ================= */}
      <Modal
        isOpen={editRecord !== null}
        onClose={() => setEditRecord(null)}
        title={editRecord ? `Edit Attendance Log` : ""}
        widthClass="sm:w-[500px]"
      >
        {editRecord && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const updatedData = {
                attendanceDate: formData.get("attendanceDate"),
                checkIn: formData.get("checkIn"),
                checkOut: formData.get("checkOut"),
                status: formData.get("status"),
                remarks: formData.get("remarks"),
              };

              try {
                setLoading(true);
                const apiUrl = `/api/admin/attendance/${editRecord.id}`;
                const response = await CallApi(apiUrl, "PUT", updatedData);

                if (response && response.status) {
                  toast.success("Attendance ledger updated successfully!");
                  setEditRecord(null);
                  fetchAdminDashboardData();
                  fetchFilteredAttendance();
                } else {
                  toast.error(response?.message || "Failed to update record.");
                }
              } catch (err) {
                console.error("Error updates:", err);
                toast.error("Network configuration breakdown.");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4 text-xs p-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Date</label>
                <input
                  type="date"
                  name="attendanceDate"
                  required
                  defaultValue={
                    editRecord.attendanceDate?.includes("T")
                      ? editRecord.attendanceDate.split("T")[0]
                      : editRecord.attendanceDate
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 font-semibold text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  name="status"
                  defaultValue={editRecord.status || "Present"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Punch In Time</label>
                <input
                  type="time"
                  name="checkIn"
                  required
                  defaultValue={formatTimeForInput(editRecord.checkIn)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 text-slate-600 font-medium cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Punch Out Time</label>
                <input
                  type="time"
                  name="checkOut"
                  required
                  defaultValue={formatTimeForInput(editRecord.checkOut)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 text-slate-600 font-medium cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">Remarks Context</label>
              <textarea
                name="remarks"
                required
                defaultValue={editRecord.remarks || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-600 text-xs"
                rows="3"
                placeholder="Enter detailed remarks here..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00a896] hover:bg-[#009282] text-white rounded-lg font-semibold shadow-sm transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ================= DYNAMIC LEAVE BALANCE CONTROL FORM ================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Manage System Leave Balances & Adjustments"
        widthClass="sm:w-[500px]"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const empId = Number(formData.get("employeeId"));
            const baseRemarks =
              formData.get("quotaRemarks") || "Leave adjustment by admin";
            const currentYear = new Date().getFullYear();

            try {
              setLoading(true);

              const apiRequests = [];

              const paidAmount = Number(formData.get("paidLeaveAmount")) || 0;
              if (paidAmount > 0) {
                const calculatedPaidDays =
                  formData.get("paidLeaveAction") === "increase"
                    ? paidAmount
                    : -paidAmount;
                const paidPayload = {
                  employeeId: empId,
                  leaveTypeId: 1,
                  year: currentYear,
                  totalDays: calculatedPaidDays,
                  usedDays: 0,
                  pendingDays: 0,
                  reason: `${baseRemarks} (Paid Leave)`,
                };
                apiRequests.push(
                  CallApi("/api/admin/leaves/balance", "POST", paidPayload)
                );
              }

              const medicalAmount =
                Number(formData.get("medicalLeaveAmount")) || 0;
              if (medicalAmount > 0) {
                const calculatedMedicalDays =
                  formData.get("medicalLeaveAction") === "increase"
                    ? medicalAmount
                    : -medicalAmount;
                const medicalPayload = {
                  employeeId: empId,
                  leaveTypeId: 2,
                  year: currentYear,
                  totalDays: calculatedMedicalDays,
                  usedDays: 0,
                  pendingDays: 0,
                  reason: `${baseRemarks} (Medical Leave)`,
                };
                apiRequests.push(
                  CallApi("/api/admin/leaves/balance", "POST", medicalPayload)
                );
              }

              if (apiRequests.length > 0) {
                await Promise.all(apiRequests);
                toast.success("Leave matrices matching company profile saved!");
              } else {
                toast.info(
                  "No alterations requested. Non-zero value required."
                );
              }

              setIsLeaveModalOpen(false);
              fetchAdminDashboardData();
              fetchLeavesDashboardData();
            } catch (err) {
              console.error(
                "Critical Exception inside balance endpoint mapping:",
                err
              );
              toast.error("Failed to parse remote adjustment modifications.");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 text-xs p-1"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">
              Target Employee Member
            </label>
            <select
              name="employeeId"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="">-- Select Employee --</option>
              {employeeSummary.map((item) => (
                <option key={item.employee.id} value={item.employee.id}>
                  {item.employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-3">
            <span className="font-bold text-emerald-800 block border-b border-emerald-200/60 pb-1">
              Paid Leave Balance (PL)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">
                  Adjustment Type
                </label>
                <select
                  name="paidLeaveAction"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-emerald-500 font-bold text-emerald-700 cursor-pointer"
                >
                  <option value="increase">➕ Increase Balance</option>
                  <option value="decrease">➖ Decrease Balance</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Days</label>
                <input
                  type="number"
                  name="paidLeaveAmount"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-emerald-500 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 space-y-3">
            <span className="font-bold text-blue-800 block border-b border-blue-200/60 pb-1">
              Medical Leave Balance (ML)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">
                  Adjustment Type
                </label>
                <select
                  name="medicalLeaveAction"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 font-bold text-blue-700 cursor-pointer"
                >
                  <option value="increase">➕ Increase Balance</option>
                  <option value="decrease">➖ Decrease Balance</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Days</label>
                <input
                  type="number"
                  name="medicalLeaveAmount"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
            <label className="font-bold text-rose-700">
              Update Manual Leave Without Pay (LWP Days)
            </label>
            <input
              type="number"
              name="lwpCountUpdate"
              min="0"
              defaultValue="0"
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 font-bold text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">
              Adjustment Context Statement
            </label>
            <textarea
              name="quotaRemarks"
              rows="3"
              required
              placeholder="Reasoning notes for updating the PL/ML balances (e.g., Policy standard monthly update)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500 text-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00a896] hover:bg-[#009282] text-white rounded-lg font-semibold shadow-sm transition cursor-pointer"
            >
              Execute Modifications
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceTracker;