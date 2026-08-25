const constant = {
  USER: "",
  EMAIL_ID: "",
  COOKIE: {
    HEADER: "@#$%^AZ##",
  },
  BASE_URL: "http://192.168.29.176:3333/",
  SERVERIMG_URL: "https://api.digibima.in/public/front/logo",
  API: {
    EMPLOYEELIST: "/api/employees/list",
    LOGOUT: "/api/logout",
    ADMIN: {
      ADMINLOGIN: "/api/login",
      VIEWDASHBOARD: "/api/admin/dashboard",
      EMPLOYEES: "/api/employees",
      INSURANCECATEGORY: "/api/categories",
      INSURANCESUBCATEGORY: "/api/sub-categories/by-category",
      INSURANCECOMPANIES: "/api/companies/by-sub-category",
      ASSIGNTASK: "/api/tasks",
      SEARCHTASK: "/api/tasks/search",
      ATTENDANCE: {
        HISTORY: "/api/admin/attendance/dashboard/complete"
      },
      REPORT: {
        DASHBOARD: "/api/admin/reports/employee-performance"
      }

    },
    SUPERADMIN: {
      EMPLOYEELOGIN: "/api/admin-employee-login",
      EMPLOYEELOGINVENDORS: "/api/vendors",
      POLICYUPLOAD: "/api/upload_poilcy",
    },
    EMPLOYEE: {
      EMPLOYEELOGIN: "/api/login",
      VIEWDASHBOARD: "/api/employee/dashboard",
      MYTASK: "/api/employee/tasks",
      SEARCHTASK: "/api/employee/tasks/search",
      ATTENDANCE: {
        HISTORY: "/api/employee/attendance/history"
      }
    },
  },

}
export default constant;