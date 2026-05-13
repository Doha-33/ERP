import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight, History, Eye, UserCheck, UserX, Clock, Search } from "lucide-react";
import { Card, Button, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { ActionHistory } from "../../types";
import { toast } from "sonner";

type ResponseType = "eos" | "loans" | "leaves" | "requests";

export const Responses: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchResponses, responses, actionHistory, fetchActionHistory } = useData();
  const [activeTab, setActiveTab] = useState<ResponseType>("eos");
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ActionHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchResponses(activeTab === "eos" ? "end-of-service" : activeTab);
        await fetchActionHistory();
      } catch (error) {
        console.error("Error fetching responses:", error);
        toast.error(t("failed_to_fetch_responses"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, fetchResponses, fetchActionHistory, t]);

  const isAdmin = user?.role === "admin";

  const handleShowHistory = async (id: string) => {
    try {
      // Filter history by request ID
      const filteredHistory = actionHistory.filter(h => extractId(h.requestId) === id);
      setSelectedHistory(filteredHistory);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error(t("failed_to_fetch_history"));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info"; label: string }> = {
      Pending: { variant: "warning", label: t("pending") },
      Approved: { variant: "success", label: t("approved") },
      Rejected: { variant: "danger", label: t("rejected") },
      Submitted: { variant: "info", label: t("submitted") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const filteredResponses = useMemo(() => {
    return responses.filter(item => {
      const matchesSearch = 
        (item.employeeName || item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.requestNumber || item.id || item._id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [responses, searchTerm, statusFilter]);

  // Statistics
  const totalCount = filteredResponses.length;
  const pendingCount = filteredResponses.filter(r => r.status === "Pending").length;
  const approvedCount = filteredResponses.filter(r => r.status === "Approved").length;
  const rejectedCount = filteredResponses.filter(r => r.status === "Rejected").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

  const columns: Column<any>[] = [
    {
      header: t("request_info"),
      render: (item) => {
        const itemId = extractId(item);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {item.employeeName || item.name || item.requestNumber || "N/A"}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(item.date || item.createdAt || item.requestDate)}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: t("details"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">{item.type || item.requestType || "-"}</span>
          <span className="text-xs text-gray-400 max-w-xs truncate">{item.reason || "-"}</span>
        </div>
      )
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.status)
    },
    {
      header: t("actions"),
      className: "text-center",
      render: (item) => {
        const itemId = extractId(item);
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleShowHistory(itemId)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("action_history")}
            >
              <History size={16} />
            </button>
            <button
              onClick={() => navigate(`/hr/responses/${activeTab}/${itemId}`)}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
              title={t("view_details")}
            >
              <Eye size={16} />
              <span className="text-xs hidden sm:inline">{t("view")}</span>
            </button>
          </div>
        );
      }
    }
  ];

  const getKeyExtractor = useCallback((item: any) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  const tabConfig: Record<ResponseType, { label: string; key: string }> = {
    eos: { label: t("end_of_service"), key: "end-of-service" },
    loans: { label: t("loans"), key: "loans" },
    leaves: { label: t("leaves"), key: "leaves" },
    requests: { label: t("requests"), key: "requests" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("responses")}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t("manage_responses") : t("track_your_requests_status")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredResponses} filename={`${activeTab}-responses`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {(["eos", "loans", "leaves", "requests"] as ResponseType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            {tabConfig[tab].label}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_requests")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("approved")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <UserX size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_by_employee_or_request")}
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

        {(statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setSearchTerm("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredResponses}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={loading}
      />

      {/* History Modal */}
      <ResponsesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={selectedHistory}
      />
    </div>
  );
};