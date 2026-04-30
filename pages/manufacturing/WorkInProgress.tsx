import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  RefreshCcw, 
  Search, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Layers,
  Activity,
  Eye,
  Package,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { WIPDetailsModal } from "../../components/manufacturing/WIPDetailsModal";
import {manufacturingService} from "../../services/manufacturing.service";
import { WorkInProgress as WIPType } from "../../types";
import { toast } from "sonner";

export const WorkInProgress: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [wipItems, setWipItems] = useState<WIPType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<WIPType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchWIP();
  }, []);

  const fetchWIP = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getWIPs();
      setWipItems(data);
    } catch (error) {
      console.error("Failed to fetch WIP:", error);
      toast.error(t("failed_to_fetch_wip"));
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (item: WIPType) => {
    if (!item.planned_qty || item.planned_qty === 0) return 0;
    return Math.round((item.produced_qty / item.planned_qty) * 100);
  };

  const getStatus = (item: WIPType) => {
    const progress = calculateProgress(item);
    if (progress >= 100) return { label: t("completed"), variant: "success" as const };
    return { label: t("in_progress"), variant: "info" as const };
  };

  const getStatusBadge = (item: WIPType) => {
    const status = getStatus(item);
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const filteredItems = wipItems.filter((item) => {
    const matchesSearch =
      item.mo_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && calculateProgress(item) >= 100) ||
      (statusFilter === "in_progress" && calculateProgress(item) < 100);
    return matchesSearch && matchesStatus;
  });

  // Summary statistics
  const totalActiveTasks = wipItems.filter(item => calculateProgress(item) < 100).length;
  const avgProgress = wipItems.length > 0 
    ? Math.round(wipItems.reduce((acc, curr) => acc + calculateProgress(curr), 0) / wipItems.length)
    : 0;
  const totalScrap = wipItems.reduce((acc, curr) => acc + curr.scrap_qty, 0);
  const totalProduced = wipItems.reduce((acc, curr) => acc + curr.produced_qty, 0);
  const totalPlanned = wipItems.reduce((acc, curr) => acc + curr.planned_qty, 0);

  const columns: Column<WIPType>[] = [
    {
      header: t("mo_number"),
      accessorKey: "mo_number",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Package size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.mo_number}</span>
            <span className="text-xs text-gray-500">{item.product}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("production"),
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t("planned")}:</span>
            <span className="text-sm font-medium">{item.planned_qty.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t("produced")}:</span>
            <span className="text-sm font-medium text-green-600">{item.produced_qty.toLocaleString()}</span>
          </div>
          {item.scrap_qty > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("scrap")}:</span>
              <span className="text-sm font-medium text-red-600">{item.scrap_qty.toLocaleString()}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("progress"),
      render: (item) => {
        const progress = calculateProgress(item);
        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  progress >= 100 ? "bg-green-500" : "bg-indigo-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: t("dates"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs">Start: {new Date(item.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs">End: {new Date(item.expected_end_date).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item),
    },
    {
      header: t("actions"),
      render: (item) => (
        <button
          onClick={() => {
            setSelectedItem(item);
            setIsDetailsModalOpen(true);
          }}
          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const statusOptions = [
    { value: "all", label: t("all_tasks") },
    { value: "in_progress", label: t("in_progress") },
    { value: "completed", label: t("completed") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("work_in_progress")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("monitor_active_production")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={wipItems} filename="work-in-progress" />
          <Button 
            variant="secondary" 
            onClick={fetchWIP}
            className="border-gray-200"
          >
            <RefreshCcw size={18} />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active_tasks")}</p>
              <p className="text-xl font-bold text-gray-900">{totalActiveTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_progress")}</p>
              <p className="text-xl font-bold text-gray-900">{avgProgress}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Layers size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_produced")}</p>
              <p className="text-xl font-bold text-gray-900">{totalProduced.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_scrap")}</p>
              <p className="text-xl font-bold text-red-600">{totalScrap.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_wip_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
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
      </div>

      {/* Table */}
      <Card className="bg-white">
        <Table
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => item._id}
          isLoading={loading}
          selectable
        />
      </Card>

      {/* Details Modal */}
      <WIPDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
};