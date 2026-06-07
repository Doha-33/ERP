import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Package, Barcode, DollarSign, Tag, Filter, X } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ProductModal } from "../../components/sales/ProductModal";
import { useData } from "../../context/DataContext";
import { Product } from "../../types";
import { toast } from "sonner";

export const Products: React.FC = () => {
  const { t } = useTranslation();
  const { products, addSalesProduct, updateSalesProduct, deleteSalesProduct, fetchProducts } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
        // Get the ID from editingProduct
        const productId = extractId(editingProduct);
        
        if (!productId) {
          toast.error(t("product_id_missing"));
          return;
        }
        
        // Create update data with ID
        const updateData = {
          ...productData,
          _id: productId,
          id: productId
        } as Product;
        
        console.log("Updating product with ID:", productId, updateData);
        await updateSalesProduct(updateData);
        toast.success(t("product_updated_successfully"));
      } else {
        await addSalesProduct(productData as Product);
        toast.success(t("product_created_successfully"));
      }
      
      await fetchProducts(); // Refresh list
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
    // Extract ID correctly from the product object
    const productId = extractId(product);
    
    if (!productId) {
      console.error("Product ID not found", product);
      toast.error(t("product_id_not_found"));
      return;
    }
    
    // Create a clean product object with proper ID
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
        await deleteSalesProduct(deleteId);
        toast.success(t("product_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchProducts();
      } catch (error) {
        toast.error(t("failed_to_delete_product"));
      }
    }
  }, [deleteId, deleteSalesProduct, fetchProducts, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteSalesProduct(id)));
      toast.success(t("products_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchProducts();
    } catch (error: any) {
      console.error("Bulk delete failed", error);
      toast.error(error.message || t("failed_to_delete_products"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || p.productType === typeFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, searchTerm, typeFilter, statusFilter]);

  // Statistics
  const totalProducts = filteredProducts.length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.salesPrice || 0), 0);
  const activeCount = filteredProducts.filter(p => p.status === "ACTIVE").length;
  const stockableCount = filteredProducts.filter(p => p.productType === "STOCKABLE").length;
  const serviceCount = filteredProducts.filter(p => p.productType === "SERVICE").length;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: "info" | "success" | "warning"; label: string }> = {
      STOCKABLE: { variant: "info", label: t("stockable") },
      SERVICE: { variant: "success", label: t("service") },
      CONSUMABLE: { variant: "warning", label: t("consumable") },
    };
    const config = typeMap[type] || { variant: "info", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "STOCKABLE", label: t("stockable") },
    { value: "SERVICE", label: t("service") },
    { value: "CONSUMABLE", label: t("consumable") },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        header: t("product_info"),
        render: (p) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Package size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{p.productName}</span>
              <span className="text-xs text-gray-500">SKU: {p.sku}</span>
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
        header: t("pricing"),
        render: (p) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{p.salesPrice?.toLocaleString()} EGP</span>
            </div>
            <span className="text-xs text-gray-400">{t("cost")}: {p.cost?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("type"),
        render: (p) => getTypeBadge(p.productType)
      },
      {
        header: t("unit"),
        accessorKey: "unitOfMeasure",
        render: (p) => (
          <span className="text-sm text-gray-600">{p.unitOfMeasure || "-"}</span>
        )
      },
      {
        header: t("barcode"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <Barcode size={14} className="text-gray-400" />
            <span className="text-sm font-mono text-gray-500">{p.barcode || "-"}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (p) => getStatusBadge(p.status)
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
            {t("manage_your_products")}
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_products")}</p>
          <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_inventory_value")}</p>
          <p className="text-xl font-bold text-indigo-600">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("active_products")}</p>
          <p className="text-xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("stockable")}</p>
          <p className="text-xl font-bold text-blue-600">{stockableCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("service")}</p>
          <p className="text-xl font-bold text-purple-600">{serviceCount}</p>
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

        {(typeFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter("");
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
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <ProductModal
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