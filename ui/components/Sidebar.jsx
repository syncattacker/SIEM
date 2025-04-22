import React from "react";
import {
  Menu,
  ChevronLeft,
  Home,
  List,
  Heart,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navItems = [
    { icon: Home, label: "Home" },
    { icon: List, label: "Categories" },
    { icon: Heart, label: "Favorites" },
    { icon: BarChart, label: "Analytics" },
    { icon: Settings, label: "Settings" },
    { icon: LogOut, label: "Logout" },
  ];

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64" : "w-16"
      } bg-white shadow-lg p-4 transition-all duration-300 h-full fixed z-10 flex flex-col items-center md:items-start`}
    >
      <div className="mb-8">
        <img
          src="https://placehold.co/40x40"
          alt="Logo"
          className="w-10 h-10 rounded"
        />
      </div>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="mb-6 text-[#6C63FF] hover:bg-[#E9E6F7] p-2 rounded-lg"
      >
        {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>
      <div className="space-y-4 w-full">
        {navItems.map(({ icon: label, icon: Icon }, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-2 p-2 hover:bg-[#E9E6F7] rounded-lg cursor-pointer w-full"
          >
            <Icon size={24} className="text-[#2D2D2D]" />
            {isSidebarOpen && <span className="text-[#2D2D2D]">{label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
