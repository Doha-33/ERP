import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, BookOpen, User, Filter, X, ChevronDown, Award } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { InitialTrainingModal } from "../../components/hr/InitialTrainingModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { InitialTraining } from "../../types";
import { toast } from "sonner";

export const InitialTrainingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { initialTrainings, addInitialTraining, updateInitialTraining, deleteInitialTraining, employees } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<InitialTraining | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleSave = async (training: Partial<InitialTraining>) => {
    try {
      setIsLoading(true);
      if (editingTraining) {
        await updateInitialTraining({ ...training, _id: editingTraining._id, id: editingTraining.id } as InitialTraining);
        toast.success(t("initial_training_updated_successfully"));
      } else {
        await addInitialTraining(training as InitialTraining);
        toast.success(t("initial_training_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingTraining(null);
    } catch (error) {
      console.error("Error saving initial training:", error);
      toast.error(t("failed_to_save_initial_training"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((training: InitialTraining) => {
    setEditingTraining(training);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteInitialTraining(deleteId);
        toast.success(t("initial_training_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_initial_training"));
      }
    }
  }, [deleteId, deleteInitialTraining, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteInitialTraining(id)));
      toast.success(t("initial_trainings_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_initial_trainings"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (training: InitialTraining): string => {
    if (typeof training.employeeInfo === "object" && training.employeeInfo !== null) {
      return (training.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === training.employeeInfo);
    return employee?.fullName || training.empName || "-";
  };

  const getEmployeeCode = (training: InitialTraining): string => {
    if (typeof training.employeeInfo === "object" && training.employeeInfo !== null) {
      return (training.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === training.employeeInfo);
    return employee?.employeeCode || training.empCode || "-";
  };

  const getDepartmentName = (training: InitialTraining): string => {
    if (typeof training.department === "object" && training.department !== null) {
      return (training.department as any)?.departmentName || "-";
    }
    return training.department || "-";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
      Pending: { variant: "warning", label: t("pending") },
      Completed: { variant: "success", label: t("completed") },
      Failed: { variant: "danger", label: t("failed") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Apply filters
  const filteredTrainings = useMemo(() => {
    return initialTrainings.filter(t => {
      const employeeName = getEmployeeName(t).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        t.trainingType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.trainer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesType = !typeFilter || t.trainingType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [initialTrainings, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const totalTrainings = filteredTrainings.length;
  const completedTrainings = filteredTrainings.filter(t => t.status === "Completed").length;
  const pendingTrainings = filteredTrainings.filter(t => t.status === "Pending").length;
  const failedTrainings = filteredTrainings.filter(t => t.status === "Failed").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Pending", label: t("pending") },
    { value: "Completed", label: t("completed") },
    { value: "Failed", label: t("failed") },
  ];

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "Safety Training", label: t("safety_training") },
    { value: "Technical Training", label: t("technical_training") },
    { value: "Soft Skills", label: t("soft_skills") },
    { value: "Compliance Training", label: t("compliance_training") },
    { value: "Onboarding", label: t("onboarding") },
  ];

  const columns: Column<InitialTraining>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getEmployeeName(t)}</span>
              <span className="text-xs text-gray-500">{getEmployeeCode(t)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("training_info"),
        render: (t) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">{t.trainingType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{t.trainer}</span>
            </div>
          </div>
        )
      },
      {
        header: t("department"),
        render: (t) => (
          <span className="text-sm text-gray-600">{getDepartmentName(t)}</span>
        )
      },
      {
        header: t("date"),
        render: (t) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(t.doneAt || t.trainingDate)}</span>
          </div>
        )
      },
      {
        header: t("done_by"),
        render: (t) => (
          <span className="text-sm text-gray-600">{t.doneBy || "-"}</span>
        )
      },
      {
        header: t("status"),
        render: (t) => getStatusBadge(t.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (t) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(t)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(t._id || t.id)}
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
            {t("initial_training")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_initial_training")}
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
          <ExportDropdown data={filteredTrainings} filename="initial-trainings" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingTraining(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_initial_training")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_trainings")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalTrainings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("completed")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{completedTrainings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingTrainings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("failed")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{failedTrainings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_initial_trainings")}
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

        {(statusFilter || typeFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("");
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
          data={filteredTrainings}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <InitialTrainingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTraining(null);
        }}
        onSave={handleSave}
        trainingToEdit={editingTraining}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_initial_training")}
        message={t("are_you_sure_delete_initial_training")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_initial_trainings")}
        message={t("are_you_sure_delete_initial_trainings", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock, XCircle } from "lucide-react";