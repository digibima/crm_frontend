import React, { useState, useEffect } from "react";
import { 
  TbTableShortcut, 
  TbExternalLink, 
  TbPlus, 
  TbUserCheck, 
  TbX,
  TbLoader
} from "react-icons/tb";

import { CallApi } from "../../../api"; 
import constant from "../../../env";

export default function CredentialsManager() {
  const [sheetsList, setSheetsList] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    sheetUrl: "",
    folder: "HR & Finance",
    accessType: "View Only",
    assignedEmployees: []
  });


  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await CallApi(constant.API.ADMIN.GOOGLESHEETS, "GET");

      if (res && res.status && res.data) {
        setSheetsList(res.data.sheets || []);
        setAvailableEmployees(res.data.availableEmployees || []);
      }
    } catch (error) {
      console.error("Google Sheets Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmployeeToggle = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployees.includes(empId);
      return {
        ...prev,
        assignedEmployees: exists
          ? prev.assignedEmployees.filter((id) => id !== empId)
          : [...prev.assignedEmployees, empId]
      };
    });
  };


  const handleAddSheet = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.sheetUrl) return;

    try {
      setSubmitting(true);
      
      const payload = {
        title: formData.title,
        sheetUrl: formData.sheetUrl,
        folder: formData.folder,
        accessType: formData.accessType,
        assignedEmployees: formData.assignedEmployees
      };

      const res = await CallApi(constant.API.ADMIN.GOOGLESHEETS, "POST", payload);

      if (res && (res.status || res.success || res.id)) {
        await fetchSheets(); 
        setIsModalOpen(false);
        setFormData({
          title: "",
          sheetUrl: "",
          folder: "HR & Finance",
          accessType: "View Only",
          assignedEmployees: []
        });
      }
    } catch (error) {
      console.error("Post Google Sheet Error:", error);
      alert(error?.message || "Error saving Google Sheet entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Google Sheets Management</h1>
          <p className="text-sm text-slate-500">Upload and Share Google Sheets with Employees</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-lg font-medium shadow-sm transition flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <TbPlus className="w-4 h-4" /> Add Google Sheet
        </button>
      </div>

      {/* Loading Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <TbLoader className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sheetsList.length > 0 ? (
            sheetsList.map((sheet) => (
              <div key={sheet.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <TbTableShortcut className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{sheet.title}</h3>
                      <span className="inline-block mt-1 text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                        📁 {sheet.folder || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <TbUserCheck className="w-4 h-4 text-indigo-600" /> Shared With ({sheet.assignedEmployees?.length || 0} Employees):
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded">
                      {sheet.accessType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sheet.assignedEmployees && sheet.assignedEmployees.length > 0 ? (
                      sheet.assignedEmployees.map((empId) => {
                        const emp = availableEmployees.find((e) => e.id === empId);
                        return (
                          <span key={empId} className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                            <span className="font-medium">{emp ? emp.name : `ID: ${empId}`}</span>
                            {emp && <span className="text-[10px] text-slate-400 capitalize">({emp.designation})</span>}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No assigned employees</span>
                    )}
                  </div>
                </div>

                {/* External Link */}
                <a
                  href={sheet.sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
                >
                  Open Google Sheet <TbExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">No Google Sheets uploaded yet. Click "Add Google Sheet" to upload one.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <TbX className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-1">Add & Share Google Sheet</h2>

            <form onSubmit={handleAddSheet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sheet Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Sales Master Sheet 2026"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Google Sheet URL</label>
                <input
                  type="url"
                  name="sheetUrl"
                  value={formData.sheetUrl}
                  onChange={handleInputChange}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Category</label>
                  <input
                    type="text"
                    name="folder"
                    value={formData.folder}
                    onChange={handleInputChange}
                    placeholder="e.g. HR & Finance"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Access Type</label>
                  <select
                    name="accessType"
                    value={formData.accessType}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="View Only">View Only</option>
                    <option value="Edit">Edit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assign To Employees ({availableEmployees.length} Available):
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {availableEmployees.length > 0 ? (
                    availableEmployees.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedEmployees.includes(emp.id)}
                          onChange={() => handleEmployeeToggle(emp.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-medium text-slate-800">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({emp.designation || emp.role})</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 p-2 text-center">No employees found</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? <TbLoader className="w-4 h-4 animate-spin" /> : "Save & Post Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}