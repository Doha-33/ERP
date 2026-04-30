import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../../components/ui/Common";

interface ReportCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  icon: React.ElementType;
  color: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  color,
}) => {
  return (
    <Card className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trendValue}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </Card>
  );
};