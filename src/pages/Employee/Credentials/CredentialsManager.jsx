import React, { useState, useEffect } from "react";
import {
  TbTableShortcut,
  TbExternalLink,
  TbLoader,
  TbLockCheck,
  TbFolder
} from "react-icons/tb";
import { CallApi } from "../../../api";
import constant from "../../../env";

export default function EmployeeGoogleSheets() {
  const [sheetsList, setSheetsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Employee specific endpoint
  const API_ENDPOINT = constant?.API?.EMPLOYEE?.GOOGLESHEETS ;

  const fetchEmployeeSheets = async () => {
    try {
      setLoading(true);
      const res = await CallApi(API_ENDPOINT, "GET");

      if (res && res.status && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data.sheets || []);
        setSheetsList(data);
      } else if (Array.isArray(res)) {
        setSheetsList(res);
      }
    } catch (error) {
      console.error("Employee Sheets Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeSheets();
  }, []);

  const filteredSheets = sheetsList.filter((sheet) =>
    sheet.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.folder?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Assigned Sheets</h1>
          <p className="text-sm text-slate-500">Access Google Sheets shared with you by the admin</p>
        </div>


      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <TbLoader className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSheets.length > 0 ? (
            filteredSheets.map((sheet) => (
              <div
                key={sheet.id || sheet._id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <TbTableShortcut className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-base truncate" title={sheet.title}>
                        {sheet.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                          <TbFolder className="w-3 h-3" /> {sheet.folder || "General"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                          <TbLockCheck className="w-3 h-3" /> {sheet.accessType || "View Only"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Link */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={sheet.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    Open Google Sheet <TbExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">
                {searchQuery ? "No sheets matched your search." : "No Google Sheets assigned to you yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}