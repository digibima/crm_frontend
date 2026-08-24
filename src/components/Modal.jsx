import React from "react";
import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, title, widthClass = "sm:w-[550px]", children }) => {
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
        bg-white w-full rounded-2xl shadow-xl border border-slate-100 
        z-10 overflow-hidden transition-all duration-300 ease-out
        ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}
        ${widthClass}
      `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
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

export default Modal;