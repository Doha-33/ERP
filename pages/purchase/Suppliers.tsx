import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, CreditCard, Filter, X, Users, FileText } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { SupplierModal } from "../../components/purchase/SupplierModal";
import { useData } from "../../context/DataContext";
import { Supplier } from "../../types";
import { toast } from "sonner";

export const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, fetchSuppliers } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSave = async (supplierData: Partial<Supplier>) => {
    try {
      setIsLoading(true);
      
      if (editingSupplier) {
        // Get the ID from editingSupplier
        const supplierId = extractId(editingSupplier);
        
        if (!supplierId) {
          toast.error(t("supplier_id_missing"));
          return;
        }
        
        // Create update data with ID
        const updateData = {
          ...supplierData,
          _id: supplierId,
          id: supplierId
        } as Supplier;
        
        console.log("Updating supplier with ID:", supplierId, updateData);
        await updateSupplier(updateData);
        toast.success(t("supplier_updated_successfully"));
      } else {
        await addSupplier(supplierData as Supplier);
        toast.success(t("supplier_created_successfully"));
      }
      
      await fetchSuppliers(); // Refresh list
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (error: any) {
      console.error("Error saving supplier:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_supplier");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((supplier: Supplier) => {
    // Extract ID correctly from the supplier object
    const supplierId = extractId(supplier);
    
    if (!supplierId) {
      console.error("Supplier ID not found", supplier);
      toast.error(t("supplier_id_not_found"));
      return;
    }
    
    // Create a clean supplier object with proper ID
    const supplierToEdit: Supplier = {
      ...supplier,
      _id: supplierId,
      id: supplierId,
    };
    
    console.log("Editing supplier:", supplierToEdit);
    setEditingSupplier(supplierToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteSupplier(deleteId);
        toast.success(t("supplier_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchSuppliers();
      } catch (error) {
        toast.error(t("failed_to_delete_supplier"));
      }
    }
  }, [deleteId, deleteSupplier, fetchSuppliers, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteSupplier(id)));
      toast.success(t("suppliers_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchSuppliers();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_suppliers"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely get company name
  const getCompanyName = (supplier: Supplier): string => {
    if (!supplier.companyId) return supplier.companyName || "-";
    if (typeof supplier.companyId === 'object') {
      return (supplier.companyId as any)?.name || supplier.companyName || "-";
    }
    return supplier.companyName || "-";
  };

  // Helper function to safely get branch name
  const getBranchName = (supplier: Supplier): string => {
    if (!supplier.branchId) return "-";
    if (typeof supplier.branchId === 'object') {
      return (supplier.branchId as any)?.name || "-";
    }
    return supplier.branchId || "-";
  };

  // Apply filters
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = 
        s.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phoneNumber?.includes(searchTerm);
      
      const matchesStatus = !statusFilter || s.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  // Statistics
  const totalSuppliers = filteredSuppliers.length;
  const activeSuppliers = filteredSuppliers.filter(s => s.status === "ACTIVE").length;
  const inactiveSuppliers = filteredSuppliers.filter(s => s.status === "INACTIVE").length;

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="neutral">{t("unknown")}</Badge>;
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Supplier>[] = useMemo(
    () => [
      {
        header: t("supplier_info"),
        render: (s) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{s.supplierName || "-"}</span>
              <span className="text-xs text-gray-500">{s.supplierCode || "-"}</span>
            </div>
          </div>
        )
      },
      {
        header: t("contact"),
        render: (s) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{s.email || "-"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{s.phoneNumber || "-"}</span>
            </div>
          </div>
        )
      },
      {
        header: t("location"),
        render: (s) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 line-clamp-1">{s.address || "-"}</span>
            </div>
            {s.paymentTerms && (
              <div className="flex items-center gap-1.5">
                <CreditCard size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">{s.paymentTerms}</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("company_branch"),
        render: (s) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{getCompanyName(s)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{getBranchName(s)}</span>
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
        render: (s) => {
          const supplierId = extractId(s);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(supplierId)}
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
            {t("suppliers")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_suppliers")}
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
          <ExportDropdown data={filteredSuppliers} filename="suppliers" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingSupplier(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_supplier")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_suppliers")}</p>
              <p className="text-xl font-bold text-gray-900">{totalSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active_suppliers")}</p>
              <p className="text-xl font-bold text-green-600">{activeSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("inactive_suppliers")}</p>
              <p className="text-xl font-bold text-gray-500">{inactiveSuppliers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_suppliers")}
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
        data={filteredSuppliers}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSave}
        supplierToEdit={editingSupplier}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_supplier")}
        message={t("are_you_sure_delete_supplier")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_suppliers")}
        message={t("are_you_sure_delete_suppliers", { count: selectedIds.length })}
      />
    </div>
  );
};