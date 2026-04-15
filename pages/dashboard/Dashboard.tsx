import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  Filter,
  MoreHorizontal,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ShoppingBag,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { Order } from "../../types";
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";

// Mock data for charts (replace with real API data)
const generateMonthlyData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month) => ({
    name: month,
    sales: Math.floor(Math.random() * 10000) + 5000,
    orders: Math.floor(Math.random() * 500) + 200,
  }));
};

const generateStatsData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    name: month,
    revenue: Math.floor(Math.random() * 15000) + 5000,
    users: Math.floor(Math.random() * 1000) + 500,
  }));
};

const COLORS = {
  primary: "#4361EE",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  dark: "#1E293B",
  light: "#94A3B8",
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.warning,
  COLORS.success,
  COLORS.danger,
];

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { employees, payrollRecords, isDataLoading } = useData();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic data
  const monthlySalesData = useMemo(() => generateMonthlyData(), []);
  const statsData = useMemo(() => generateStatsData(), []);

  // Calculate real stats
  const totalEmployeesCount = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.employeeStatus === "active",
  ).length;
  const totalPayroll = payrollRecords.reduce(
    (sum, record) => sum + (record.amount || 0),
    0,
  );
  const avgSalary =
    totalEmployeesCount > 0 ? totalPayroll / totalEmployeesCount : 0;

  // Target data based on actual performance
  const targetAchieved = 65; // This should come from your actual data
  const targetData = [
    { name: "Achieved", value: targetAchieved },
    { name: "Remaining", value: 100 - targetAchieved },
  ];

  // Recent activities (mock data - replace with real activities)
  const recentActivities = [
    {
      id: 1,
      type: "user",
      message: "New employee added",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "payroll",
      message: "Payroll processed for March",
      time: "1 hour ago",
      status: "success",
    },
    {
      id: 3,
      type: "system",
      message: "System backup completed",
      time: "3 hours ago",
      status: "info",
    },
    {
      id: 4,
      type: "alert",
      message: "Leave request pending approval",
      time: "5 hours ago",
      status: "warning",
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - replace with actual data refresh logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
              {p.name}:{" "}
              <span className="font-bold text-primary">
                ${p.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {t("dashboard")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("welcome_back")}, {t("admin")} •{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200">
            <Download size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <Button className="gap-2">
            <Filter size={18} />
            {t("filter")}
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white dark:bg-gray-800">
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {totalEmployeesCount}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("total_employees")}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("active")}: {activeEmployees}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t("inactive")}: {totalEmployeesCount - activeEmployees}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${(activeEmployees / totalEmployeesCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Payroll Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <Badge
                status="success"
                className="bg-green-100 dark:bg-green-900/30"
              >
                {t("this_month")}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              ${totalPayroll.toLocaleString()}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("total_payroll")}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("avg_salary")}: ${avgSalary.toFixed(0)}
                </span>
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ArrowUp size={12} /> +5.2%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2.5 py-1 rounded-full">
                +23%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              $48,293
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("total_revenue")}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs">
                <ArrowUp size={12} className="text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  +12.5%
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Target Achievement Card */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Target size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {targetAchieved}%
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("target_achievement")}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${targetAchieved}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview Chart */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {t("sales_overview")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("monthly_sales_performance")}
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {["Weekly", "Monthly", "Yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period.toLowerCase() as any)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                    selectedPeriod === period.toLowerCase()
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? "#334155" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: isDarkMode ? "#94A3B8" : "#64748B",
                    fontSize: 12,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: isDarkMode ? "#94A3B8" : "#64748B",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sales"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {t("revenue_trend")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("revenue_growth_over_time")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Eye size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? "#334155" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: isDarkMode ? "#94A3B8" : "#64748B",
                    fontSize: 12,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: isDarkMode ? "#94A3B8" : "#64748B",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Achievement Pie Chart */}
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {t("target_achievement")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("annual_target_progress")}
              </p>
            </div>
            <MoreHorizontal
              size={20}
              className="text-gray-400 cursor-pointer hover:text-gray-600"
            />
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {targetData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {targetAchieved}%
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("completed")}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t("achieved")}
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {targetAchieved}%
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t("remaining")}
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {100 - targetAchieved}%
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {t("recent_activity")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("latest_updates_and_actions")}
              </p>
            </div>
            <button className="text-sm text-primary hover:underline">
              {t("view_all")}
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
              >
                <div
                  className={`
                  p-2 rounded-lg transition-all duration-200
                  ${activity.status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-600" : ""}
                  ${activity.status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" : ""}
                  ${activity.status === "info" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : ""}
                `}
                >
                  {activity.type === "user" && <Users size={18} />}
                  {activity.type === "payroll" && <DollarSign size={18} />}
                  {activity.type === "system" && <Activity size={18} />}
                  {activity.type === "alert" && <AlertCircle size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                </div>
                <CheckCircle
                  size={16}
                  className={`text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ${
                    activity.status === "success" ? "text-green-500" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isDataLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t("loading_data")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
