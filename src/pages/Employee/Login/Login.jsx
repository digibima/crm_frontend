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
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


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
        role: "employee",
        email,
        password,
      };

      const response = await CallApi(
        constant.API.EMPLOYEE.EMPLOYEELOGIN,
        "POST",
        payload,
      );

      if (response.status) {
        const user = response.data.user;
        const token = response.data.token.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        
        window.dispatchEvent(new Event("user-login"));
        toast.success(response.message);

        navigate("/employee/dashboard", {
          replace: true,
        });
      } else {
        toast.error(response.message || "Invalid Credentials");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#17246d] via-[#1f4e95] to-[#0aa5a6] items-center justify-center relative overflow-hidden p-8">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border-[30px] border-blue-900/30" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full border-[35px] border-cyan-400/10" />

        <div className="text-center z-10 w-full max-w-md">
          {/* <img
            src={logo}
            alt="logo"
            className="w-32 h-32 mx-auto rounded-lg shadow-2xl"
          /> */}

          <h1 className="text-5xl font-bold text-white mt-4">Digibima</h1>
          <p className="text-gray-300 tracking-[5px] uppercase text-xs mt-3">
            Your Digital Insurance Partner
          </p>

          <div className="mt-12 space-y-4 w-full flex flex-col items-center">
            <Feature
              icon={<FaMapMarkerAlt />}
              text="Location-based attendance"
            />
            <Feature icon={<FaUserTie />} text="Lead & quotation pipeline" />
            <Feature
              icon={<FaWhatsapp />}
              text="WhatsApp & internal messaging"
            />
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#0aa5a6]" />{" "}
                Employee
              </span>
            </div>

            <h2 className="text-3xl font-bold mt-5 text-slate-800 tracking-tight">
              Employee Portal
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              Select your profile and sign in
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@digibima.com"
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#0aa5a6] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00a896] hover:bg-[#009282] text-white font-medium py-3.5 rounded-xl shadow-lg shadow-teal-600/10 transition duration-300 text-sm"
              >
                Sign In
              </button>
            </form>
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
