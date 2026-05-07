import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, DollarSign, Clock, 
  User, TrendingUp, Filter, X 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const OvertimeReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getOvertimeReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        departmentName: item.department || item.departmentName,
        date: item.date ? new Date(item.date).toLocaleDateString() : "-",
        hours: item.overtimeHours || 0,
        rate: item.rate || 0,
        amount: item.overtimeAmount || 0,
        reason: item.reason || "-",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching overtime report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const departments = data.map(r => r.departmentName).filter(Boolean);
    return Array.from(new Set(departments));
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || item.departmentName === departmentFilter;
      
      const itemDate = item.date;
      const matchesDateFrom = !dateFrom || itemDate >= new Date(dateFrom).toLocaleDateString();
      const matchesDateTo = !dateTo || itemDate <= new Date(dateTo).toLocaleDateString();
      
      return matchesSearch && matchesDepartment && matchesDateFrom && matchesDateTo;
    });
  }, [data, searchTerm, departmentFilter, dateFrom, dateTo]);

  // Statistics
  const totalEmployees = filteredData.length;
  const totalHours = filteredData.reduce((sum, item) => sum + (item.hours || 0), 0);
  const totalAmount = filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const averageHours = totalEmployees > 0 ? totalHours / totalEmployees : 0;

  const departmentOptions = [
    { value: "", label: t("all_departments") },
    ...uniqueDepartments.map(dept => ({ value: dept, label: dept })),
  ];

  const columns: Column<any>[] = [
    {
      header: t("employee"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.employeeName}</span>
            <span className="text-xs text-gray-500">{item.employeeCode}</span>
          </div>
        </div>
      )
    },
    {
      header: t("department"),
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.departmentName || "-"}
        </Badge>
      )
    },
    {
      header: t("date"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{item.date}</span>
        </div>
      )
    },
    {
      header: t("overtime_hours"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">{item.hours} h</span>
        </div>
      )
    },
    {
      header: t("rate"),
      render: (item) => (
        <span className="text-sm text-gray-600">{item.rate} EGP/h</span>
      )
    },
    {
      header: t("total_amount"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            {item.amount?.toLocaleString()} EGP
          </span>
        </div>
      )
    },
    {
      header: t("reason"),
      render: (item) => (
        <span className="text-sm text-gray-500 max-w-xs truncate">{item.reason}</span>
      )
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || departmentFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("overtime_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_overtime_details_for_employees")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={fetchData}
            className="border-gray-200"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </Button>
          <ExportDropdown data={filteredData} filename="overtime_report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_employees")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_hours")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalHours} h</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("average_hours")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{averageHours.toFixed(1)} h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_by_employee")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item, index) => `${item.employeeCode}-${index}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};

// Add missing import
import { RefreshCw } from "lucide-react";