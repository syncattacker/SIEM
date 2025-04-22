import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    eventID: "",
    Category: "",
    Subcategory: "",
    Asset_Criticality: "",
    Alert_Criticality: "",
    SLA_Classification: "",
    Data_Classification: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  // Fetch logs from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/logs")
      .then((res) => {
        setLogs(res.data);
        setFilteredLogs(res.data);
      })
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = logs;

    // Apply global search
    if (searchTerm) {
      filtered = filtered.filter((log) =>
        Object.values(log).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply specific filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(
          (log) =>
            log[key] &&
            log[key].toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filters, logs]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const aVal = a[key] || "";
      const bVal = b[key] || "";
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredLogs(sortedLogs);
  };

  // Handle filter input changes
  const handleFilterChange = (e, filterKey) => {
    setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }));
  };

  // Clear all filters and search
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      eventID: "",
      Category: "",
      Subcategory: "",
      Asset_Criticality: "",
      Alert_Criticality: "",
      SLA_Classification: "",
      Data_Classification: "",
    });
  };

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">SIEM Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Global Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {[
                { key: "eventID", label: "Event ID" },
                { key: "Category", label: "Category" },
                { key: "Subcategory", label: "Subcategory" },
                { key: "Asset_Criticality", label: "Asset Criticality" },
                { key: "Alert_Criticality", label: "Alert Criticality" },
                { key: "SLA_Classification", label: "SLA Classification" },
                { key: "Data_Classification", label: "Data Classification" },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  placeholder={`Filter by ${label}`}
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(e, key)}
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ))}
              <button
                onClick={clearFilters}
                className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {/* Logs Table */}
          <div className="lg:col-span-3 bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {logs[0] &&
                      Object.keys(logs[0]).map((key) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition"
                        >
                          {key.replace(/_/g, " ")}
                          {sortConfig.key === key && (
                            <span className="ml-2">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-700 transition">
                        {Object.values(log).map((val, i) => (
                          <td
                            key={i}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                          >
                            {val?.toString() || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={logs[0] ? Object.keys(logs[0]).length : 1}
                        className="px-6 py-4 text-center text-gray-400"
                      >
                        No logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {filteredLogs.length > 0 ? indexOfFirstLog + 1 : 0} to{" "}
                {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
                {filteredLogs.length} logs
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-600 hover:bg-indigo-700 transition"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-600 hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
