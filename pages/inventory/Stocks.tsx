import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Eye, ArrowRightLeft, ArrowDown, ArrowUp, Package, AlertCircle, X, RefreshCw, Warehouse, Clock, CheckCircle } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { StockModal } from "../../components/inventory/StockModal";
import { useData } from "../../context/DataContext";
import { Stock } from "../../types";
import { toast } from "sonner";

export const Stocks: React.FC = () => {
  const { t } = useTranslation();
  const { stocks, fetchStocks } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStockIn = async (data: any) => {
    try {
      setIsLoading(true);
      // Call API for stock in
      console.log("Stock In:", data);
      toast.success(t("stock_in_successful"));
      await fetchStocks();
      setIsStockInModalOpen(false);
    } catch (error) {
      console.error("Error processing stock in:", error);
      toast.error(t("stock_in_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockOut = async (data: any) => {
    try {
      setIsLoading(true);
      // Call API for stock out
      console.log("Stock Out:", data);
      toast.success(t("stock_out_successful"));
      await fetchStocks();
      setIsStockOutModalOpen(false);
    } catch (error) {
      console.error("Error processing stock out:", error);
      toast.error(t("stock_out_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
      "In Stock": { variant: "success", label: t("in_stock") },
      "Low Stock": { variant: "warning", label: t("low_stock") },
      "Out of Stock": { variant: "danger", label: t("out_of_stock") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Apply filters
  const filteredStocks = useMemo(() => {
    if (!Array.isArray(stocks)) return [];
    
    return stocks.filter(s => {
      const productName = s.productName || (s as any).product?.name || (typeof s.productId === 'object' ? (s.productId as any)?.productName : "") || "";
      const sku = s.sku || (s as any).product?.sku || (typeof s.productId === 'object' ? (s.productId as any)?.sku : "") || "";
      
      const matchesSearch = 
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const sWarehouseId = typeof s.warehouseId === 'object' ? (s.warehouseId as any)?._id : s.warehouseId;
      const matchesWarehouse = !warehouseFilter || sWarehouseId === warehouseFilter;
      
      return matchesSearch && matchesWarehouse;
    });
  }, [stocks, searchTerm, warehouseFilter]);

  // Statistics
  const totalInStock = filteredStocks.reduce((sum, s) => sum + (Number(s.inStockQty) || 0), 0);
  const totalReserved = filteredStocks.reduce((sum, s) => sum + (Number(s.reservedQty) || 0), 0);
  const totalAvailable = filteredStocks.reduce((sum, s) => sum + (Number(s.availableQty) || 0), 0);
  const lowStockCount = filteredStocks.filter(s => s.status === "Low Stock").length;

  const columns: Column<Stock>[] = useMemo(
    () => [
      {
        header: t("product_info"),
        render: (s) => {
          const pName = s.productName || (s as any).product?.name || (typeof s.productId === 'object' ? (s.productId as any)?.productName : "N/A");
          const pSku = s.sku || (s as any).product?.sku || (typeof s.productId === 'object' ? (s.productId as any)?.sku : "N/A");
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Package size={18} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{pName}</span>
                <span className="text-xs text-gray-500">{pSku}</span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("warehouse"),
        render: (s) => {
          let wName = s.warehouseName;
          if (!wName && typeof s.warehouseId === 'object' && s.warehouseId !== null) {
            wName = (s.warehouseId as any).warehouseName || (s.warehouseId as any).name;
          }
          const displayValue = (typeof wName === 'string') ? wName : (typeof s.warehouseId === 'string' ? s.warehouseId : "N/A");
          
          return (
            <div className="flex items-center gap-1.5">
              <Warehouse size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{displayValue}</span>
            </div>
          );
        }
      },
      {
        header: t("stock_levels"),
        render: (s) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("in_stock")}:</span>
              <span className="text-sm font-medium text-green-600">{s.inStockQty} {s.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("reserved")}:</span>
              <span className="text-sm text-orange-600">{s.reservedQty} {s.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("available")}:</span>
              <span className="text-sm font-bold text-indigo-600">{s.availableQty} {s.unit}</span>
            </div>
          </div>
        )
      },
      {
        header: t("status"),
        render: (s) => getStatusBadge(s.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (s) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
              title={t("stock_in")}
            >
              <ArrowDown size={16} />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              title={t("stock_out")}
            >
              <ArrowUp size={16} />
            </button>
            <button
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
              title={t("transfer")}
            >
              <ArrowRightLeft size={16} />
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("view_movements")}
            >
              <Eye size={16} />
            </button>
          </div>
        )
      }
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("stock_inventory")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("monitor_stock_levels")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => fetchStocks()}
            className="border-gray-200"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </Button>
          <ExportDropdown data={filteredStocks} filename="stock-inventory" />
          <Button
            variant="primary"
            onClick={() => setIsStockInModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowDown size={18} />
            {t("stock_in")}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsStockOutModalOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <ArrowUp size={18} />
            {t("stock_out")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_in_stock")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalInStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("total_reserved")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{totalReserved.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_available")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalAvailable.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("low_stock_items")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{lowStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_stock")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {(searchTerm || warehouseFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setWarehouseFilter("");
              setStatusFilter("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredStocks}
          columns={columns}
          keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
          isLoading={isLoading}
          selectable
        />

      {/* Modals */}
      <StockModal
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        mode="in"
        onSave={handleStockIn}
        isLoading={isLoading}
      />

      <StockModal
        isOpen={isStockOutModalOpen}
        onClose={() => setIsStockOutModalOpen(false)}
        mode="out"
        onSave={handleStockOut}
        isLoading={isLoading}
      />
    </div>
  );
};