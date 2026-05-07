import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Building2, Users, DollarSign, 
  TrendingUp, PieChart, RefreshCw, Download, 
  X, Calendar, Percent
} from "lucide-react";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const DepartmentCostReport: React.FC = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departments: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await hrService.getDepartmentCostReport();
      if (response?.data) {
        setReportData(response.data);
      } else if (response?.success && response?.data) {
        setReportData(response.data);
      } else if (response?.departments) {
        setReportData(response);
      } else {
        setReportData({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          departments: response || []
        });
      }
    } catch (error) {
      console.error("Error fetching department cost report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter departments
  const filteredData = useMemo(() => {
    let departments = reportData.departments || [];
    
    if (searchTerm) {
      departments = departments.filter(dept => 
        dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return departments;
  }, [reportData.departments, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalHeadcount = filteredData.reduce((sum, dept) => sum + (dept.headcount || 0), 0);
    const totalSalary = filteredData.reduce((sum, dept) => sum + (dept.totalSalary || 0), 0);
    const totalAllowances = filteredData.reduce((sum, dept) => sum + (dept.totalAllowances || 0), 0);
    const totalBenefits = filteredData.reduce((sum, dept) => sum + (dept.totalBenefits || 0), 0);
    const totalCost = filteredData.reduce((sum, dept) => sum + (dept.totalCost || 0), 0);
    
    return {
      headcount: totalHeadcount,
      salary: totalSalary,
      allowances: totalAllowances,
      benefits: totalBenefits,
      cost: totalCost
    };
  }, [filteredData]);

  const columns: Column<any>[] = [
    {
      header: t("department"),
      render: (dept) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {dept.departmentName}
            </span>
            <span className="text-xs text-gray-500">
              {dept.managerName ? `${t("manager")}: ${dept.managerName}` : ""}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("headcount"),
      render: (dept) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">
            {dept.headcount || 0}
          </span>
        </div>
      )
    },
    {
      header: t("total_salary"),
      render: (dept) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            ${(dept.totalSalary || 0).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            {(dept.salaryPercent || 0).toFixed(1)}% {t("of_total")}
          </span>
        </div>
      )
    },
    {
      header: t("total_allowances"),
      render: (dept) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-500" />
          <span className="text-sm text-gray-700">
            ${(dept.totalAllowances || 0).toFixed(2)}
          </span>
        </div>
      )
    },
    {
      header: t("total_benefits"),
      render: (dept) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-purple-500" />
          <span className="text-sm text-gray-700">
            ${(dept.totalBenefits || 0).toFixed(2)}
          </span>
        </div>
      )
    },
    {
      header: t("total_cost"),
      render: (dept) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-red-600">
            ${(dept.totalCost || 0).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            {(dept.costPercent || 0).toFixed(1)}% {t("of_total")}
          </span>
        </div>
      )
    },
    {
      header: t("cost_per_employee"),
      render: (dept) => {
        const costPerEmployee = dept.headcount > 0 
          ? (dept.totalCost || 0) / dept.headcount 
          : 0;
        return (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-orange-500" />
            <span className="text-sm text-gray-700">
              ${costPerEmployee.toFixed(2)}
            </span>
          </div>
        );
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
  };

  const hasFilters = searchTerm;

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      t("january"), t("february"), t("march"), t("april"), 
      t("may"), t("june"), t("july"), t("august"), 
      t("september"), t("october"), t("november"), t("december")
    ];
    return months[month - 1] || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("department_cost_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_total_hr_costs_per_department")}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {getMonthName(reportData.month)} {reportData.year}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={18} />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Headcount Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_headcount")}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {totals.headcount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Salary Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_salary")}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(totals.salary / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Allowances Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_allowances")}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(totals.allowances / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Percent size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Benefits Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_benefits")}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(totals.benefits / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <PieChart size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Cost Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">
                {t("total_cost")}
              </p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                ${(totals.cost / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
              <TrendingUp size={20} className="text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary Bar */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t("cost_distribution")}</p>
            <p className="text-xs text-gray-500 mt-1">{t("salary_vs_allowances_vs_benefits")}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">{t("salary")}: {(totals.salary / totals.cost * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">{t("allowances")}: {(totals.allowances / totals.cost * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">{t("benefits")}: {(totals.benefits / totals.cost * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex w-full h-2 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full"
            style={{ width: `${(totals.salary / totals.cost * 100) || 0}%` }}
          />
          <div 
            className="bg-yellow-500 h-full"
            style={{ width: `${(totals.allowances / totals.cost * 100) || 0}%` }}
          />
          <div 
            className="bg-purple-500 h-full"
            style={{ width: `${(totals.benefits / totals.cost * 100) || 0}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_department")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
              {t("clear_filters")}
            </button>
          )}
        </div>

        {hasFilters && filteredData.length !== reportData.departments?.length && (
          <div className="text-sm text-gray-500">
            {t("showing")} {filteredData.length} {t("of")} {reportData.departments?.length || 0} {t("departments")}
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        columns={columns}
        keyExtractor={(item, index) => `${item.departmentName}-${index}`}
        isLoading={isLoading}
        selectable
        emptyMessage={t("no_departments_found")}
      />
    </div>
  );
};