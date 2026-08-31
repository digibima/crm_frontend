import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useNotification } from "../../context/NotificationContext";
import RELEASE_NOTES from "../../constants/releaseNotes";
import Modal from "../../components/Modal";
import {
  FaBell,
  FaBars,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaTasks,
  FaCheckCircle,
  FaCheckDouble,
  FaUser,
} from "react-icons/fa";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Header = ({ config, onMenuToggle, user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const { unreadCount, notifications, markAllAsRead, markAsRead } =
    useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const navigate = useNavigate();
  const lastNotificationCount = useRef(0);
  const isInitialMount = useRef(true);

  // Check if user is Admin
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const formatNotificationDate = (timestamp) => {
    if (!timestamp) return "—";
    const dateObj = new Date(timestamp);

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  const handleNotificationNavigation = (notification) => {
    // Admin click par kuch mat karo
    if (isAdmin) return;

    if (markAsRead && notification.id) {
      markAsRead(notification.id);
    } else {
      notification.read = true;
    }

    const targetTaskId = notification.taskId || notification.taskid;

    if (targetTaskId) {
      navigate("/employee/task", {
        state: { taskId: targetTaskId, timestamp: Date.now() },
      });
    } else {
      navigate("/employee/task");
    }
    setShowNotifications(false);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (notifications.length > lastNotificationCount.current) {
      const latest = notifications[0];
      const toastText =
        latest.message && latest.message.trim() !== ""
          ? latest.message
          : latest.title;

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          if (ctx.state === "suspended") ctx.resume();

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.value = 850;

          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch (error) {
        console.log("Audio play failed:", error);
      }

      toast(
        <div className="flex flex-col gap-1 pr-2">
          <p className="font-bold text-slate-800 text-[14px]">
            {isAdmin && latest.user?.name
              ? `Notification from ${latest.user.name}`
              : "New Notification"}
          </p>
          <p className="text-slate-600 text-[13px] font-medium leading-snug">
            {toastText}
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: false,
          closeOnClick: !isAdmin,
          draggable: true,
          icon: (
            <div className="p-1.5 bg-violet-100 text-violet-600 rounded-xl">
              <FiCheckCircle size={20} />
            </div>
          ),
          onClick: () => !isAdmin && handleNotificationNavigation(latest),
          className: `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 rounded-2xl p-4 min-h-[70px] ${
            isAdmin ? "" : "cursor-pointer"
          }`,
          progressClassName: "bg-gradient-to-r from-violet-500 to-fuchsia-500",
        }
      );
    }
    lastNotificationCount.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const unreadNotificationsList = notifications.filter(
    (notification) => !notification.read
  );

  return (
    <>
      <header className="sticky top-0 z-40 h-24 bg-transparent px-4 sm:px-8 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-5 pointer-events-auto">
          <button
            onClick={onMenuToggle}
            className="lg:hidden h-11 w-11 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.03)] duration-300 flex items-center justify-center"
          >
            <FaBars />
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {config.right?.map((item, index) => {
            switch (item.type) {
              case "notification":
                return (
                  <div key={index} className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative h-12 w-12 rounded-2xl bg-white text-[#bd59d4] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 flex items-center justify-center border border-white"
                    >
                      <motion.div
                        animate={
                          unreadCount > 0
                            ? {
                                rotate: [0, -18, 18, -12, 12, 0],
                                scale: [1, 1.15, 1],
                              }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={{
                          duration: 0.8,
                          repeat: unreadCount > 0 ? Infinity : 0,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <FaBell size={18} />
                      </motion.div>

                      {unreadCount > 0 && (
                        <>
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 animate-ping opacity-75"></span>
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500 border-2 border-white"></span>
                          </span>

                          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white shadow-lg">
                            {unreadCount}
                          </span>
                        </>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-[440px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Top Header */}
                        <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                            Notifications ({unreadCount})
                          </span>

                          {/* Hide "Mark all as read" for Admin */}
                          {!isAdmin && unreadNotificationsList.length > 0 && (
                            <button
                              onClick={() => markAllAsRead()}
                              className="flex items-center gap-1 text-[12px] font-semibold text-violet-600 hover:text-violet-800 cursor-pointer transition-colors"
                            >
                              <FaCheckDouble className="text-[11px]" />
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {unreadNotificationsList.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 px-6">
                            <FaBell className="text-5xl text-slate-300 mb-3" />
                            <h3 className="text-base font-semibold text-slate-700">
                              No New Notifications
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                              You're all caught up.
                            </p>
                          </div>
                        ) : (
                          unreadNotificationsList.map((notification, i) => {
                            const hasMessage =
                              notification.message &&
                              notification.message.trim() !== "";
                            const displayText = hasMessage
                              ? notification.message
                              : notification.title;

                            const sender = notification.user;

                            return (
                              <div
                                key={notification.timestamp || notification.id || i}
                                className={`flex gap-3 p-4 border-b border-slate-100 transition-all duration-300 ${
                                  isAdmin
                                    ? "bg-slate-50/40"
                                    : "hover:bg-violet-50/60"
                                }`}
                              >
                                {/* Left Icon / User Avatar */}
                                <div className="relative shrink-0">
                                  {isAdmin && sender ? (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
                                      {sender.avatar ? (
                                        <img
                                          src={sender.avatar}
                                          alt={sender.name}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        sender.name?.charAt(0).toUpperCase() || <FaUser size={14} />
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md">
                                      <FaTasks className="text-white text-base" />
                                    </div>
                                  )}

                                  {!notification.read && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
                                    </span>
                                  )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                  {/* User Details for Admin */}
                                  {isAdmin && sender && (
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[12px] font-bold text-slate-800 truncate">
                                        {sender.name || "Employee"}
                                      </span>
                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                                        Employee
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="font-medium text-slate-800 text-[13px] leading-snug break-words">
                                      {displayText}
                                    </h4>
                                    {!notification.read && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold shrink-0">
                                        NEW
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-2.5">
                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                      <FiClock className="text-[12px]" />
                                      {formatNotificationDate(
                                        notification.timestamp
                                      )}
                                    </div>

                                    {/* Hide View Button for Admin */}
                                    {!isAdmin && (
                                      <button
                                        onClick={() =>
                                          handleNotificationNavigation(
                                            notification
                                          )
                                        }
                                        className="flex items-center gap-1 text-violet-600 text-[12px] font-semibold hover:text-violet-700 cursor-pointer"
                                      >
                                        <FaCheckCircle className="text-[11px]" />
                                        View
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );

              case "profile":
                return (
                  <div key={index} className="relative" ref={dropdownRef}>
                    <div
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-3 bg-gradient-to-r from-[#b158cf] to-[#604cb0] pl-3 pr-4 py-2 rounded-full cursor-pointer shadow-md hover:opacity-95 transition-all text-white min-w-[160px] max-w-[220px] h-12 border border-white/10"
                    >
                      <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
                        <FaUserCircle size={20} />
                      </div>

                      <div className="hidden sm:block text-left flex-1 min-w-0">
                        <h4 className="font-bold text-white text-[13px] tracking-wide truncate leading-tight">
                          {user?.name || "Admin User"}
                        </h4>
                        <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wider block mt-0.5 leading-none">
                          {user?.role || "ADMIN"}
                        </p>
                      </div>

                      <FaChevronDown
                        className={`text-white/80 text-[10px] transition-transform ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {showDropdown && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => {
                            navigate(item.route || "/admin/profile");
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                          <FaUserCircle className="text-slate-400" />
                          Profile
                        </button>

                        <div className="border-t border-slate-100"></div>
                        <button
                          onClick={() => {
                            setShowVersionModal(true);
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-violet-50 transition font-medium"
                        >
                          <span className="text-violet-500">🚀</span>
                          Version {RELEASE_NOTES.version}
                        </button>
                        <div className="border-t border-slate-100"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition font-semibold"
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </header>

      {/* Version Modal */}
      <Modal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title={`Version ${RELEASE_NOTES.version} Update`}
        widthClass="sm:w-[700px]"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              🚀
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Version {RELEASE_NOTES.version}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Released {RELEASE_NOTES.dateLabel}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {RELEASE_NOTES.updates.map((section, index) => (
              <section
                key={index}
                className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
              >
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  {section.module}
                </h3>

                <ul className="space-y-2 pl-5 list-disc marker:text-violet-500">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-[13px] leading-5 text-slate-600"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <p className="text-xs font-medium text-emerald-700">
              ✨ More improvements are continuously rolling out!
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;