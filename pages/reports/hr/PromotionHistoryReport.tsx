import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, DollarSign, TrendingUp, 
  User, Award, Filter, X, RefreshCw, 
  ArrowUp, Percent
} from "lucide-react";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const PromotionHistoryReport: React.FC = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState({
    year: new Date().getFullYear(),
    totalPromotions: 0,
    totalSalaryIncrease: 0,
    averageSalaryIncrease: 0,
    promotions: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await hrService.getPromotionHistoryReport();
      // Handle response structure
      if (response?.data) {
        setReportData(response.data);
      } else if (response?.success && response?.data) {
        setReportData(response.data);
      } else if (response?.promotions) {
        setReportData(response);
      } else {
        setReportData({
          year: new Date().getFullYear(),
          totalPromotions: 0,
          totalSalaryIncrease: 0,
          averageSalaryIncrease: 0,
          promotions: response || []
        });
      }
    } catch (error) {
      console.error("Error fetching promotion history report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply date filters
  const filteredData = useMemo(() => {
    return reportData.promotions.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const itemDate = item.date;
      const matchesDateFrom = !dateFrom || itemDate >= dateFrom;
      const matchesDateTo = !dateTo || itemDate <= dateTo;
      
      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [reportData.promotions, searchTerm, dateFrom, dateTo]);

  // Statistics from filtered data
  const totalEmployees = filteredData.length;
  const totalSalaryIncreaseAmount = filteredData.reduce(
    (sum, item) => sum + (item.increasePercent || 0), 0
  );
  const averageIncreasePercent = totalEmployees > 0 
    ? totalSalaryIncreaseAmount / totalEmployees 
    : 0;

  const columns: Column<any>[] = [
    {
      header: t("employee"),
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <img 
              src={item.avatar} 
              alt={item.employeeName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {item.employeeName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.employeeCode}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("previous_position"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400 line-through decoration-red-400">
            {item.oldPosition}
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            {item.newPosition}
          </span>
        </div>
      )
    },
    {
      header: t("promotion_date"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {item.date}
          </span>
        </div>
      )
    },
    {
      header: t("previous_salary"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
            {Number(item.oldSalary || 0).toFixed(2)} EGP
          </span>
        </div>
      )
    },
    {
      header: t("new_salary"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {Number(item.newSalary || 0).toFixed(2)} EGP
          </span>
        </div>
      )
    },
    {
      header: t("salary_increase"),
      render: (item) => {
        const percent = Number(item.increasePercent || 0);
        return (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-purple-500" />
            <span className={`text-sm font-bold ${
              percent > 15 
                ? 'text-green-600 dark:text-green-400' 
                : percent > 5 
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              +{percent.toFixed(2)}%
            </span>
            {percent > 15 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:text-green-300">
                {t("high_increase")}
              </span>
            )}
          </div>
        );
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("promotion_history_report")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("track_employee_career_growth_and_promotions")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download size={18} />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("year")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {reportData.year}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Promotions Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("total_promotions")}
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {reportData.totalPromotions}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Award size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Salary Increase Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("total_salary_increase")}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                ${reportData.totalSalaryIncrease.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Average Increase Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("average_increase")}
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {reportData.averageSalaryIncrease.toFixed(1)}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Percent size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search Input */}
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_employee")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
              {t("clear_filters")}
            </button>
          )}
        </div>

        {/* Filter Stats */}
        {filteredData.length !== reportData.promotions.length && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("showing")} {filteredData.length} {t("of")} {reportData.promotions.length}
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        columns={columns}
        keyExtractor={(item, index) => `${item.employeeCode}-${index}`}
        isLoading={isLoading}
        selectable
        emptyMessage={t("no_promotions_found")}
      />

    </div>
  );
};

// Add missing import
import { Download } from "lucide-react";