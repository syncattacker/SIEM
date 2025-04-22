import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController
);

const ChartSection = () => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);

  useEffect(() => {
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
      pieChartInstance.current = null;
    }
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
      barChartInstance.current = null;
    }

    if (pieChartRef.current) {
      try {
        pieChartInstance.current = new ChartJS(pieChartRef.current, {
          type: "pie",
          data: {
            labels: ["Category A", "Category B", "Category C", "Category D"],
            datasets: [
              {
                data: [30, 25, 20, 25],
                backgroundColor: ["#6C63FF", "#A29FFE", "#D1D0FF", "#E9E6F7"],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "right" },
            },
          },
        });
      } catch (error) {
        console.error("Error initializing pie chart:", error);
      }
    }

    if (barChartRef.current) {
      try {
        barChartInstance.current = new ChartJS(barChartRef.current, {
          type: "bar",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Events",
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: "#6C63FF",
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      } catch (error) {
        console.error("Error initializing bar chart:", error);
      }
    }

    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
        pieChartInstance.current = null;
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Overview</h2>
        <div className="relative h-64">
          <canvas ref={pieChartRef} className="w-full h-full"></canvas>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Analytics</h2>
        <div className="relative h-64">
          <canvas ref={barChartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
