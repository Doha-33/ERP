import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Star, TrendingUp, Users, 
  Award, Filter, X, Calendar, User 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const PerformanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Q1-2026");
  const [minScoreFilter, setMinScoreFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getPerformanceReport(selectedPeriod);
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        evaluationScore: item.evaluationScore || 0,
        period: item.period,
        status: item.status,
        attendance: item.attendance || 0,
        productivity: item.productivity || 0,
        teamwork: item.teamwork || 0,
        communication: item.communication || 0,
        skillDevelopment: item.skillDevelopment || 0,
        comments: item.comments || item.notes || "-",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch performance report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMinScore = !minScoreFilter || (item.evaluationScore || 0) >= parseInt(minScoreFilter);
      
      return matchesSearch && matchesMinScore;
    });
  }, [data, searchTerm, minScoreFilter]);

  // Statistics
  const totalEmployees = filteredData.length;
  const avgScore = totalEmployees > 0 
    ? Math.round(filteredData.reduce((sum, item) => sum + (item.evaluationScore || 0), 0) / totalEmployees)
    : 0;
  const excellentCount = filteredData.filter(item => (item.evaluationScore || 0) >= 80).length;
  const goodCount = filteredData.filter(item => (item.evaluationScore || 0) >= 60 && (item.evaluationScore || 0) < 80).length;
  const needsImprovementCount = filteredData.filter(item => (item.evaluationScore || 0) < 60).length;

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="success" className="bg-green-50 text-green-700">{t("excellent")}</Badge>;
    }
    if (score >= 60) {
      return <Badge variant="warning" className="bg-orange-50 text-orange-700">{t("good")}</Badge>;
    }
    return <Badge variant="danger" className="bg-red-50 text-red-700">{t("needs_improvement")}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const periodOptions = [
    { value: "Q1-2026", label: "Q1 2026" },
    { value: "Q2-2026", label: "Q2 2026" },
    { value: "Q3-2026", label: "Q3 2026" },
    { value: "Q4-2026", label: "Q4 2026" },
    { value: "2025", label: "Year 2025" },
    { value: "2024", label: "Year 2024" },
  ];

  const scoreFilterOptions = [
    { value: "", label: t("all_scores") },
    { value: "60", label: t("above_60") },
    { value: "70", label: t("above_70") },
    { value: "80", label: t("above_80") },
    { value: "90", label: t("above_90") },
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
            <span className="text-xs text-gray-500">{item.employeeCode || "-"}</span>
          </div>
        </div>
      )
    },
    {
      header: t("metrics"),
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24">{t("attendance")}:</span>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.attendance || 0}%` }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-8">{item.attendance || 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24">{t("productivity")}:</span>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.productivity || 0}%` }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-8">{item.productivity || 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24">{t("teamwork")}:</span>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.teamwork || 0}%` }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-8">{item.teamwork || 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24">{t("communication")}:</span>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.communication || 0}%` }} />
              </div>
            </div>
            <span className="text-xs text-gray-600 w-8">{item.communication || 0}%</span>
          </div>
        </div>
      )
    },
    {
      header: t("overall_score"),
      render: (item) => {
        const score = item.evaluationScore || 0;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-orange-500" : "bg-red-500"}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
            </div>
            {getScoreBadge(score)}
          </div>
        );
      }
    },
    {
      header: t("comments"),
      render: (item) => (
        <span className="text-sm text-gray-500 max-w-xs truncate">{item.comments}</span>
      )
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setMinScoreFilter("");
  };

  const hasFilters = searchTerm || minScoreFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("performance_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_performance_evaluations_summary")}
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
          <ExportDropdown data={filteredData} filename={`performance_report_${selectedPeriod}`} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_evaluations")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("average_score")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{avgScore}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-green-600 fill-green-100" />
            <p className="text-xs text-gray-500">{t("excellent")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{excellentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("good")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{goodCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("needs_improvement")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{needsImprovementCount}</p>
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

        <select
          value={selectedPeriod}
          onChange={(e) => {
            setSelectedPeriod(e.target.value);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={minScoreFilter}
          onChange={(e) => setMinScoreFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {scoreFilterOptions.map((option) => (
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
          keyExtractor={(item, index) => `${item.employeeName}-${index}`}
          isLoading={loading}
          selectable
        />
    </div>
  );
};

// Add missing import
import { RefreshCw } from "lucide-react";