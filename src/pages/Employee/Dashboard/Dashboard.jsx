import React, { useEffect, useState } from "react";
import constant from "../../../env";
import { CallApi } from "../../../api";
import { toast } from "react-toastify";
import { Player } from "@lottiefiles/react-lottie-player";
import { 
  FiActivity, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBriefcase, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiList 
} from "react-icons/fi";

import tasksLottie from "../../../assets/lottie/task.json";
import completedLottie from "../../../assets/lottie/arrow going up.json";
import pendingLottie from "../../../assets/lottie/Clock Lottie Animation.json";
import attendanceLottie from "../../../assets/lottie/tick green.json";

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setImgError(false);
      const response = await CallApi(
        constant.API.EMPLOYEE.VIEWDASHBOARD,
        "GET"
      );

      if (response && response.status) {
        setDashboardData(response.data);
      } else {
        toast.error(response?.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const getProfileImageUrl = (profileData) => {
    if (!profileData) return null;

    if (profileData.profileImageRaw) {
      const baseUrl = constant.BASE_URL || "http://localhost:3333";
      const cleanPath = profileData.profileImageRaw.startsWith("/")
        ? profileData.profileImageRaw.slice(1)
        : profileData.profileImageRaw;
      return `${baseUrl}/${cleanPath}`;
    }

    if (profileData.profileImage) {
      return profileData.profileImage.replace("0.0.0.0", "localhost");
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Loading Dashboard...
      </div>
    );
  }

  // API Data Extraction
  const profile = dashboardData?.profile || {};
  const taskSummary = dashboardData?.taskSummary || {};
  const taskStatusDistribution = dashboardData?.taskStatusDistribution || {};
  const attendanceSummary = dashboardData?.attendanceSummary || {};
  const leaveSummary = dashboardData?.leaveSummary || [];
  const recentTasks = dashboardData?.recentTasks || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const weeklyTrend = dashboardData?.weeklyTrend || [];
  const todayAttendance = dashboardData?.todayAttendance;
  const pendingLeaveRequests = dashboardData?.pendingLeaveRequests || 0;

  // Leave Totals
  const totalRemainingLeaves = leaveSummary.reduce((acc, curr) => acc + (Number(curr.remaining) || 0), 0);
  const totalUsedLeaves = leaveSummary.reduce((acc, curr) => acc + (Number(curr.used) || 0), 0);

  const stats = [
    {
      title: "Total Tasks",
      value: taskSummary.total ?? 0,
      change: `${taskSummary.completed ?? 0} Completed`,
      isPositive: true,
      lottieData: tasksLottie,
      isPurple: true,
    },
    {
      title: "Completed Tasks",
      value: taskSummary.completed ?? 0,
      change: `${
        taskSummary.total ? Math.round(((taskSummary.completed ?? 0) / taskSummary.total) * 100) : 0
      }% completion rate`,
      isPositive: true,
      lottieData: completedLottie,
      color: "bg-emerald-500/10",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceSummary.attendancePercentage ?? 0}%`,
      change: `${attendanceSummary.present ?? 0}/${attendanceSummary.totalWorkingDays ?? 0} Days Present`,
      isPositive: (attendanceSummary.attendancePercentage ?? 0) >= 75,
      lottieData: attendanceLottie,
      color: "bg-purple-500/10",
    },
    {
      title: "Leaves Remaining",
      value: `${totalRemainingLeaves} Days`,
      change: `${totalUsedLeaves} Used | ${pendingLeaveRequests} Pending Req`,
      isPositive: true,
      lottieData: pendingLottie,
      color: "bg-amber-500/10",
    },
  ];

  const maxWeeklyTotal = Math.max(...weeklyTrend.map((item) => item.total), 1);
  const profileImgUrl = getProfileImageUrl(profile);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profileImgUrl && !imgError ? (
            <img
              src={profileImgUrl}
              alt={profile.name || "User Avatar"}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-md shrink-0"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Welcome back, {profile.name || "User"}!
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><FiBriefcase className="text-cyan-500"/> {profile.designation?.toUpperCase() || "N/A"}</span>
              <span className="flex items-center gap-1"><FiMail className="text-cyan-500"/> {profile.email || "N/A"}</span>
              <span className="flex items-center gap-1"><FiPhone className="text-cyan-500"/> {profile.mobile || "N/A"}</span>
              <span className="flex items-center gap-1"><FiCalendar className="text-cyan-500"/> DOJ: {profile.doj ? profile.doj.split('T')[0] : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((card, idx) => {
          if (card.isPurple) {
            return (
              <div
                key={idx}
                className="purple-gradient-card p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px] border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                      {card.title}
                    </p>
                    <h3 className="text-4xl font-bold text-white mt-1 tracking-tight">
                      {card.value}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/90 text-white flex items-center justify-center p-2 overflow-hidden shrink-0">
                    <Player
                      autoplay
                      loop
                      src={card.lottieData}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                </div>
                <p className="text-xs text-white/90 font-medium mt-3">
                  {card.change}
                </p>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="stat-glass-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-4xl font-bold text-slate-700 mt-1 tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-1 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Player
                    autoplay
                    loop
                    src={card.lottieData}
                    className="mix-blend-multiply"
                    style={{ height: "32px", width: "32px" }}
                  />
                </div>
              </div>
              <p className={`text-[11px] font-semibold mt-3 ${card.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
              <FiActivity className="text-cyan-500" size={16} />
              <h3 className="font-bold text-slate-700 text-sm tracking-wide">
                Weekly Task Trend
              </h3>
            </div>
            <div className="h-40 flex items-end gap-3 border-b border-slate-100 pb-2 px-2">
              {weeklyTrend.length > 0 ? (
                weeklyTrend.map((day, idx) => {
                  const heightPercentage = Math.round((day.total / maxWeeklyTotal) * 100);
                  return (
                    <div key={idx} className="w-full flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        {day.completed}/{day.total} Completed
                      </div>
                      <div
                        style={{ height: `${heightPercentage > 0 ? heightPercentage : 6}%` }}
                        className={`w-full rounded-2xl transition-all hover:opacity-90 ${
                          day.total > 0 ? "bg-indigo-500" : "bg-slate-100"
                        }`}
                      ></div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-xs text-slate-400 my-auto">
                  No weekly trend data available
                </div>
              )}
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-3 px-1">
              {weeklyTrend.map((day, idx) => (
                <span key={idx} className="w-full text-center">
                  {day.date}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pending</span>
              <span className="font-bold text-slate-700">{taskStatusDistribution.pending ?? 0}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl">
              <span className="text-emerald-500 block text-[10px] uppercase font-semibold">Completed</span>
              <span className="font-bold text-emerald-700">{taskStatusDistribution.completed ?? 0}</span>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl">
              <span className="text-amber-500 block text-[10px] uppercase font-semibold">Follow Up</span>
              <span className="font-bold text-amber-700">{taskStatusDistribution.followUp ?? 0}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl">
              <span className="text-blue-500 block text-[10px] uppercase font-semibold">Call Again</span>
              <span className="font-bold text-blue-700">{taskStatusDistribution.callAgain ?? 0}</span>
            </div>
            <div className="bg-rose-50 p-2 rounded-xl">
              <span className="text-rose-500 block text-[10px] uppercase font-semibold">Not Converted</span>
              <span className="font-bold text-rose-700">{taskStatusDistribution.notConverted ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-700 text-sm tracking-wide mb-6 border-b border-slate-50 pb-3">
              Attendance Overview
            </h3>
            <div className="flex items-center justify-around py-2">
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-8 border-slate-50 border-t-cyan-400 border-r-cyan-400 shrink-0">
                <div className="text-center">
                  <span className="text-lg font-bold text-slate-700 block leading-tight">
                    {attendanceSummary.present ?? 0} / {attendanceSummary.totalWorkingDays ?? 0}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                    Present
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-500 w-full pl-4">
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Late
                  </span>
                  <span className="text-slate-700">{attendanceSummary.late ?? 0} Days</span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent
                  </span>
                  <span className="text-slate-700">{attendanceSummary.absent ?? 0} Days</span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Half Day
                  </span>
                  <span className="text-slate-700">{attendanceSummary.halfDay ?? 0} Days</span>
                </div>
                <div className="flex items-center gap-2 justify-between pt-1 border-t border-slate-50">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FiClock /> Total Hrs
                  </span>
                  <span className="text-slate-700 font-bold">{attendanceSummary.totalWorkingHours || "00:00"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 border text-xs font-medium px-3 py-2 rounded-xl text-center ${
            todayAttendance 
              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
              : "bg-amber-50 border-amber-100 text-amber-600"
          }`}>
            {todayAttendance ? "✓ Attendance Marked Today" : "⚠️ Today's Attendance Not Marked Yet"}
          </div>
        </div>
      </div>

      {/* Leave Summary Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide">
            Leave Balances
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Pending Requests: {pendingLeaveRequests}
          </span>
        </div>

        <div className="space-y-4">
          {leaveSummary.length > 0 ? (
            leaveSummary.map((item, idx) => (
              <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">
                    {item.leaveType}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Total: {item.total} Days
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-lg font-bold text-slate-700 mt-0.5 block">
                      {item.total} Days
                    </span>
                  </div>

                  <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100/60 shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Remaining
                    </span>
                    <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                      {item.remaining} Days
                    </span>
                  </div>

                  <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-100/60 shadow-sm">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                      Used
                    </span>
                    <span className="text-lg font-bold text-rose-700 mt-0.5 block">
                      {item.used} Days
                    </span>
                  </div>

                  <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100/60 shadow-sm">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      Pending
                    </span>
                    <span className="text-lg font-bold text-amber-700 mt-0.5 block">
                      {item.pending} Days
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-slate-400">
              No leave balance data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Tasks & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm tracking-wide flex items-center gap-2">
                <FiList className="text-indigo-500" /> Recent Assigned Tasks
              </h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-50">
                    <th className="pl-6 py-3">TASK</th>
                    <th>CLIENT</th>
                    <th>CATEGORY</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th className="pr-6">FOLLOW-UP</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-600">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td className="pl-6 py-3.5 font-semibold text-slate-700">{task.taskAction}</td>
                        <td className="text-slate-500">{task.clientName || "N/A"}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[11px] font-semibold">
                            {task.insuranceCategory}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            • {task.status}
                          </span>
                        </td>
                        <td className="pr-6 text-slate-400">{task.followUpDate ? task.followUpDate.split('T')[0] : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">No recent tasks available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide mb-4 pb-2 border-b border-slate-50">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 shrink-0 mt-0.5">
                    <FiActivity size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-snug">{act.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Client: {act.client}</span>
                      <span>•</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;