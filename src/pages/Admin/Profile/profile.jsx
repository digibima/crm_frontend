import React, { useState, useRef } from "react";
import {
  FiCamera,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from "react-icons/fi";

const AdminProfile = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "Anurag Pandya",
    email: "admin@digibima.com",
    phone: "9876543210",
    designation: "Super Admin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password Validation Logic
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        alert("Please enter your current password to make changes.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        alert("New password and confirm password do not match!");
        return;
      }
      if (formData.newPassword.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Profile updated successfully!");
      // Reset sensitive password fields after save
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }, 1500);
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header Banner */}
      <div
        className="relative rounded-3xl p-8 text-white shadow-xl overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/profile/profile-img.jpg')",
        }}
      >
        {/* Dark Gradient Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="relative group">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-white bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md uppercase select-none">
                {getInitials(formData.name)}
              </div>
            )}

            {/* Hidden Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
              title="Upload Profile Picture"
            >
              <FiCamera className="text-lg" />
            </button>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white">{formData.name}</h2>
            <p className="text-blue-200 mt-1 font-medium">{formData.designation}</p>
            <p className="text-xs text-slate-300 mt-2 bg-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
              Joined • 12 Jan 2025
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 pb-2 border-b">
            Personal Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative mt-2">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative mt-2">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <div className="relative mt-2">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Designation</label>
              <input
                value={formData.designation}
                disabled
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 px-4 mt-2 cursor-not-allowed font-medium"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Change Password</h3>
          <p className="text-xs text-slate-500 mb-6">Leave blank if you don't want to change your password.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Current Password</label>
              <div className="relative mt-2">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <div className="relative mt-2">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative mt-2">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Meta Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 pb-2 border-b">
            Account Details
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Employee ID</p>
              <p className="font-semibold text-slate-800 mt-1">EMP-1001</p>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Joined Date</p>
              <p className="font-semibold text-slate-800 mt-1">12 Jan 2025</p>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Last Login</p>
              <p className="font-semibold text-slate-800 mt-1">Today 10:45 AM</p>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            className="px-6 h-12 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-8 h-12 flex items-center gap-2 disabled:opacity-60 transition shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin text-lg" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="text-lg" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;