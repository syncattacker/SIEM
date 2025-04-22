import React from "react";
import {
  FileText,
  Layers,
  Building,
  AlertCircle,
  Clock,
  Lock,
} from "lucide-react";

const FilterPanel = ({
  filters,
  handleFilterChange,
  clearFilters,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  const filterFields = [
    { key: "eventID", label: "Event ID", icon: FileText },
    { key: "Category", label: "Category", icon: FileText },
    { key: "Subcategory", label: "Subcategory", icon: Layers },
    { key: "Asset_Criticality", label: "Asset Criticality", icon: Building },
    { key: "Alert_Criticality", label: "Alert Criticality", icon: AlertCircle },
    { key: "SLA_Classification", label: "SLA Classification", icon: Clock },
    { key: "Data_Classification", label: "Data Classification", icon: Lock },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold text-[#2D2D2D]">
          Payment History
        </h2>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-2 bg-[#6C63FF] text-white rounded-lg hover:bg-[#5a52d5] transition"
        >
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>
      {isFilterOpen && (
        <div className="p-4 bg-[#F9FAFB] rounded-b-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {filterFields.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Icon size={20} className="text-[#6C63FF]" />
                <input
                  type="text"
                  placeholder={label}
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(e, key)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                />
              </div>
            ))}
          </div>
          <button
            onClick={clearFilters}
            className="w-full p-2 bg-[#6C63FF] text-white rounded-lg hover:bg-[#5a52d5] transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
