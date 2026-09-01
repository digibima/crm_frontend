import {
  FaHome,
  FaUsers,
  FaTasks,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaWhatsapp,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
  FaCog,
  FaUserCheck,
  FaUserTie,
  FaFileInvoice,
  FaUserCircle,
  FaSyncAlt,
  FaHistory,
  FaKey
} from "react-icons/fa";

const navigation = {
  admin: {
    sidebar: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        icon: FaHome,
      },
      {
        title: "Employees",
        path: "/admin/employees",
        icon: FaUsers,
      },
      {
        title: "Task Management",
        path: "/admin/task-management",
        icon: FaTasks,
      },
      {
        title: "Renewal",
        path: "/admin/renewal",
        icon: FaSyncAlt, 
      },
      {
        title: "Attendance",
        path: "/admin/attendance",
        icon: FaCalendarCheck,
      },
      {
        title: "Salary",
        path: "/admin/salary",
        icon: FaMoneyBillWave,
      },
      {
        title: "Reports",
        path: "/admin/reports",
        icon: FaChartBar,
      },
      {
      title: "Activity Log",
      path: "/admin/activitylog",
      icon: FaHistory,
    },
    {
  title: "Credentials & Sheets",
  path: "/admin/credentials",
  icon: FaKey
},
      {
      title: "Profile",
      path: "/admin/profile",
      icon: FaUserCircle,
    }
    ],

     header: {
      title: "Admin Dashboard",
       subTitle: "Gulshan",

      left: [
        {
          type: "search",
        },
      ],

      right: [
        {
          type: "message",
        },
        {
          type: "notification",
        },
        {
          type: "profile",
          route: "/admin/profile",
        },
      ],
    },
  
  },

employee: {
  sidebar: [
    {
      title: "Dashboard",
      path: "/employee/dashboard",
      icon: FaHome,
    },
    {
      title: "My Task",
      path: "/employee/task",
      icon: FaUserTie, 
    },
    {
    title: "Renewal",
    path: "/employee/renewal",
    icon: FaSyncAlt, 
  },
    // {
    //   title: "Messages",
    //   path: "/employee/messages",
    //   icon: FaWhatsapp, 
    // },
    {
      title: "My Attendance",
      path: "/employee/attendance",
      icon: FaCalendarCheck, 
    },
    {
      title: "My Salary",
      path: "/employee/salary",
      icon: FaMoneyBillWave,
      
    },
        {
  title: "Credentials & Sheets",
  path: "/employee/credentials",
  icon: FaKey
},
       {
        title: "My Profile",
        path: "/employee/profile",
        icon: FaUserCircle,
      }
  ],

  header: {
    title: "Employee Portal", 
    subTitle: "Field / Senior Agent",

      left: [
        {
          type: "search",
        },
      ],

  right: [
        {
          type: "message",
        },
        {
          type: "notification",
        },
        {
          type: "profile",
          route: "/employee/profile",
        },
      ],
  },
},

  superAdmin: {
    sidebar: [
      {
        title: "Dashboard",
        path: "/super-admin/dashboard",
        icon: FaHome,
      },
      {
        title: "Admins",
        path: "/super-admin/admins",
        icon: FaUserShield,
      },
      {
        title: "Employees",
        path: "/super-admin/employees",
        icon: FaUsers,
      },
      {
        title: "Verification",
        path: "/super-admin/verification",
        icon: FaUserCheck,
      },
      {
        title: "Settings",
        path: "/super-admin/settings",
        icon: FaCog,
      },
    ],

header: {
  title: "Super Admin",
  subTitle: "System Administrator",

  search: true,
  message: true,
  notification: true,
  profile: true,
},
  },
};

export default navigation;