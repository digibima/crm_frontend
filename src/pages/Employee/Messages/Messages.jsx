import { useState } from "react";
import { FaPaperPlane, FaCloudUploadAlt, FaExclamationCircle, FaBell } from "react-icons/fa";

export default function Messages() {
  const [typedMessage, setTypedMessage] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Aditya Roy",
      role: "",
      text: "Health leads batch submitted ✓",
      time: "9:32 AM",
      isMe: true,
      bg: "bg-[#e2f7f5] text-slate-800 border border-teal-100",
    },
    {
      id: 2,
      sender: "Anurag",
      role: "(Admin)",
      text: "Good work! Focus on Motor today 👍",
      time: "9:45 AM",
      isMe: false,
      nameColor: "text-blue-700",
      bg: "bg-slate-50 border border-slate-100",
    },
    {
      id: 3,
      sender: "Mitali Roy",
      role: "",
      text: "Policy doc for Suresh attached 📎",
      time: "9:45 AM",
      isMe: false,
      nameColor: "text-pink-600",
      bg: "bg-slate-50 border border-slate-100",
    },
  ]);

  const notifications = [
    {
      id: 1,
      type: "task",
      title: "New task: Health — Call 10 new leads",
      subtitle: "Assigned by Anurag",
      tag: "Just now",
      tagBg: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <FaExclamationCircle className="text-amber-600" size={16} />,
      iconBg: "bg-amber-50",
    },
    {
      id: 2,
      type: "reminder",
      title: "Reminder: Life/Term — Follow up Arjun is overdue",
      subtitle: "Auto reminder",
      tag: "Overdue",
      tagBg: "bg-rose-50 text-rose-700 border-rose-100",
      icon: <FaBell className="text-rose-600" size={16} />,
      iconBg: "bg-rose-50",
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        sender: "Aditya Roy",
        text: typedMessage,
        time: "Just now",
        isMe: true,
        bg: "bg-[#e2f7f5] text-slate-800 border border-teal-100",
      }
    ]);
    setTypedMessage("");
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-gray-400 text-sm mt-0.5 font-medium">Team chat & task notifications</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
          Team Group Chat
        </h3>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[60%] ${
                msg.isMe ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div className={`rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl shadow-slate-100/10 ${msg.bg}`}>
                {!msg.isMe && (
                  <p className={`text-xs font-bold mb-1 ${msg.nameColor}`}>
                    {msg.sender} <span className="text-gray-400 font-normal">{msg.role}</span>
                  </p>
                )}
                <p className="text-slate-700 leading-relaxed break-words">{msg.text}</p>
              </div>
              
              <span className="text-[10px] text-gray-400 font-medium mt-1 px-1">
                {msg.time} {msg.isMe && `· ${msg.sender}`}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00a896] focus:bg-white transition"
          />
          <button 
            type="submit"
            className="bg-[#00a896] hover:bg-[#009282] text-white p-3.5 rounded-xl shadow-sm transition flex-shrink-0"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>

        <div className="space-y-2 pt-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest inline-flex items-center gap-1">
            <span>📎</span> Share File
          </label>
          <div className="w-full border border-dashed border-slate-200 bg-slate-50/50 rounded-xl py-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition group">
            <FaCloudUploadAlt className="text-slate-300 group-hover:text-[#00a896] transition" size={24} />
            <span className="text-xs text-slate-400 font-medium group-hover:text-slate-500">
              Attach PDF, image, or document
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
          Task notifications
        </h3>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50/70 border border-transparent hover:border-slate-100 transition duration-150"
            >
              <div className={`w-9 h-9 rounded-xl ${notif.iconBg} flex items-center justify-center flex-shrink-0`}>
                {notif.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug break-words">
                  {notif.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-medium">{notif.subtitle}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${notif.tagBg}`}>
                    {notif.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}