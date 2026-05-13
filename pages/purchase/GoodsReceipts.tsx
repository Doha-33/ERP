import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, FileText, Package, Warehouse, Calendar, User, DollarSign, Filter, X } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { GoodsReceiptModal } from "../../components/purchase/GoodsReceiptModal";
import { useData } from "../../context/DataContext";
import { GoodsReceipt } from "../../types";
import { toast } from "sonner";

export const GoodsReceipts: React.FC = () => {
  const { t } = useTranslation();
  const { goodsReceipts, addGoodsReceipt, updateGoodsReceipt, deleteGoodsReceipt, fetchGoodsReceipts } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<GoodsReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  const handleSave = async (receiptData: Partial<GoodsReceipt>) => {
    try {
      setIsLoading(true);
      
      if (editingReceipt) {
        // Get the ID from editingReceipt
        const receiptId = extractId(editingReceipt);
        
        if (!receiptId) {
          toast.error(t("goods_receipt_id_missing"));
          return;
        }
        
        // Create update data with ID
        const updateData = {
          ...receiptData,
          _id: receiptId,
          id: receiptId
        } as GoodsReceipt;
        
        console.log("Updating goods receipt with ID:", receiptId, updateData);
        await updateGoodsReceipt(updateData);
        toast.success(t("goods_receipt_updated_successfully"));
      } else {
        await addGoodsReceipt(receiptData as GoodsReceipt);
        toast.success(t("goods_receipt_created_successfully"));
      }
      
      await fetchGoodsReceipts(); // Refresh list
      setIsModalOpen(false);
      setEditingReceipt(null);
    } catch (error: any) {
      console.error("Error saving goods receipt:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_goods_receipt");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((receipt: GoodsReceipt) => {
    // Extract ID correctly from the receipt object
    const receiptId = extractId(receipt);
    
    if (!receiptId) {
      console.error("Goods receipt ID not found", receipt);
      toast.error(t("goods_receipt_id_not_found"));
      return;
    }
    
    // Create a clean receipt object with proper ID
    const receiptToEdit: GoodsReceipt = {
      ...receipt,
      _id: receiptId,
      id: receiptId,
    };
    
    console.log("Editing goods receipt:", receiptToEdit);
    setEditingReceipt(receiptToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteGoodsReceipt(deleteId);
        toast.success(t("goods_receipt_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchGoodsReceipts();
      } catch (error) {
        toast.error(t("failed_to_delete_goods_receipt"));
      }
    }
  }, [deleteId, deleteGoodsReceipt, fetchGoodsReceipts, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteGoodsReceipt(id)));
      toast.success(t("goods_receipts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchGoodsReceipts();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_goods_receipts"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getWarehouseName = (receipt: GoodsReceipt): string => {
    if (!receipt.warehouseId) return "-";
    if (typeof receipt.warehouseId === 'object') {
      return (receipt.warehouseId as any)?.warehouseName || "-";
    }
    return receipt.warehouseId || "-";
  };

  const getReceivedByName = (receipt: GoodsReceipt): string => {
    if (!receipt.receivedBy) return "-";
    if (typeof receipt.receivedBy === 'object') {
      return (receipt.receivedBy as any)?.username || (receipt.receivedBy as any)?.fullName || "-";
    }
    return receipt.receivedBy || "-";
  };

  // Apply filters
  const filteredReceipts = useMemo(() => {
    return goodsReceipts.filter(r => {
      const matchesSearch = 
        r.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items?.some(item => {
          const productName = typeof item.productId === "object" ? (item.productId as any)?.productName : "";
          return productName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      
      return matchesSearch;
    });
  }, [goodsReceipts, searchTerm]);

  // Statistics
  const totalReceipts = filteredReceipts.length;
  const totalValue = filteredReceipts.reduce((sum, r) => sum + (r.totalValue || 0), 0);
  const totalQty = filteredReceipts.reduce((sum, r) => sum + (r.totalQty || 0), 0);

  const columns: Column<GoodsReceipt>[] = useMemo(
    () => [
      {
        header: t("receipt_info"),
        render: (r) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{r.grnNumber}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">
              {new Date(r.receiptDate).toLocaleDateString()}
            </span>
          </div>
        )
      },
      {
        header: t("items"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            {r.items?.slice(0, 2).map((item, idx) => {
              const productName = typeof item.productId === "object" 
                ? (item.productId as any)?.productName 
                : item.sku || "Product";
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Package size={12} className="text-gray-400" />
                  <span className="text-gray-600">{productName}</span>
                  <span className="text-gray-400">x{item.acceptedQuantity}</span>
                </div>
              );
            })}
            {r.items && r.items.length > 2 && (
              <span className="text-xs text-gray-400">+{r.items.length - 2} more</span>
            )}
          </div>
        )
      },
      {
        header: t("warehouse"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Warehouse size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{getWarehouseName(r)}</span>
          </div>
        )
      },
      {
        header: t("received_by"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{getReceivedByName(r)}</span>
          </div>
        )
      },
      {
        header: t("total_qty"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-gray-400" />
            <span className="text-sm font-medium">{r.totalQty?.toLocaleString() || 0}</span>
          </div>
        )
      },
      {
        header: t("total_value"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{r.totalValue?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => {
          const receiptId = extractId(r);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(r)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(receiptId)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                title={t("delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
      }
    ],
    [t, handleEdit, handleDelete, extractId]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("goods_receipts")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_goods_receipts")}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredReceipts} filename="goods-receipts" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingReceipt(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_goods_receipt")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_receipts")}</p>
              <p className="text-xl font-bold text-gray-900">{totalReceipts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_quantity")}</p>
              <p className="text-xl font-bold text-green-600">{totalQty.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_value")}</p>
              <p className="text-xl font-bold text-blue-600">{totalValue.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_goods_receipts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredReceipts}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <GoodsReceiptModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReceipt(null);
        }}
        onSave={handleSave}
        receiptToEdit={editingReceipt}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_goods_receipt")}
        message={t("are_you_sure_delete_goods_receipt")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_goods_receipts")}
        message={t("are_you_sure_delete_goods_receipts", { count: selectedIds.length })}
      />
    </div>
  );
};