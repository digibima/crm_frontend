import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ menu, onClose, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white text-slate-800 flex flex-col h-full border-r border-slate-100 select-none rounded-r-[32px] shadow-[4px_0_24px_rgba(0,0,0,0.015)] relative transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64 sm:w-68"}
      `}
    >
      {/* ================= LOGO SECTION ================= */}
      <div className="h-20 flex items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-center w-full transition-all duration-300"
        >
          {isCollapsed ? (
            //  (Mini Logo/Icon) 
            <img
              src="/logoicon.png"
              alt="Digibima Icon"
              className="h-9 w-9 object-contain animate-fadeIn"
            />
          ) : (

            <img
              src="/logo.png"
              alt="Digibima"
              className="h-10 sm:h-11 w-auto object-contain animate-fadeIn"
            />
          )}
        </Link>

        <button
          onClick={onClose}
          className="lg:hidden h-9 w-9 rounded-xl bg-slate-50 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center text-slate-400"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* ================= DESKTOP COLLAPSE TOGGLE BUTTON ================= */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute right-[-14px] top-7 h-7 w-7 bg-white border border-slate-100 shadow-md rounded-full items-center justify-center text-slate-500 hover:text-slate-800 transition-all z-50 cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
      </button>

      {/* ================= NAVIGATION LINKS ================= */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              onClick={onClose}
              title={isCollapsed ? item.title : ""}
              className={({ isActive }) => `
                relative flex items-center rounded-xl text-[14px] font-semibold tracking-wide
                transition-all duration-200 group py-3.5
                ${isCollapsed ? "justify-center px-0 mx-1" : "gap-4 px-4"}
                ${isActive
                  ? "text-slate-800 bg-slate-50/50 font-bold"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/30"
                }
              `}
            >
              {({ isActive }) => (
                <>

                  {isActive && (
                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[5px] h-8 bg-[#0ea5e9] rounded-r-md"></div>
                  )}


                  <div
                    className={`transition-colors shrink-0 ${isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                  >
                    <Icon size={18} />
                  </div>


                  <span
                    className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                      }`}
                  >
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ================= USER PROFILE FOOTER ================= */}
      <div className="p-3 border-t border-slate-50 shrink-0">
        <div
          className={`flex items-center rounded-xl p-1.5 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"
            }`}
        >

          <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>


          <div
            className={`truncate transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
              }`}
          >
            <h4 className="text-sm font-semibold text-slate-700 truncate leading-tight">
              {user?.name || "Guest"}
            </h4>

            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">
              {user?.role
                ?.replace(/_/g, " ")
                ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "User"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;