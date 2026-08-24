import { useState, useEffect } from "react";
import {
    FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
    FaCalendarAlt, FaBriefcase, FaClipboardCheck, FaHistory,
    FaSignInAlt, FaSignOutAlt, FaTimesCircle, FaClock, FaAdjust,
    FaPaperPlane, FaUmbrellaBeach, FaNotesMedical
} from "react-icons/fa";
import { FiActivity, FiFileText, FiCheckCircle } from "react-icons/fi";
import { CallApi } from "../../../api";
import constant from "../../../env";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";

export default function MyAttendance() {
    const [time, setTime] = useState(new Date());
    const [userName, setUserName] = useState("User");
    const [currentDate, setCurrentDate] = useState(new Date());

    const [attendanceData, setAttendanceData] = useState([]);
    const [overviewStats, setOverviewStats] = useState({
        presentDays: "00",
        absentDays: "00",
        lateDays: "00",
        halfDays: "00",
        totalWorkingDays: "00"
    });

    const [todayData, setTodayData] = useState({
        punchIn: "—",
        punchOut: "—",
        workingHours: "00h 00m",
        breakHours: "00h 00m",
        overtime: "00h 00m",
        isPunchedIn: false
    });

    const [loading, setLoading] = useState(true);
    const [punchLoading, setPunchLoading] = useState(false);
    const [error, setError] = useState(null);

    // ================= NEW LEAVE STATES =================
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const [leaveType, setLeaveType] = useState("1");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    
    // Half Day functionality states
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [halfDayType, setHalfDayType] = useState("first_half");
    
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveLogLoading, setLeaveLogLoading] = useState(true); // Leave Log Loader

    // ================= ATTENDANCE CORRECTION STATES =================
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
    const [isCorrectionFormOpen, setIsCorrectionFormOpen] = useState(false);
    const [requestType, setRequestType] = useState("Missed Check In");
    const [correctionReason, setCorrectionReason] = useState("");
    const [correctionLoading, setCorrectionLoading] = useState(false);

    const [leaveBalances, setLeaveBalances] = useState([]);
    const [leaveApplications, setLeaveApplications] = useState([]); // अब यह API से लाइव लोड होगा

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
            try {
                const parsedUser = JSON.parse(localUserStr);
                if (parsedUser && parsedUser.name) {
                    setUserName(parsedUser.name);
                } else if (typeof parsedUser === "string") {
                    setUserName(parsedUser);
                }
            } catch (e) {
                setUserName(localUserStr);
            }
        }

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hrs = time.getHours();
        if (hrs < 12) return "Good Morning";
        if (hrs < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const parseLogDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const dateObj = new Date(dateString);
            return dateObj.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } catch (e) {
            return dateString;
        }
    };

    const parseLogTime = (isoString) => {
        if (!isoString) return "—";
        if (!isoString.includes("T")) return isoString;
        try {
            const dateObj = new Date(isoString);
            return dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (e) {
            return "—";
        }
    };

    const formatStringTime = (timeStr) => {
        if (!timeStr) return "—";
        const [hours, minutes] = timeStr.split(":");
        const hourNum = parseInt(hours, 10);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        const adjustedHour = hourNum % 12 || 12;
        return `${String(adjustedHour).padStart(2, "0")}:${minutes} ${ampm}`;
    };

    const fetchTodayStatus = async () => {
        try {
            const apiUrl = "/api/employee/attendance/today";
            const response = await CallApi(apiUrl, "GET");

            if (response && response.status && response.data) {
                const today = response.data;
                setTodayData({
                    punchIn: today.checkIn ? formatStringTime(today.checkIn) : "—",
                    punchOut: today.checkOut ? formatStringTime(today.checkOut) : "—",
                    workingHours: today.workingHours ? `${today.workingHours.replace(":", "h ")}m` : "00h 00m",
                    breakHours: "00h 00m",
                    overtime: today.overtime ? `${today.overtime.replace(":", "h ")}m` : "00h 00m",
                    isPunchedIn: today.checkIn && !today.checkOut ? true : false
                });
            } else {
                setTodayData({
                    punchIn: "—", punchOut: "—", workingHours: "00h 00m",
                    breakHours: "00h 00m", overtime: "00h 00m", isPunchedIn: false
                });
            }
        } catch (err) {
            console.error("Error synchronizing today's log snapshot:", err);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = constant.API.EMPLOYEE.ATTENDANCE.HISTORY;
            const response = await CallApi(apiUrl, "GET");

            if (response && response.status && response.data) {
                const historyLog = response.data.data || [];
                setAttendanceData(historyLog);

                let present = 0, absent = 0, late = 0, half = 0;
                historyLog.forEach((log) => {
                    const currentStatus = log.status ? log.status.toLowerCase() : "";
                    if (currentStatus === "present") present++;
                    else if (currentStatus === "absent") absent++;
                    else if (currentStatus === "late") late++;
                    else if (currentStatus === "half_day" || currentStatus === "half day") half++;
                });

                setOverviewStats({
                    presentDays: String(present).padStart(2, "0"),
                    absentDays: String(absent).padStart(2, "0"),
                    lateDays: String(late).padStart(2, "0"),
                    halfDays: String(half).padStart(2, "0"),
                    totalWorkingDays: String(historyLog.length).padStart(2, "0")
                });
            } else {
                setAttendanceData([]);
            }
        } catch (err) {
            console.error("Attendance API trigger exception:", err);
            setError("Failed to sync history from cloud log server");
            toast.error("Unable to load live attendance logs.");
        } finally {
            setLoading(false);
        }
    };

    // ================= UPDATE: DASHBOARD API INTEGRATION =================
    const fetchLeaveBalances = async () => {
        try {
            setLeaveLogLoading(true);
            const response = await CallApi("/api/employee/leaves/dashboard", "GET");

            if (response && response.status && response.data) {
                // 1. Leave Balances Map करना
                if (response.data.leaveTypes) {
                    const mappedBalances = response.data.leaveTypes.map((leave) => {
                        let color = "text-slate-600 bg-slate-50";
                        let icon = <FaBriefcase />;
                        const nameLower = leave.name?.toLowerCase() || "";

                        if (nameLower.includes("paid")) {
                            color = "text-blue-600 bg-blue-50";
                            icon = <FaUmbrellaBeach />;
                        } else if (nameLower.includes("medical")) {
                            color = "text-emerald-600 bg-emerald-50";
                            icon = <FaNotesMedical />;
                        }

                        return {
                            id: leave.id || leave.leaveTypeId,
                            type: leave.name,
                            count: parseInt(leave.remaining, 10) < 0 ? 0 : parseInt(leave.remaining, 10),
                            total: parseInt(leave.total, 10) || 0,
                            used: parseInt(leave.used, 10) || 0,
                            color: color,
                            icon: icon
                        };
                    });
                    setLeaveBalances(mappedBalances);
                }

                // 2. Leave Request Logs Map करना (api/employee/leaves/dashboard का requests एरे)
                if (response.data.requests) {
                    const formatOpt = { day: "2-digit", month: "short", year: "numeric" };
                    const mappedRequests = response.data.requests.map((req) => {
                        const fromD = new Date(req.fromDate).toLocaleDateString("en-US", formatOpt);
                        const toD = new Date(req.toDate).toLocaleDateString("en-US", formatOpt);
                        
                        // अगर Single Day Half Day लीव है तो ड्यूरेशन में दिखाना
                        const durationStr = fromD === toD 
                            ? `${fromD} ${req.isHalfDay ? `(${req.halfDayType === 'first_half' ? '1st Half' : '2nd Half'})` : ''}`
                            : `${fromD} - ${toD}`;

                        return {
                            id: req.id,
                            duration: durationStr,
                            type: req.leaveType?.name || "Leave",
                            reason: req.reason || "No Reason",
                            status: req.status || "Pending"
                        };
                    });
                    setLeaveApplications(mappedRequests);
                }
            }
        } catch (err) {
            console.error("Error fetching leave balances & logs:", err);
        } finally {
            setLeaveLogLoading(false);
        }
    };

    const syncDashboardData = () => {
        fetchTodayStatus();
        fetchAttendanceHistory();
        fetchLeaveBalances();
    };

    useEffect(() => {
        syncDashboardData();
    }, []);

    const handlePunchAction = async () => {
        if (punchLoading) return;

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        try {
            setPunchLoading(true);

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true, 
                    timeout: 5000,            
                    maximumAge: 0           
                });
            });

            const payload = {
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
                remarks: todayData.isPunchedIn ? "Completed Work" : "Office Check In"
            };

            const actionUrl = todayData.isPunchedIn
                ? "/api/employee/attendance/check-out"
                : "/api/employee/attendance/check-in";

            const response = await CallApi(actionUrl, "POST", payload);

            if (response && response.status) {
                toast.success(response.message || (todayData.isPunchedIn ? "Punched Out Successfully!" : "Punched In Successfully!"));
                syncDashboardData();
            } else {
                toast.error(response?.message || "Punch action rejected by server.");
            }
        } catch (err) {
            console.error("Punch system failure:", err);
            
            if (err.code === 1) {
                toast.error("Location permission denied. Please allow location access.");
            } else if (err.code === 3) {
                toast.error("Location request timed out. Please try again.");
            } else {
                toast.error(err.message || "Network sync lost. Please try again.");
            }
        } finally {
            setPunchLoading(false);
        }
    };

    const handleApplyLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate || !leaveReason) {
            toast.error("Please fill all duration parameters and reasons.");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Start date cannot be greater than end date.");
            return;
        }

        try {
            setLeaveLoading(true);
            const payload = {
                leaveTypeId: Number(leaveType),
                fromDate: startDate,
                toDate: endDate,
                reason: leaveReason,
                isHalfDay: isHalfDay,
                halfDayType: isHalfDay ? halfDayType : null
            };

            const response = await CallApi("/api/employee/leaves/request", "POST", payload);

            if (response && response.status) {
                toast.success("Leave application dispatched for review!");
                setIsLeaveModalOpen(false);
                setLeaveReason("");
                setStartDate("");
                setEndDate("");
                setIsHalfDay(false);
                setHalfDayType("first_half");

                // डेटा री-सिंक करें ताकि नया लॉग तुरंत टेबल में दिखे
                fetchLeaveBalances();
            } else {
                toast.error(response?.message || "Failed to submit leave request.");
            }
        } catch (err) {
            console.error("Leave request error:", err);
            toast.error("Network sync lost. Please try again.");
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleCorrectionSubmit = async (e) => {
        e.preventDefault();
        if (!correctionReason) {
            toast.error("Please provide a reason for the request.");
            return;
        }

        try {
            setCorrectionLoading(true);

            const payload = {
                attendanceId: selectedCalendarDate?.log?.id || null,
                requestType: requestType,
                reason: correctionReason
            };

            const response = await CallApi("/api/employee/attendance/request", "POST", payload);

            if (response && response.status) {
                toast.success("Attendance request transmitted to admin successfully!");
                setIsCorrectionFormOpen(false);
                setIsDayDetailsOpen(false);
                setCorrectionReason("");
                setRequestType("Missed Check In");
            } else {
                toast.error(response?.message || "Failed to submit request.");
            }
        } catch (err) {
            console.error("Correction Request Error:", err);
            toast.error("Network sync error. Please try again.");
        } finally {
            setCorrectionLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleResetToToday = () => {
        setCurrentDate(new Date());
    };

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

        const daySlots = [];

        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            daySlots.push({
                day: totalDaysInPrevMonth - i,
                isCurrentMonth: false,
                fullDateStr: ""
            });
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dynamicMonthStr = String(month + 1).padStart(2, "0");
            const dynamicDayStr = String(day).padStart(2, "0");
            const fullDateStr = `${year}-${dynamicMonthStr}-${dynamicDayStr}`;

            daySlots.push({
                day: day,
                isCurrentMonth: true,
                fullDateStr: fullDateStr
            });
        }

        return daySlots;
    };

    const getDayStatusDot = (fullDateStr) => {
        if (!fullDateStr) return null;
        const logMatch = attendanceData.find(log => log.attendanceDate === fullDateStr);
        if (!logMatch) return null;

        const status = logMatch.status ? logMatch.status.toLowerCase() : "";
        if (status === "present") return "bg-[#00a896]";
        if (status === "absent") return "bg-rose-500";
        if (status === "late") return "bg-amber-500";
        if (status === "half_day" || status === "half day") return "bg-blue-500";
        return null;
    };

    const getStatusStyle = (status) => {
        const formatted = status ? status.toLowerCase() : "";
        if (formatted.includes("present") || formatted.includes("time") || formatted.includes("approved")) {
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        } else if (formatted.includes("absent") || formatted.includes("rejected") || formatted.includes("no record")) {
            return "bg-rose-50 text-rose-700 border-rose-100";
        } else if (formatted.includes("late") || formatted.includes("pending")) {
            return "bg-amber-50 text-amber-700 border-amber-100";
        }
        return "bg-slate-50 text-slate-700 border-slate-200";
    };

    const calendarDays = generateCalendarDays();
    const todayFormattedStr = new Date().toISOString().split("T")[0];

    return (
        <div className="font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Attendance</h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 font-medium">
                        Location-based attendance & leave dashboard
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between min-h-[260px]">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Today, {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                                <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-lg tracking-wide uppercase">
                                    Working Day
                                </span>
                            </div>

                            <div className="text-center my-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{formatTime(time)}</h2>
                                <p className="text-xs text-gray-400 mt-0.5 font-medium flex items-center justify-center gap-1">
                                    {getGreeting()}, {userName} <span className="animate-bounce">👋</span>
                                </p>
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100/80 pt-3">
                                <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-slate-400" /> Jaipur, Rajasthan</span>
                                <span className="flex items-center gap-1 text-[#00a896] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a896] inline-block animate-pulse"></span> Location Verified
                                </span>
                            </div>

                            <button
                                disabled={punchLoading}
                                onClick={handlePunchAction}
                                className={`w-full text-white text-sm font-bold py-3 px-4 rounded-xl mt-3 flex items-center justify-center gap-2 transition-all duration-200 tracking-wider shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase ${todayData.isPunchedIn
                                    ? "bg-[#df2c4a] hover:bg-[#c5223e] shadow-lg"
                                    : "bg-[#00a896] hover:bg-[#009282] shadow-lg"
                                    }`}
                            >
                                {punchLoading ? "Processing..." : todayData.isPunchedIn ? <><FaSignOutAlt size={15} /> Punch Out</> : <><FaSignInAlt size={15} /> Punch In</>}
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between min-h-[260px]">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-1.5">
                                <FaClipboardCheck className="text-[#00a896]/70" /> Today's Attendance
                            </h3>
                            <div className="divide-y divide-slate-100 text-xs w-full font-medium">
                                <div className="flex justify-between py-2.5"><span className="text-slate-500">Punch In</span><span className="font-bold text-slate-700">{todayData.punchIn}</span></div>
                                <div className="flex justify-between py-2.5"><span className="text-slate-500">Punch Out</span><span className="font-bold text-slate-700">{todayData.punchOut}</span></div>
                                <div className="flex justify-between py-2.5"><span className="text-slate-500">Working Hours</span><span className="font-bold text-slate-700">{todayData.workingHours}</span></div>
                                <div className="flex justify-between py-2.5"><span className="text-slate-500">Break Hours</span><span className="font-bold text-slate-700">{todayData.breakHours}</span></div>
                                <div className="flex justify-between py-2.5"><span className="text-slate-500">Overtime</span><span className="font-bold text-slate-700">{todayData.overtime}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">This Month Overview</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {[
                                { title: "Present Days", count: overviewStats.presentDays, style: "bg-teal-50 text-teal-700 border-teal-100", icon: <FiCheckCircle size={16} /> },
                                { title: "Absent Days", count: overviewStats.absentDays, style: "bg-rose-50 text-rose-700 border-rose-100", icon: <FaTimesCircle size={16} /> },
                                { title: "Late Days", count: overviewStats.lateDays, style: "bg-amber-50 text-amber-700 border-amber-100", icon: <FaClock size={16} /> },
                                { title: "Half Days", count: overviewStats.halfDays, style: "bg-blue-50 text-blue-700 border-blue-100", icon: <FaAdjust size={16} /> }
                            ].map((item, idx) => (
                                <div key={idx} className={`${item.style} border rounded-xl p-3 flex flex-col justify-between min-h-[95px]`}>
                                    <div className="flex items-start justify-between w-full">
                                        <span className="text-[10px] font-bold uppercase tracking-wide block leading-tight opacity-80">{item.title}</span>
                                        <span>{item.icon}</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold mt-2 block leading-none">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Attendance Calendar</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrevMonth} className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50"><FaChevronLeft size={10} /></button>
                                <span className="text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded-lg bg-white text-slate-600 flex items-center gap-1 uppercase tracking-wider">
                                    <FaCalendarAlt className="text-slate-400" /> {currentDate.toLocaleString("en-US", { month: "short", year: "numeric" })}
                                </span>
                                <button onClick={handleNextMonth} className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50"><FaChevronRight size={10} /></button>
                                <button onClick={handleResetToToday} className="text-xs font-semibold px-3 py-1 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">Today</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b pb-2 mb-2">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>

                        <div className="grid grid-cols-7 gap-y-3 text-xs sm:text-sm font-medium text-center">
                            {calendarDays.map((slot, index) => {
                                const dotColorClass = getDayStatusDot(slot.fullDateStr);
                                const isTodayDate = slot.fullDateStr === todayFormattedStr;
                                const dayLog = attendanceData.find(log => log.attendanceDate === slot.fullDateStr);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            if (slot.isCurrentMonth) {
                                                setSelectedCalendarDate({
                                                    ...slot,
                                                    log: dayLog || { status: "No Record / Absent", checkIn: "—", checkOut: "—" }
                                                });
                                                setIsDayDetailsOpen(true);
                                            }
                                        }}
                                        className={`py-1 flex flex-col items-center justify-center relative min-h-[42px] rounded-xl transition-all ${slot.isCurrentMonth
                                            ? 'cursor-pointer hover:bg-slate-100'
                                            : 'text-slate-300 opacity-40 pointer-events-none'
                                            }`}
                                    >
                                        <span className={`w-7 h-7 flex items-center justify-center rounded-xl transition ${isTodayDate
                                            ? "bg-[#00a896] text-white font-bold"
                                            : !slot.isCurrentMonth ? "text-slate-300" : "text-slate-700"
                                            }`}>
                                            {slot.day}
                                        </span>
                                        {slot.isCurrentMonth && dotColorClass && !isTodayDate && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} absolute bottom-0`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <FaBriefcase className="text-[#00a896]" /> Leave Balance
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                            {leaveBalances.map((leave, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`${leave.color} p-1 rounded-md text-xs shrink-0`}>{leave.icon}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{leave.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold text-slate-900 block leading-none">{String(leave.count).padStart(2, "0")}</span>
                                        <span className="text-[9px] text-gray-400 font-medium">Available</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-[#00a896] h-full" style={{ width: `${(leave.count / leave.total) * 100}%` }} />
                                    </div>
                                    <span className="text-[9px] text-gray-400 block font-medium">Used: {leave.used}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsLeaveModalOpen(true)}
                            className="w-full bg-[#00a896] hover:bg-[#009282] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                            <FaPaperPlane className="text-sm" />
                            <span>Apply Leave Request</span>
                        </button>
                    </div>

                    {/* ================= LIVE LEAVE RECORDS TABLE ================= */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <FiFileText className="text-[#00a896]" /> My Leave Log Records
                        </h3>
                        <div className="overflow-x-auto text-xs font-medium">
                            <table className="w-full text-left border-collapse min-w-[240px]">
                                <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="pb-2">Duration</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-slate-700">
                                    {leaveLogLoading ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-gray-400">Loading leave snapshot...</td></tr>
                                    ) : leaveApplications.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-gray-400">No leave requests logged yet.</td></tr>
                                    ) : (
                                        leaveApplications.map((leave, idx) => (
                                            <tr key={leave.id || idx} className="hover:bg-slate-50/50 transition">
                                                <td className="py-2.5 font-semibold text-slate-900 text-[11px]">{leave.duration}</td>
                                                <td className="py-2.5 text-slate-600 font-bold">{leave.type.split(" ")[0]}</td>
                                                <td className="py-2.5 text-right">
                                                    <span className={`border font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide ${getStatusStyle(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <FaHistory className="text-[#00a896]" /> Recent Attendance History
                        </h3>
                        <div className="overflow-x-auto text-xs font-medium">
                            <table className="w-full text-left border-collapse min-w-[240px]">
                                <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="pb-2">Date</th>
                                        <th className="pb-2">In / Out</th>
                                        <th className="pb-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-slate-700">
                                    {loading ? <tr><td colSpan="3" className="text-center py-4 text-gray-400">Fetching live entries...</td></tr> :
                                        error ? <tr><td colSpan="3" className="text-center py-4 text-rose-500">{error}</td></tr> :
                                            attendanceData.length === 0 ? <tr><td colSpan="3" className="text-center py-4 text-gray-400">No logs detected.</td></tr> :
                                                attendanceData.slice(0, 5).map((log, index) => (
                                                    <tr key={log.id || index} className="hover:bg-slate-50/50 transition">
                                                        <td className="py-2.5 font-bold text-slate-900">{parseLogDate(log.attendanceDate)}</td>
                                                        <td className="py-2.5 text-slate-600 font-semibold whitespace-nowrap">
                                                            {parseLogTime(log.checkIn)} - {parseLogTime(log.checkOut)}
                                                        </td>
                                                        <td className="py-2.5 text-right">
                                                            <span className={`border font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide ${getStatusStyle(log.status)}`}>
                                                                {log.status || "Present"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isLeaveModalOpen}
                onClose={() => {
                    setIsLeaveModalOpen(false);
                    setIsHalfDay(false);
                }}
                title="Apply For Leave Request"
                widthClass="sm:w-[500px]"
            >
                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs font-medium text-slate-700">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-bold">Leave Classification Type</label>
                        <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-teal-500 outline-none"
                        >
                            <option value="1">Paid Leave (1 / Month)</option>
                            <option value="2">Medical Leave (1 / Month)</option>
                            <option value="3">Salary Deduct Leave (LWP / Unpaid)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-500 font-bold">Start Date</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-500 font-bold">End Date</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                disabled={isHalfDay}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-500 outline-none disabled:opacity-60"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                        <label className="flex items-center gap-2 text-slate-500 font-bold cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isHalfDay}
                                onChange={(e) => {
                                    setIsHalfDay(e.target.checked);
                                    if(e.target.checked) {
                                        setEndDate(startDate);
                                    }
                                }}
                                className="w-4 h-4 text-[#00a896] border-slate-200 rounded focus:ring-teal-500 accent-[#00a896]"
                            />
                            <span>Apply as Half Day</span>
                        </label>
                        
                        {isHalfDay && (
                            <div className="flex flex-col gap-1.5 mt-1 transition-all">
                                <label className="text-slate-500 font-bold">Half Day Period Type</label>
                                <select
                                    value={halfDayType}
                                    onChange={(e) => setHalfDayType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-teal-500 outline-none"
                                >
                                    <option value="first_half">First Half</option>
                                    <option value="second_half">Second Half</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-bold">Reason Statement Context</label>
                        <textarea
                            rows="4"
                            required
                            placeholder="Provide details for leave validation..."
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-teal-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={leaveLoading}
                        className="w-full bg-[#00a896] hover:bg-[#009282] text-white font-bold py-3 rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
                    >
                        {leaveLoading ? "Submitting Request..." : "Transmit Application"}
                    </button>
                </form>
            </Modal>

            {/* Modal 1: Day Details */}
            <Modal
                isOpen={isDayDetailsOpen}
                onClose={() => setIsDayDetailsOpen(false)}
                title={selectedCalendarDate ? `Log Details: ${parseLogDate(selectedCalendarDate.fullDateStr)}` : "Day Details"}
                widthClass="sm:w-[400px]"
            >
                {selectedCalendarDate && (
                    <div className="space-y-4 text-xs font-medium text-slate-700">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500">Day Status</span>
                                <span className={`border font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide ${getStatusStyle(selectedCalendarDate.log?.status)}`}>
                                    {selectedCalendarDate.log?.status}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 py-2">
                                <span className="text-slate-500">Check In Time</span>
                                <span className="font-bold text-slate-700">{parseLogTime(selectedCalendarDate.log?.checkIn)}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-slate-500">Check Out Time</span>
                                <span className="font-bold text-slate-700">{parseLogTime(selectedCalendarDate.log?.checkOut)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDayDetailsOpen(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl uppercase tracking-wider transition"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDayDetailsOpen(false);
                                    setIsCorrectionFormOpen(true);
                                }}
                                className="flex-1 bg-[#00a896] hover:bg-[#009282] text-white font-bold py-2.5 rounded-xl uppercase tracking-wider transition shadow-sm"
                            >
                                Request Fix
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal 2: Correction Form */}
            <Modal
                isOpen={isCorrectionFormOpen}
                onClose={() => setIsCorrectionFormOpen(false)}
                title={selectedCalendarDate ? `Correction Request: ${parseLogDate(selectedCalendarDate.fullDateStr)}` : "Attendance Correction"}
                widthClass="sm:w-[450px]"
            >
                <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs font-medium text-slate-700">
                    <p className="text-gray-400 leading-relaxed">
                        Select the type of adjustment required and specify the context for the administration review.
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-bold">Adjustment Request Type</label>
                        <select
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-teal-500 outline-none"
                        >
                            <option value="Missed Check In">Missed Check In</option>
                            <option value="Missed Check Out">Missed Check Out</option>
                            <option value="Wrong Entry">Wrong Entry</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-bold">Reason Statement Context</label>
                        <textarea
                            rows="4"
                            required
                            placeholder="Provide details explaining why the correction is needed..."
                            value={correctionReason}
                            onChange={(e) => setCorrectionReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-teal-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCorrectionFormOpen(false);
                                setIsDayDetailsOpen(true);
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl uppercase tracking-wider transition"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={correctionLoading}
                            className="flex-1 bg-[#00a896] hover:bg-[#009282] text-white font-bold py-3 rounded-xl uppercase tracking-wider transition shadow-md disabled:opacity-50"
                        >
                            {correctionLoading ? "Transmitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}