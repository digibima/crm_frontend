import React, { useEffect, useState } from "react";

import { toast as reactToast } from "react-toastify";

import html2canvas from "html2canvas";

import jsPDF from "jspdf";

import { CallApi } from "../../../api";

import constant from "../../../env";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaIdCard,
  FaBriefcase,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserShield,
  FaPhoneAlt,
  FaClock,
  FaFileDownload,
  FaEdit,
  FaCheckCircle,
  FaTools,
  FaTimes,
  FaSave,
  FaCamera,
  FaTrash,
  FaRupeeSign,
  FaChartLine,
  FaEye,
} from "react-icons/fa";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);

  const [stats, setStats] = useState(null);

  const [recentLeads, setRecentLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isDownloading, setIsDownloading] = useState(false);

  // Profile Edit & Preview States

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",

    mobile: "",

    dob: "",

    address: "",

    avatarUrl: null,

    emergencyContact: {
      name: "",

      relation: "",

      phone: "",
    },

    skills: "",
  });

  // Helper function to build correct Image URL using constant.BASE_URL + profileImageRaw

  const getFullImageUrl = (rawPath, fullPath) => {
    const baseUrl = (constant?.BASE_URL || "").replace(/\/+$/, "");

    if (rawPath) {
      const cleanRawPath = rawPath.replace(/^\/+/, "");

      return `${baseUrl}/${cleanRawPath}`;
    }

    if (fullPath) {
      return fullPath.replace(
        /^http:\/\/(0\.0\.0\.0|localhost|127\.0\.0\.1)(:\d+)?/,
        baseUrl,
      );
    }

    return null;
  };

  // GET Profile API Integration

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setLoading(true);

        const response = await CallApi("/api/employee/profile", "GET");

        if (response && response.status) {
          const apiData = response.data || {};

          const apiProfile = apiData.profile || apiData || {};

          const apiStats = apiData.stats || null;

          const apiLeads = apiData.recentLeads || [];

          const avatar = getFullImageUrl(
            apiProfile.profileImageRaw,

            apiProfile.profileImage ||
              apiProfile.avatarUrl ||
              apiProfile.avatar,
          );

          const formattedProfile = {
            id: apiProfile.id ? `DB-${apiProfile.id}` : "DB-31",

            name: apiProfile.name || "Employee Name",

            email: apiProfile.email || "N/A",

            mobile: apiProfile.mobile || apiProfile.phone || "N/A",

            designation: apiProfile.designation || "N/A",

            role: apiProfile.role || "Employee",

            department:
              apiProfile.department ||
              (apiProfile.designation
                ? apiProfile.designation.toUpperCase()
                : "IT & Software"),

            reportingManager: apiProfile.reportingManager || "N/A",

            workLocation: apiProfile.workLocation || "Jaipur, Rajasthan",

            workType: apiProfile.workType || "Full-time (On-site)",

            shift: apiProfile.shift || "09:30 AM - 06:30 PM",

            status:
              apiProfile.isActive !== undefined
                ? apiProfile.isActive
                  ? "Active"
                  : "Inactive"
                : apiProfile.status || "Active",

            doj: apiProfile.doj || apiProfile.joinedAt || "N/A",

            dob: apiProfile.dob || "N/A",

            salary: apiProfile.salary || "N/A",

            address: apiProfile.address || "Jaipur, Rajasthan",

            companyName: apiProfile.companyName || "DIGIBIMA",

            avatarUrl: avatar,

            emergencyContact: {
              name: apiProfile.emergencyContact?.name || "N/A",

              relation: apiProfile.emergencyContact?.relation || "N/A",

              phone: apiProfile.emergencyContact?.phone || "N/A",
            },

            skills: Array.isArray(apiProfile.skills)
              ? apiProfile.skills
              : typeof apiProfile.skills === "string"
                ? apiProfile.skills.split(",").map((s) => s.trim())
                : ["CRM Systems", "Operations", "Sales"],

            totalTasks: apiProfile.totalTasks || 0,

            completedTasks: apiProfile.completedTasks || 0,

            pendingTasks: apiProfile.pendingTasks || 0,
          };

          setProfile(formattedProfile);

          if (apiStats) setStats(apiStats);

          if (apiLeads.length > 0) setRecentLeads(apiLeads);

          const storedUser = localStorage.getItem("user");

          const parsedUser = storedUser ? JSON.parse(storedUser) : {};

          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsedUser, ...formattedProfile }),
          );
        }
      } catch (err) {
        console.error("API Profile Fetch Error:", err);

        reactToast.error(
          "Profile load karne me dikkat aayi. Local data use ho raha hai.",
        );

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          try {
            setProfile(JSON.parse(storedUser));
          } catch (e) {
            console.error("LocalStorage read error", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, []);

  // Open Edit Modal & Populate Existing Data

  const handleOpenEditModal = () => {
    if (!profile) return;

    setFormData({
      name: profile.name || "",

      mobile: profile.mobile || "",

      dob: profile.dob || "",

      address: profile.address || "",

      avatarUrl: profile.avatarUrl || null,

      emergencyContact: {
        name: profile.emergencyContact?.name || "",

        relation: profile.emergencyContact?.relation || "",

        phone: profile.emergencyContact?.phone || "",
      },

      skills: profile.skills ? profile.skills.join(", ") : "",
    });

    setIsEditModalOpen(true);
  };

  // Image Upload Handler

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        reactToast.error("File size 2MB se kam honi chahiye!");

        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,

          avatarUrl: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  // Remove Avatar Handler

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,

      avatarUrl: null,
    }));
  };

  // Input Change Handler

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("emergency.")) {
      const field = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,

        emergencyContact: {
          ...prev.emergencyContact,

          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,

        [name]: value,
      }));
    }
  };

  // Save Edit Changes (API + LocalStorage Sync)

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formattedSkills = formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const updatedProfile = {
        ...profile,

        name: formData.name,

        mobile: formData.mobile,

        dob: formData.dob,

        address: formData.address,

        avatarUrl: formData.avatarUrl,

        emergencyContact: {
          name: formData.emergencyContact.name,

          relation: formData.emergencyContact.relation,

          phone: formData.emergencyContact.phone,
        },

        skills: formattedSkills,
      };

      const storedUser = localStorage.getItem("user");

      const parsedUser = storedUser ? JSON.parse(storedUser) : {};

      const newUserObj = { ...parsedUser, ...updatedProfile };

      localStorage.setItem("user", JSON.stringify(newUserObj));

      setProfile(updatedProfile);

      reactToast.success("Profile successfully update ho gayi!");

      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);

      reactToast.error("Profile update karne mein error aaya.");
    } finally {
      setSaving(false);
    }
  };

  // DIGIBIMA OFFICIAL ID CARD PDF DOWNLOAD HANDLER

  // DIGIBIMA OFFICIAL ID CARD PDF DOWNLOAD HANDLER

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);

      reactToast.info("Downloading ID Card PDF...");

      // BASE_URL handling (Ensure full endpoint path)

      const baseUrl = (constant?.BASE_URL || "").replace(/\/+$/, "");

      const endpoint = `${baseUrl}/api/employee/id-card/download`;

      // Auth Token lookup

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      const response = await fetch(endpoint, {
        method: "GET",

        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download ID Card PDF file");
      }

      // Convert response stream to Blob

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      // Create temporary download link

      const link = document.createElement("a");

      link.href = downloadUrl;

      const fileName = `${(profile?.name || "Employee").replace(/\s+/g, "_")}_ID_Card.pdf`;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);

      link.click();

      // Clean up temporary DOM element and memory object

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      reactToast.success("ID Card downloaded successfully!");
    } catch (err) {
      console.error("ID Card PDF Download error:", err);

      reactToast.error("Failed to download ID Card PDF!");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00a896] border-t-transparent rounded-full animate-spin"></div>

        <span className="ml-3 text-slate-500 font-medium">
          Loading Profile...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium">
        Profile data Not Received.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-4 sm:p-6 text-slate-700">
      {/* CRM PROFILE HEADER */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#00a896] to-[#0b4885] h-32 sm:h-40 p-4">
          <div className="absolute top-4 right-4 flex gap-2">
            <span className="bg-emerald-500/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-md">
              <FaCheckCircle size={12} /> {profile.status}
            </span>

            <button
              onClick={handleOpenEditModal}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer"
            >
              <FaEdit size={12} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* AVATAR WITH PREVIEW */}

            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-[#00a896] shrink-0 overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setIsImagePreviewOpen(true)}
                  title="Click to view image"
                />
              ) : (
                <FaUser size={48} />
              )}

              {profile.avatarUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setIsImagePreviewOpen(true)}
                    title="View Photo"
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <FaEye size={14} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight capitalize">
                {profile.name}
              </h1>

              <p className="text-slate-500 text-sm font-medium capitalize mt-0.5">
                {profile.designation} •{" "}
                <span className="text-[#00a896] font-semibold">
                  {profile.department}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}

      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Leads
            </div>

            <div className="text-2xl font-bold text-slate-800 mt-1">
              {stats.totalLeads ?? 0}
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Converted
            </div>

            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {stats.totalConverted ?? 0}
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending Tasks
            </div>

            <div className="text-2xl font-bold text-amber-700 mt-1">
              {stats.pendingTasks ?? 0}
            </div>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Conversion Rate
            </div>

            <div className="text-xl font-bold text-teal-800 mt-1">
              {stats.conversionRate ?? "0%"}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Tasks
            </div>

            <div className="text-2xl font-bold text-slate-800 mt-1">
              {profile.totalTasks}
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Completed
            </div>

            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {profile.completedTasks}
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending
            </div>

            <div className="text-2xl font-bold text-amber-700 mt-1">
              {profile.pendingTasks}
            </div>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60 shadow-sm text-center">
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Shift Timing
            </div>

            <div className="text-xs font-bold text-teal-800 mt-2 truncate">
              {profile.shift}
            </div>
          </div>
        </div>
      )}

      {/* DETAILS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#00a896] rounded-full"></span>
            Personal Identity & Contact
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#00a896] transition-colors">
                <FaEnvelope size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Primary Email
                </div>

                <div className="text-sm font-semibold text-slate-700 break-all">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#00a896] transition-colors">
                <FaPhone size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Phone Number
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.mobile}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#00a896] transition-colors">
                <FaCalendarAlt size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Date of Birth
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.dob}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#00a896] transition-colors">
                <FaMapMarkerAlt size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Personal Address
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Details */}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#0b4885] rounded-full"></span>
            Employment Matrix
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <FaIdCard size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Employee ID
                </div>

                <div className="text-sm font-bold text-slate-700">
                  {profile.id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <FaUserShield size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  System Role
                </div>

                <div className="text-sm font-semibold text-slate-700 capitalize">
                  {profile.role}
                </div>
              </div>
            </div>

            {profile.salary && profile.salary !== "N/A" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <FaRupeeSign size={15} />
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Salary
                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    {profile.salary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <FaBriefcase size={15} />
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Reporting Manager
                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    {profile.reportingManager}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <FaBuilding size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Office Work Location
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.workLocation}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <FaClock size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Onboarding Date
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.doj}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <FaBriefcase size={15} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Employment Type
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {profile.workType}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-rose-500 rounded-full"></span>
            Emergency Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Contact Name
              </div>

              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {profile.emergencyContact.name}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Relation
              </div>

              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                {profile.emergencyContact.relation}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Phone Number
              </div>

              <div className="text-sm font-semibold text-rose-700 mt-0.5 flex items-center gap-1">
                <FaPhoneAlt size={11} /> {profile.emergencyContact.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Downloads */}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
            Skills & Downloads
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                <FaTools size={11} /> Primary Skills
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* DIGIBIMA Official ID Card Download Section */}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  DIGIBIMA Official ID Card
                </div>

                <div className="text-[11px] text-slate-400">
                  Download printable single-page PDF ID card
                </div>
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-4 py-2 bg-[#00a896] hover:bg-[#0b4885] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <FaFileDownload size={13} />

                {isDownloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT LEADS TABLE (If available from API) */}

      {recentLeads.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FaChartLine className="text-[#00a896]" /> Recent Leads
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3 rounded-l-xl">Lead ID</th>

                  <th className="p-3">Status</th>

                  <th className="p-3">Amount</th>

                  <th className="p-3 rounded-r-xl">Created At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">#{lead.id}</td>

                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          lead.status === "Converted"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="p-3 font-semibold text-slate-700">
                      {lead.amount || "N/A"}
                    </td>

                    <td className="p-3 text-slate-400">{lead.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}

      {isImagePreviewOpen && profile?.avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="w-full flex justify-between items-center mb-4 text-white border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaUser className="text-[#00a896]" size={16} />

                <h3 className="text-sm sm:text-base font-bold capitalize">
                  {profile.name} - Profile Photo
                </h3>
              </div>

              <button
                onClick={() => setIsImagePreviewOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Preview Image Box */}

            <div className="relative max-h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 p-2 border border-white/5">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2 text-slate-800">
                <FaEdit className="text-[#00a896]" size={18} />

                <h3 className="text-lg font-bold">Edit Profile</h3>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Image Input */}

              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser size={28} />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-700">
                    Profile Picture
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-[#00a896] hover:bg-[#0b4885] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
                      <FaCamera size={12} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FaTrash size={11} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Date of Birth
                  </label>

                  <input
                    type="text"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896]"
                  />
                </div>
              </div>

              {/* Skills Field */}

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  Skills (Comma separated)
                </label>

                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="CRM Systems, Sales, Operations"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00a896]"
                />
              </div>

              {/* Emergency Contact */}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 block">
                  Emergency Contact Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Contact Name
                    </label>

                    <input
                      type="text"
                      name="emergency.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a896]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Relation
                    </label>

                    <input
                      type="text"
                      name="emergency.relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a896]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="emergency.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a896]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#00a896] hover:bg-[#0b4885] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FaSave size={13} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
