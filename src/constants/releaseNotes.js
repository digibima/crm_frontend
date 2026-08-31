const RELEASE_NOTES = {
  version: "v1.0.7",
  dateLabel: "31 August 2026",
  dateTime: "2026-08-31",

  updates: [
    {
      module: "Authentication",
      items: [
        "Admin login functionality implemented using mobile number",
        "Employee login functionality implemented using mobile number",
      ],
    },
    {
      module: "Google Sheets Management",
      items: [
        "Admin side Google Sheet upload and dynamic URL sharing implemented",
        "Employee access control mapping for shared Google Sheets",
      ],
    },
    {
      module: "Notifications & Logs",
      items: [
        "Admin notification system update implemented",
        "Recent activity log tracking and display integrated",
      ],
    },
  ],
};

export default RELEASE_NOTES;