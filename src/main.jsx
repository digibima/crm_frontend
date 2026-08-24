import React from 'react';
import ReactDOM from 'react-dom/client';
import "@fontsource/inter";
import './index.css';
import App from './App.jsx';
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <ToastContainer
    position="top-right"
    autoClose={2500}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
  />

  <NotificationProvider>
    <App />
  </NotificationProvider>
</React.StrictMode>
);


