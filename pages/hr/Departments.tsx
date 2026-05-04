import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Building2, Users, Filter, X, ChevronDown } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DepartmentModal } from "../../components/hr/DepartmentModal";
import { useData } from "../../context/DataContext";
import { Department } from "../../types";
import { toast } from "sonner";

export const Departments: React.FC = () => {
  const { t } = useTranslation();
  const { departments, companies, addDepartment, updateDepartment, deleteDepartment } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (department: Partial<Department>) => {
    try {
      setIsLoading(true);
      if (editingDepartment) {
        const departmentId = editingDepartment._id;
        if (!departmentId) {
          toast.error(t("invalid_department_id"));
          return;
        }
        await updateDepartment({ ...department, _id: departmentId, id: departmentId } as Department);
        toast.success(t("department_updated_successfully"));
      } else {
        await addDepartment(department as Department);
        toast.success(t("department_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingDepartment(null);
    } catch (error: any) {
      console.error("Error saving department:", error);
      toast.error(error?.response?.data?.message || t("failed_to_save_department"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteDepartment(deleteId);
        toast.success(t("department_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_department"));
      }
    }
  }, [deleteId, deleteDepartment, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteDepartment(id)));
      toast.success(t("departments_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_departments"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get company name
  const getCompanyName = (department: Department): string => {
    if (!department.companyId) return "-";
    if (typeof department.companyId === "object") {
      return (department.companyId as any)?.name || "-";
    }
    const company = companies.find(c => (c._id || c.id) === department.companyId);
    return company?.name || "-";
  };

  const getCompanyId = (department: Department): string => {
    if (typeof department.companyId === "object") {
      return (department.companyId as any)?._id || "";
    }
    return department.companyId || "";
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Apply filters
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const companyName = getCompanyName(d).toLowerCase();
      const matchesSearch = 
        d.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.includes(searchTerm.toLowerCase()) ||
        d.managerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = !companyFilter || getCompanyId(d) === companyFilter;
      
      return matchesSearch && matchesCompany;
    });
  }, [departments, searchTerm, companyFilter]);

  // Statistics
  const totalDepartments = filteredDepartments.length;
  const activeDepartments = filteredDepartments.filter(d => d.state === "ACTIVE").length;

  const companyOptions = [
    { value: "", label: t("all_companies") },
    ...companies.map(c => ({ 
      value: c._id || c.id, 
      label: c.name 
    }))
  ];

  const columns: Column<Department>[] = useMemo(
    () => [
      {
        header: t("department_info"),
        render: (d) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{d.departmentName}</span>
              <span className="text-xs text-gray-500">{getCompanyName(d)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("manager"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{d.managerName || "-"}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (d) => getStatusBadge(d.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (d) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(d)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(d._id)}
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
            {t("department_page_title")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_department")}
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
          <ExportDropdown data={filteredDepartments} filename="departments" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingDepartment(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_department")}
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
              <p className="text-xs text-gray-500">{t("total_departments")}</p>
              <p className="text-xl font-bold text-gray-900">{totalDepartments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active_departments")}</p>
              <p className="text-xl font-bold text-green-600">{activeDepartments}</p>
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
            placeholder={t("search_departments")}
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
          data={filteredDepartments}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDepartment(null);
        }}
        onSave={handleSave}
        departmentToEdit={editingDepartment}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_department")}
        message={t("are_you_sure_delete_department")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_departments")}
        message={t("are_you_sure_delete_departments", { count: selectedIds.length })}
      />
    </div>
  );
};