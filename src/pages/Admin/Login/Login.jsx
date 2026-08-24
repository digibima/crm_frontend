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
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal"; // --- IMPORTED MODAL COMPONENT ---

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- FORGOT PASSWORD STATES ---
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Email Validation
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password Validation
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const payload = {
        role: role === "superadmin" ? "superadmin" : role,
        email: email,
        password: password,
      };
      console.log("payload:", payload);
      const response = await CallApi(
        constant.API.ADMIN.ADMINLOGIN,
        "POST",
        payload
      );

      console.log(response);

      if (response.status) {
        const user = response.data.user;
        const token = response.data.token.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        console.log("User Role:", user.role);
        console.log("Stored Role:", localStorage.getItem("role"));
        toast.success(response.message);

        if (user.role === "admin" || user.role === "superadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        toast.error(response.message || "Invalid Credentials");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // --- NEW FORGOT PASSWORD SUBMIT HANDLER ---
  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      return toast.warning("Please enter your registered email address");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      return toast.error("Please enter a valid email address");
    }

    try {
      setForgotLoading(true);

      // Fallback endpoint if constant not present
      const apiUrl = constant.API.ADMIN.FORGOT_PASSWORD || "/api/admin/forgot-password";

      const response = await CallApi(apiUrl, "POST", {
        email: forgotEmail.trim(),
        role: role
      });

      if (response && response.status) {
        toast.success(response.message || "Reset link/password sent to your email successfully!");
        setIsForgotModalOpen(false);
        setForgotEmail("");
      } else {
        toast.error(response?.message || "Email not found or invalid role");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to process request. Try again.");
    } finally {
      setForgotLoading(false);
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
                ● Admin
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mt-6 text-slate-800 tracking-tight">
              Welcome, Anurag
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Sign in to manage your team
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@digibima.com"
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowPassword(!showPassword); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>

                {/* --- ADDED FORGOT PASSWORD LINK --- */}
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#17246d] hover:bg-[#103d75] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition duration-300"
              >
                Sign In as Admin
              </button>
            </form>

          </div>
        </div>
      </div>

      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => { if (!forgotLoading) setIsForgotModalOpen(false); }}
        title="Reset Password"
        widthClass="sm:w-[420px]"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4 text-left py-1">
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter your registered email address below. We will verify it and send password instructions to your email dashboard.
          </p>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. admin@digibima.com"
              className="w-full h-11 border border-slate-200 px-4 rounded-xl outline-none focus:border-blue-600 text-sm text-slate-700 bg-slate-50/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={forgotLoading}
              onClick={() => setIsForgotModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={forgotLoading}
              className="px-4 py-2 bg-[#17246d] hover:bg-[#103d75] text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {forgotLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send Reset Request"
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-4 w-full max-w-sm bg-white/10 border border-white/20 rounded-xl px-5 py-4 backdrop-blur-md transition transform hover:scale-102">
      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-white text-lg flex-shrink-0">
        {icon}
      </div>
      <span className="text-white text-left font-medium text-sm sm:text-base">{text}</span>
    </div>
  );
}