import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const LogTable = ({
  logs,
  currentLogs,
  sortConfig,
  handleSort,
  indexOfFirstLog,
  indexOfLastLog,
  filteredLogs,
  currentPage,
  totalPages,
  paginate,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {logs[0] &&
                Object.keys(logs[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-2 text-left text-sm font-semibold text-[#7A7A7A] uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      {key.replace(/_/g, " ")}
                      {sortConfig.key === key && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? (
                            <ArrowUp size={16} />
                          ) : (
                            <ArrowDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLogs.length > 0 ? (
              currentLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(log).map((val, i) => (
                    <td
                      key={i}
                      className="px-4 py-2 text-sm text-[#2D2D2D] whitespace-nowrap"
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
                  className="px-4 py-2 text-center text-[#7A7A7A]"
                >
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-[#7A7A7A] text-center sm:text-left">
          Showing {filteredLogs.length > 0 ? indexOfFirstLog + 1 : 0} to{" "}
          {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
          {filteredLogs.length} logs
        </div>
        <div className="flex space-x-2 flex-wrap justify-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#6C63FF] text-white rounded-lg disabled:bg-gray-300"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page
                  ? "bg-[#6C63FF] text-white"
                  : "bg-gray-200 text-[#2D2D2D]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#6C63FF] text-white rounded-lg disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogTable;
