import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Building2, MapPin, Mail, Filter, X, ChevronDown } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { BranchModal } from "../../components/organization/BranchModal";
import { useData } from "../../context/DataContext";
import { Branch } from "../../types";
import { toast } from "sonner";

export const BranchPage: React.FC = () => {
  const { t } = useTranslation();
  const { branches, companies, addBranch, updateBranch, deleteBranch } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (branch: Partial<Branch>) => {
  try {
    setIsLoading(true);
    if (editingBranch) {
      // تأكد من أن لدينا _id صالح
      const branchId = editingBranch._id;
      if (!branchId) {
        toast.error(t("invalid_branch_id"));
        return;
      }
      console.log("Updating branch with ID:", branchId);
      await updateBranch({ ...editingBranch, ...branch, _id: branchId } as Branch);
      toast.success(t("branch_updated_successfully"));
    } else {
      await addBranch(branch as Branch);
      toast.success(t("branch_created_successfully"));
    }
    setIsModalOpen(false);
    setEditingBranch(null);
    // إعادة تحميل البيانات بعد التحديث
  } catch (error) {
    console.error("Error saving branch:", error);
    toast.error(t("failed_to_save_branch"));
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = useCallback((branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteBranch(deleteId);
        toast.success(t("branch_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_branch"));
      }
    }
  }, [deleteId, deleteBranch, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteBranch(id)));
      toast.success(t("branches_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_branches"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get company name
  const getCompanyName = (branch: Branch): string => {
    if (!branch.companyId) return "-";
    if (typeof branch.companyId === "object") {
      return (branch.companyId as any)?.name || "-";
    }
    const company = companies.find(c => (c._id || c.id) === branch.companyId);
    return company?.name || "-";
  };

  const getCompanyId = (branch: Branch): string => {
    if (typeof branch.companyId === "object") {
      return (branch.companyId as any)?._id || "";
    }
    return branch.companyId || "";
  };

  // Apply filters
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const companyName = getCompanyName(b).toLowerCase();
      const matchesSearch = 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = !companyFilter || getCompanyId(b) === companyFilter;
      
      return matchesSearch && matchesCompany;
    });
  }, [branches, searchTerm, companyFilter]);

  // Statistics
  const totalBranches = filteredBranches.length;
  const activeBranches = filteredBranches.filter(b => b.state === "ACTIVE").length;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const companyOptions = [
    { value: "", label: t("all_companies") },
    ...companies.map(c => ({ 
      value: c._id || c.id, 
      label: c.name 
    }))
  ];

  const columns: Column<Branch>[] = useMemo(
    () => [
      {
        header: t("branch_info"),
        render: (b) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{b.name}</span>
              <span className="text-xs text-gray-500">{getCompanyName(b)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("contact"),
        render: (b) => (
          <div className="flex flex-col gap-1">
            {b.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{b.email}</span>
              </div>
            )}
            {(b as any).phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{(b as any).phoneNumber}</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("location"),
        render: (b) => (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 line-clamp-1">{b.address || "-"}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (b) => getStatusBadge(b.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (b) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(b)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(b._id || b.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("branch_page_title")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_branch")}
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
          <ExportDropdown data={filteredBranches} filename="branches" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingBranch(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_branch")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_branches")}</p>
              <p className="text-xl font-bold text-gray-900">{totalBranches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active_branches")}</p>
              <p className="text-xl font-bold text-green-600">{activeBranches}</p>
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
            placeholder={t("search_branches")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {companyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(searchTerm || companyFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCompanyFilter("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredBranches}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        onSave={handleSave}
        branchToEdit={editingBranch}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_branch")}
        message={t("are_you_sure_delete_branch")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_branches")}
        message={t("are_you_sure_delete_branches", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing import
import { Phone } from "lucide-react";