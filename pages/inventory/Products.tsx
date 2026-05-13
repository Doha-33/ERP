import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Eye, Package, DollarSign, Warehouse, Filter, X, Tag, AlertCircle, XCircle } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { InventoryProductModal } from "../../components/inventory/InventoryProductModal";
import { useData } from "../../context/DataContext";
import { Product } from "../../types";
import { toast } from "sonner";

export const InventoryProducts: React.FC = () => {
  const { t } = useTranslation();
  const { inventoryProducts, addProduct, updateProduct, deleteProduct, fetchInventoryProducts, warehouses } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const handleSave = async (productData: Partial<Product>) => {
    try {
      setIsLoading(true);
      
      if (editingProduct) {
        const productId = extractId(editingProduct);
        
        if (!productId) {
          toast.error(t("product_id_missing"));
          return;
        }
        
        const updateData = {
          ...productData,
          _id: productId,
          id: productId
        } as Product;
        
        console.log("Updating product with ID:", productId, updateData);
        await updateProduct(updateData);
        toast.success(t("product_updated_successfully"));
      } else {
        await addProduct(productData as Product);
        toast.success(t("product_created_successfully"));
      }
      
      await fetchInventoryProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error saving product:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_product");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((product: Product) => {
    const productId = extractId(product);
    
    if (!productId) {
      console.error("Product ID not found", product);
      toast.error(t("product_id_not_found"));
      return;
    }
    
    const productToEdit: Product = {
      ...product,
      _id: productId,
      id: productId,
    };
    
    console.log("Editing product:", productToEdit);
    setEditingProduct(productToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteProduct(deleteId);
        toast.success(t("product_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchInventoryProducts();
      } catch (error) {
        toast.error(t("failed_to_delete_product"));
      }
    }
  }, [deleteId, deleteProduct, fetchInventoryProducts, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteProduct(id)));
      toast.success(t("products_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchInventoryProducts();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_products"));
    } finally {
      setIsLoading(false);
    }
  };

  const getWarehouseName = (product: Product): string => {
    if (typeof product.warehouseId === "object" && product.warehouseId !== null) {
      return (product.warehouseId as any)?.warehouseName || "-";
    }
    const warehouse = warehouses.find(w => extractId(w) === product.warehouseId);
    return warehouse?.warehouseName || "-";
  };

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) {
      return { label: t("out_of_stock"), variant: "danger" as const };
    }
    if (currentStock <= reorderLevel) {
      return { label: t("low_stock"), variant: "warning" as const };
    }
    return { label: t("in_stock"), variant: "success" as const };
  };

  // Apply filters
  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter(p => {
      const matchesSearch = 
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm);
      
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [inventoryProducts, searchTerm, categoryFilter]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = inventoryProducts.map(p => p.category).filter(Boolean);
    return Array.from(new Set(categories));
  }, [inventoryProducts]);

  // Statistics
  const totalProducts = filteredProducts.length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + ((p.currentStockQty || p.openingStock || 0) * (p.sellingPrice || 0)), 0);
  const lowStockProducts = filteredProducts.filter(p => (p.currentStockQty || p.openingStock || 0) <= (p.reorderLevel || 0)).length;
  const outOfStockProducts = filteredProducts.filter(p => (p.currentStockQty || p.openingStock || 0) <= 0).length;

  const categoryOptions = [
    { value: "", label: t("all_categories") },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
  ];

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        header: t("product_info"),
        render: (p) => (
          <div className="flex items-center gap-3">
            {p.image && (
              <img
                src={p.image}
                alt={p.productName}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                referrerPolicy="no-referrer"
              />
            )}
            {!p.image && (
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Package size={18} className="text-indigo-600" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{p.productName}</span>
              <span className="text-xs text-gray-500">{p.sku}</span>
            </div>
          </div>
        )
      },
      {
        header: t("category"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{p.category || "-"}</span>
          </div>
        )
      },
      {
        header: t("stock"),
        render: (p) => {
          const currentStock = p.currentStockQty || p.openingStock || 0;
          const status = getStockStatus(currentStock, p.reorderLevel || 0);
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{currentStock} {p.defaultUnit}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <span className="text-xs text-gray-500">
                {t("reorder_level")}: {p.reorderLevel || 0}
              </span>
            </div>
          );
        }
      },
      {
        header: t("pricing"),
        render: (p) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-sm">Sell: {p.sellingPrice?.toLocaleString()} EGP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Cost: {p.purchasePrice?.toLocaleString()} EGP</span>
            </div>
          </div>
        )
      },
      {
        header: t("warehouse"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <Warehouse size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{getWarehouseName(p)}</span>
          </div>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (p) => {
          const productId = extractId(p);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(productId)}
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
            {t("products")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_inventory_products")}
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
          <ExportDropdown data={filteredProducts} filename="products" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_product")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_products")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("inventory_value")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("low_stock")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{lowStockProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("out_of_stock")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{outOfStockProducts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_products")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(categoryFilter || searchTerm) && (
          <button
            onClick={() => {
              setCategoryFilter("");
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
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <InventoryProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        productToEdit={editingProduct}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_product")}
        message={t("are_you_sure_delete_product")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_products")}
        message={t("are_you_sure_delete_products", { count: selectedIds.length })}
      />
    </div>
  );
};