import { useState } from "react";
import { toast } from "react-toastify";
import constant from "../../../env";
import { CallApi } from "../../../api";
import socket from "../../../socket/socket";
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
        role: "employee",
      };

      const endpoint = "api/auth/send-otp";
      const response = await CallApi(endpoint, "POST", payload);

      if (response && response.status) {
        toast.success(response.message || response.data?.message || "OTP sent successfully");
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

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    try {
      setLoading(true);

      let position;
      try {
        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
      } catch (locationErr) {
        console.error("Browser Location Blocked:", locationErr);
        
        if (locationErr.code === 1) {
          toast.error("Location blocked! Enable location permission or Chrome Flag for local IP testing.");
        } else if (locationErr.code === 3) {
          toast.error("Location request timed out. Please check your GPS.");
        } else {
          toast.error("Unable to get current location. Access denied by browser.");
        }
        
        setLoading(false);
        return; 
      }

      const payload = {
        mobile,
        otp,
        role: "employee",
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
      };

      console.log("PAYLOAD TRANSMITTED TO BACKEND:", payload);

      const endpoint = constant?.API?.AUTH?.VERIFY_OTP || "/api/auth/verify-otp";
      const response = await CallApi(endpoint, "POST", payload);

      if (response && response.status) {
        const user = response.data?.user;
        const token =
          typeof response.data?.token === "object"
            ? response.data.token.token
            : response.data?.token;

        if (token) {
          localStorage.setItem("token", token);
          // 12-Hour Timer ke liye exact login timestamp save karna
          localStorage.setItem("login_time", Date.now().toString());
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role);
        }

        window.dispatchEvent(new Event("user-login"));
        toast.success(response.message || "Login successful");
        navigate("/employee/dashboard", { replace: true });
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
            <div>
              <span className="bg-[#e2f7f5] text-[#0aa5a6] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0aa5a6]" /> Employee
              </span>
            </div>

            <h2 className="text-3xl font-bold mt-5 text-slate-800 tracking-tight">
              Employee Portal
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {!isOtpSent
                ? "Enter your mobile number to receive OTP"
                : `Enter OTP sent to +91 ${mobile}`}
            </p>

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 outline-none focus:ring-2 focus:ring-[#0aa5a6] focus:border-transparent transition"
                    />
                    <FaMobileAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00a896] hover:bg-[#009282] text-white font-medium py-3.5 rounded-xl shadow-lg transition duration-300 text-sm disabled:opacity-50"
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 tracking-widest outline-none focus:ring-2 focus:ring-[#0aa5a6] focus:border-transparent transition"
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
                    className="text-[#0aa5a6] font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00a896] hover:bg-[#009282] text-white font-medium py-3.5 rounded-xl shadow-lg transition duration-300 text-sm disabled:opacity-50"
                >
                  {loading ? "Getting Live Location..." : "Verify & Sign In"}
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
    <div className="flex items-center gap-4 w-full max-w-sm bg-white/10 border border-white/20 rounded-xl px-5 py-4 backdrop-blur-md">
      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-white text-lg flex-shrink-0">
        {icon}
      </div>
      <span className="text-white text-left font-medium text-sm sm:text-base">
        {text}
      </span>
    </div>
  );
}