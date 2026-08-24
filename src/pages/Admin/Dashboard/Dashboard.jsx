import React, { useEffect, useState } from 'react';
import constant from "../../../env";
import { CallApi } from "../../../api";
import { Player } from '@lottiefiles/react-lottie-player';
import { FiActivity } from 'react-icons/fi';

import employeesLottie from '../../../assets/lottie/icono.json';
import trendingLottie from '../../../assets/lottie/arrow going up.json';
import convertedLottie from '../../../assets/lottie/tick green.json';
import clockLottie from '../../../assets/lottie/Clock Lottie Animation.json';

const DashboardLight = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await CallApi(
        constant.API.ADMIN.VIEWDASHBOARD,
        "GET"
      );
      if (response && response.status) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 font-medium text-sm animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  const summary = dashboardData?.summary;
  const recentActivities = dashboardData?.recentActivities || [];
  const monthlyTrend = dashboardData?.charts?.monthlyTrend || [];

  const stats = [
    {
      title: 'Employees',
      value: String(summary?.employees?.total ?? 0).padStart(2, '0'),
      change: `${summary?.employees?.active ?? 0} Active (${summary?.employees?.new ?? 0} New)`,
      isPositive: true,
      lottieData: employeesLottie,
      isPurple: true
    },
    {
      title: 'Total Tasks / Leads',
      value: String(summary?.tasks?.total ?? 0),
      change: `Pending: ${summary?.tasks?.pending ?? 0}`,
      isPositive: true,
      lottieData: trendingLottie,
      color: 'bg-emerald-500/10'
    },
    {
      title: 'Converted / Completed',
      value: String(summary?.tasks?.completed ?? 0),
      change: `Not Converted: ${summary?.tasks?.notConverted ?? 0}`,
      isPositive: true,
      lottieData: convertedLottie,
      color: 'bg-purple-500/10'
    },
    {
      title: 'Follow-ups & Pending',
      value: String(summary?.tasks?.followUp ?? 0),
      change: `Call Again: ${summary?.tasks?.callAgain ?? 0}`,
      isPositive: false,
      lottieData: clockLottie,
      color: 'bg-rose-500/10'
    },
  ];

  // Helper function to extract initials for user avatar
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NA';
  };

  // Helper function to format status badges
  const getStatusBadge = (status = '') => {
    const formatted = status.replace(/_/g, ' ').toUpperCase();
    switch (status) {
      case 'completed':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">• {formatted}</span>;
      case 'pending':
      case 'follow_up':
      case 'call_again':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-500">• {formatted}</span>;
      case 'not_converted':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-500">• {formatted}</span>;
      default:
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">• {formatted}</span>;
    }
  };

  // Max value for chart bar height calculation
  const maxTrendVal = Math.max(...monthlyTrend.map(item => item.total), 1);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Good Morning, Anurag!</h1>
        <p className="text-xs text-slate-400 mt-0.5">Here's what's happening with your business today.</p>
      </div>

      {/* Top Cards Grid */}
      {/* Top Cards Grid */}
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
                    <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">{card.title}</p>
                    <h3 className="text-4xl font-bold text-white mt-1 tracking-tight">{card.value}</h3>
                  </div>
                  {/* Clean rounded container for Lottie */}
                  <div className="w-12 h-12 rounded-full bg-white/90 text-white flex items-center justify-center p-2 overflow-hidden shrink-0">
                    <Player
                      autoplay
                      loop
                      src={card.lottieData}
                      z
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-white/90 font-medium mt-3">{card.change}</p>
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
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-4xl font-bold text-slate-700 mt-1 tracking-tight">{card.value}</h3>
                </div>
                {/* Fixed Container Size and Opacity for White Cards */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 overflow-hidden shrink-0 ${card.color}`}>
                  <Player
                    autoplay
                    loop
                    src={card.lottieData}
                    className="mix-blend-multiply"
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              </div>
              <p className={`text-[11px] font-semibold mt-3 ${card.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
            <FiActivity className="text-cyan-500" size={16} />
            <h3 className="font-bold text-slate-700 text-sm tracking-wide">Monthly Trend</h3>
          </div>
          <div className="h-40 flex items-end gap-4 border-b border-slate-100 pb-2 px-2">
            {monthlyTrend.map((item, index) => {
              const heightPercent = item.total > 0 ? Math.max((item.total / maxTrendVal) * 100, 8) : 4;
              return (
                <div key={index} className="w-full flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.total}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-indigo-500 rounded-t-xl transition-all hover:opacity-80"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-3 px-1">
            {monthlyTrend.map((item, index) => (
              <span key={index} className="w-full text-center">{item.month}</span>
            ))}
          </div>
        </div>

        {/* Dynamic Attendance Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-700 text-sm tracking-wide mb-6 border-b border-slate-50 pb-3">Today's Attendance</h3>
            <div className="flex items-center justify-around py-2">
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-8 border-slate-50 border-t-cyan-400 border-r-cyan-400">
                <div className="text-center">
                  <span className="text-xl font-bold text-slate-700 block leading-tight">
                    {summary?.attendance?.present ?? 0} / {summary?.attendance?.total ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-6 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Present
                  </span>
                  <span className="text-slate-700">
                    {summary?.attendance?.present ?? 0}/{summary?.attendance?.total ?? 0} ({summary?.attendance?.percentage ?? 0}%)
                  </span>
                </div>
                <div className="flex items-center gap-6 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Late
                  </span>
                  <span className="text-slate-400">
                    {summary?.attendance?.late ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-6 justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Absent
                  </span>
                  <span className="text-slate-400">
                    {summary?.attendance?.absent ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium px-3 py-2 rounded-xl text-center">
            {summary?.attendance?.percentage >= 50 ? '✓ Great! Team attendance is on track today.' : '⚠️ Attendance needs attention today.'}
          </div>
        </div>
      </div>

      {/* Dynamic Recent Activities Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide">Recent activity</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse custom-ui-table min-w-[600px]">
            <thead>
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="pl-6 py-3">EMPLOYEE</th>
                <th className="py-3">CLIENT</th>
                <th className="py-3">ACTION / TYPE</th>
                <th className="py-3">STATUS</th>
                <th className="pr-6 py-3">DATE</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600">
              {recentActivities.length > 0 ? (
                recentActivities.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors border-t border-slate-50">
                    <td className="pl-6 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-cyan-100 text-cyan-600">
                        {getInitials(row.assignedTo)}
                      </div>
                      <span className="text-slate-700 font-semibold whitespace-nowrap">{row.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td className="whitespace-nowrap text-slate-500 py-3">{row.clientName || 'N/A'}</td>
                    <td className="whitespace-nowrap py-3">
                      <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-slate-100 text-slate-600 uppercase">
                        {row.action || row.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="pr-6 text-slate-400 text-xs whitespace-nowrap py-3">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No recent activities available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardLight;