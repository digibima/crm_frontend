import React from "react";
import { FaUserTie, FaUser } from "react-icons/fa";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function Home() {
    const navigate = useNavigate();


    useEffect(() => {
        const message = sessionStorage.getItem("error");

        if (message) {
            toast.error(message);
            sessionStorage.removeItem("error");
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#17246d] via-[#204d97] to-[#0ba6a6] flex items-center justify-center px-4 sm:px-6 py-10 antialiased select-none">
            <style>{`
                @keyframes typingEffect {
                    0%, 90%, 100% { width: 0; }
                    30%, 70% { width: 48ch; } 
                }
                @keyframes cursorBlink {
                    50% { border-color: transparent; }
                }
                .animate-typing {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    border-right: 2px solid #0ba6a6;
                    width: 0; 
                    
                    animation: 
                        typingEffect 6s steps(48, end) infinite, 
                        cursorBlink 0.75s step-end infinite;
                }
            `}</style>

            <div className="text-center w-full max-w-4xl">

                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(11,166,166,0.3)] transition-transform duration-500 hover:scale-105">
                        <img src="/logoicon.png" alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
                    </div>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 tracking-tight">
                    Digibima
                </h1>

                <div className="h-6 flex justify-center items-center mt-2 max-w-[290px] sm:max-w-none mx-auto overflow-hidden">
                    <p className="text-gray-300 tracking-[2px] sm:tracking-[4px] uppercase text-[10px] sm:text-xs font-bold animate-typing">
                        Your Digital Insurance Partner
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 justify-center mt-12 sm:mt-16 items-center w-full max-w-sm sm:max-w-none mx-auto">
                    <div
                        onClick={() => {
                            const role = localStorage.getItem("role");

                            if (role === "employee") {
                                toast.error("Employee cannot access Admin Portal.");
                                return;
                            }

                            navigate("/admin/login");
                        }}
                        className="w-full sm:w-64 md:w-72 h-48 sm:h-56 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md cursor-pointer transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-400 flex flex-col items-center justify-center p-4"
                    >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                            <FaUserTie className="text-2xl sm:text-3xl text-white" />
                        </div>

                        <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                            Admin Portal
                        </h2>

                        <p className="text-gray-300 text-center mt-2 sm:mt-3 px-4 leading-relaxed sm:leading-7 text-xs sm:text-sm">
                            Manage team, leads,
                            <br className="hidden sm:inline" /> tasks & salary
                        </p>
                    </div>

                    <div
                        onClick={() => {
                            const role = localStorage.getItem("role");
                            if (role === "admin" || role === "superadmin") {
                                toast.error("Admin cannot access Employee Portal.");
                                return;
                            }

                            navigate("/employee/login");
                        }}
                        className="w-full smp-blur-md cursor-pointer transition duration-300 hover:-translate-y:w-64 md:w-72 h-48 sm:h-56 rounded-3xl border border-white/20 bg-white/10 backdro-2 hover:shadow-2xl hover:border-cyan-400 flex flex-col items-center justify-center p-4"
                    >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                            <FaUser className="text-2xl sm:text-3xl text-white" />
                        </div>

                        <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                            Employee Portal
                        </h2>

                        <p className="text-gray-300 text-center mt-2 sm:mt-3 px-4 leading-relaxed sm:leading-7 text-xs sm:text-sm">
                            Leads, attendance,
                            <br className="hidden sm:inline" /> salary & messages
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
