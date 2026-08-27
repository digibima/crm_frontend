import React, { useState } from "react";
import { toast } from "react-toastify";
import constant from "../../../env";
import { CallApi } from "../../../api";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUserTie,
  FaWhatsapp,
  FaDollarSign,
  FaMobileAlt,
  FaKey,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("admin");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Send OTP Handler
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        mobile,
        role: role === "superadmin" ? "superadmin" : "admin",
      };

      const endpoint = "api/auth/send-otp";
      const response = await CallApi(endpoint, "POST", payload);

      if (response && response.status) {
        toast.success(
          response.message || response.data?.message || "OTP sent successfully"
        );
        setIsOtpSent(true);
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        mobile,
        otp,
        role: role === "superadmin" ? "superadmin" : "admin",
      };

      const endpoint = constant?.API?.AUTH?.VERIFY_OTP || "/api/auth/verify-otp";
      const response = await CallApi(endpoint, "POST", payload);

      if (response && response.status) {
        const user = response.data?.user;
        const token =
          typeof response.data?.token === "object"
            ? response.data.token.token
            : response.data?.token;

        // Save Auth Tokens and Expiry Timestamp
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("login_time", Date.now().toString());
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role);
        }

        toast.success(response.message || "Login successful");

        if (user?.role === "admin" || user?.role === "superadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        toast.error(response?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#17246d] via-[#1f4e95] to-[#0aa5a6] items-center justify-center relative overflow-hidden p-8">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border-[30px] border-blue-900/30" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full border-[35px] border-cyan-400/10" />

        <div className="text-center z-10 w-full max-w-md">
          <h1 className="text-5xl font-bold text-white mt-4">Digibima</h1>
          <p className="text-gray-300 tracking-[5px] uppercase text-xs mt-3">
            Your Digital Insurance Partner
          </p>

          <div className="mt-12 space-y-4 w-full flex flex-col items-center">
            <Feature icon={<FaMapMarkerAlt />} text="Location-based attendance" />
            <Feature icon={<FaUserTie />} text="Lead & quotation pipeline" />
            <Feature icon={<FaWhatsapp />} text="WhatsApp & internal messaging" />
            <Feature icon={<FaDollarSign />} text="Salary management & slips" />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-blue-700 font-medium transition duration-200 group"
          >
            <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 w-full">
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                ● Admin Portal
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mt-6 text-slate-800 tracking-tight">
              Admin Login
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              {!isOtpSent
                ? "Select role and enter registered mobile number"
                : `Enter OTP sent to +91 ${mobile}`}
            </p>

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Login As
                  </label>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === "admin"}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700 font-medium">Admin</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="superadmin"
                        checked={role === "superadmin"}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700 font-medium">Super Admin</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="tel"
                      value={mobile}
                      maxLength={10}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 10 digit mobile number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                    <FaMobileAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#17246d] hover:bg-[#103d75] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition duration-300 disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Enter OTP
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter OTP"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 tracking-widest outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                    <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Change Mobile Number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#17246d] hover:bg-[#103d75] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition duration-300 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-4 w-full max-w-sm bg-white/10 border border-white/20 rounded-xl px-5 py-4 backdrop-blur-md transition transform hover:scale-102">
      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-white text-lg flex-shrink-0">
        {icon}
      </div>
      <span className="text-white text-left font-medium text-sm sm:text-base">
        {text}
      </span>
    </div>
  );
}