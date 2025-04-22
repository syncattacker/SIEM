import React from "react";
import { BarChart, ShoppingBag, Users, Package } from "lucide-react";

const iconMap = {
  BarChart: BarChart,
  ShoppingBag: ShoppingBag,
  Users: Users,
  Package: Package,
};

const StatsCard = ({ label, value, icon }) => {
  const IconComponent = iconMap[icon];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 w-full">
      {IconComponent && <IconComponent size={36} className="text-[#6C63FF]" />}
      <div>
        <p className="text-[#7A7A7A] text-sm">{label}</p>
        <p className="text-2xl font-semibold text-[#2D2D2D]">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
