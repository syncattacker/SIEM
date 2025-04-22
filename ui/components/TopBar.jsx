import React from "react";
import { Search, Menu } from "lucide-react";

const TopBar = ({ searchTerm, setSearchTerm, setIsSidebarOpen }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Dashboard</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 text-[#6C63FF] hover:bg-[#E9E6F7] rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          />
          <Search size={20} className="absolute left-2 top-2.5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <img
            src="https://placehold.co/32x32"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-[#2D2D2D] hidden sm:inline">Max Back</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
