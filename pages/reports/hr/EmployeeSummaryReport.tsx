import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, User, Building2, Calendar, 
  DollarSign, Briefcase, Filter, X, 
  Users, TrendingUp, RefreshCw 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const EmployeeSummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getEmployeeSummaryReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        id: item.employeeId,
        employeeCode: item.employeeCode,
        fullName: item.name,
        jobTitle: item.jobTitle || "-",
        department: item.department || "-",
        branch: item.branch || "-",
        status: item.employmentStatus || "INACTIVE",
        joinDate: item.joiningDate ? new Date(item.joiningDate).toLocaleDateString() : "-",
        contractEndDate: item.contractEndDate ? new Date(item.contractEndDate).toLocaleDateString() : "-",
        basicSalary: item.basicSalary || 0,
        allowances: item.allowances || 0,
        totalSalary: item.totalSalary || 0,
        manager: item.manager || "-",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch employee summary report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setLoading(false);
    }
  };

  // Get unique branches for filter
  const uniqueBranches = useMemo(() => {
    const branches = data.map(r => r.branch).filter(Boolean);
    return Array.from(new Set(branches));
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesBranch = !branchFilter || item.branch === branchFilter;
      
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [data, searchTerm, statusFilter, branchFilter]);

  // Statistics
  const totalEmployees = filteredData.length;
  const activeCount = filteredData.filter(item => item.status === "ACTIVE").length;
  const inactiveCount = filteredData.filter(item => item.status === "INACTIVE").length;
  const totalSalary = filteredData.reduce((sum, item) => sum + (item.totalSalary || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
      ACTIVE: { variant: "success", label: t("active") },
      INACTIVE: { variant: "danger", label: t("inactive") },
      ON_LEAVE: { variant: "warning", label: t("on_leave") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "ON_LEAVE", label: t("on_leave") },
  ];

  const branchOptions = [
    { value: "", label: t("all_branches") },
    ...uniqueBranches.map(branch => ({ value: branch, label: branch })),
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
            <span className="font-medium text-gray-900">{item.fullName}</span>
            <span className="text-xs text-gray-500">ID: {item.id?.slice(-8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t("job_info"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{item.jobTitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">{item.department}</span>
          </div>
        </div>
      )
    },
    {
      header: t("branch"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Building2 size={14} className="text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">{item.branch}</span>
        </div>
      )
    },
    {
      header: t("dates"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">{t("joined")}: {item.joinDate}</span>
          </div>
          {item.contractEndDate !== "-" && (
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">{t("contract_ends")}: {item.contractEndDate}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: t("salary"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">{formatCurrency(item.totalSalary)}</span>
          </div>
          <span className="text-xs text-gray-500">{t("basic")}: {formatCurrency(item.basicSalary)}</span>
        </div>
      )
    },
    {
      header: t("manager"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{item.manager}</span>
        </div>
      )
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.status)
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setBranchFilter("");
  };

  const hasFilters = searchTerm || statusFilter || branchFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("employee_summary_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_all_employee_details")}
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
          <ExportDropdown data={filteredData} filename="employee-summary-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_employees")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("inactive")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{inactiveCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_salary")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalSalary.toLocaleString()} EGP</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_by_name_or_id")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {branchOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          selectable
        />
    </div>
  );
};

// Add missing imports
import { CheckCircle, XCircle } from "lucide-react";