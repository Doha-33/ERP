import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, BookOpen, User, Filter, X, ChevronDown, Award, Clock, XCircle, CheckCircle } from "lucide-react";
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
  const { initialTrainings, addInitialTraining, updateInitialTraining, deleteInitialTraining, employees, fetchInitialTrainings } = useData();
  
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

  const handleSave = async (trainingData: Partial<InitialTraining>) => {
    try {
      setIsLoading(true);
      
      if (editingTraining) {
        const trainingId = extractId(editingTraining);
        
        if (!trainingId) {
          toast.error(t("initial_training_id_missing"));
          return;
        }
        
        const updateData = {
          ...trainingData,
          _id: trainingId,
          id: trainingId
        } as InitialTraining;
        
        console.log("Updating initial training with ID:", trainingId, updateData);
        await updateInitialTraining(updateData);
        toast.success(t("initial_training_updated_successfully"));
      } else {
        await addInitialTraining(trainingData as InitialTraining);
        toast.success(t("initial_training_created_successfully"));
      }
      
      await fetchInitialTrainings();
      setIsModalOpen(false);
      setEditingTraining(null);
    } catch (error: any) {
      console.error("Error saving initial training:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_initial_training");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((training: InitialTraining) => {
    const trainingId = extractId(training);
    
    if (!trainingId) {
      console.error("Initial training ID not found", training);
      toast.error(t("initial_training_id_not_found"));
      return;
    }
    
    const trainingToEdit: InitialTraining = {
      ...training,
      _id: trainingId,
      id: trainingId,
    };
    
    console.log("Editing initial training:", trainingToEdit);
    setEditingTraining(trainingToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

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
        await fetchInitialTrainings();
      } catch (error) {
        toast.error(t("failed_to_delete_initial_training"));
      }
    }
  }, [deleteId, deleteInitialTraining, fetchInitialTrainings, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map(id => deleteInitialTraining(id)));
      toast.success(t("initial_trainings_deleted_successfully", { count: validIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchInitialTrainings();
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
    const employee = employees.find(e => extractId(e) === training.employeeInfo);
    return employee?.fullName || training.empName || "-";
  };

  const getEmployeeCode = (training: InitialTraining): string => {
    if (typeof training.employeeInfo === "object" && training.employeeInfo !== null) {
      return (training.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => extractId(e) === training.employeeInfo);
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
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  // API expects: Pending, Done, Canceled (not Completed or Failed)
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info"; label: string }> = {
      Pending: { variant: "warning", label: t("pending") },
      Done: { variant: "success", label: t("done") },
      Completed: { variant: "success", label: t("completed") },
      Canceled: { variant: "danger", label: t("canceled") },
      Failed: { variant: "danger", label: t("failed") },
      Paid: { variant: "success", label: t("paid") },
      Unpaid: { variant: "danger", label: t("unpaid") },
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
  const completedTrainings = filteredTrainings.filter(t => t.status === "Done" || t.status === "Completed").length;
  const pendingTrainings = filteredTrainings.filter(t => t.status === "Pending").length;
  const failedTrainings = filteredTrainings.filter(t => t.status === "Failed" || t.status === "Canceled").length;

  // API expects: Pending, Done, Canceled, Paid, Unpaid
  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Pending", label: t("pending") },
    { value: "Done", label: t("done") },
    { value: "Canceled", label: t("canceled") },
    { value: "Paid", label: t("paid") },
    { value: "Unpaid", label: t("unpaid") },
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
        render: (item) => {
          const employeeName = getEmployeeName(item);
          const employeeCode = getEmployeeCode(item);
          const initial = employeeName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User size={18} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{employeeName}</span>
                <span className="text-xs text-gray-500">{employeeCode}</span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("training_info"),
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">{item.trainingType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{item.trainer}</span>
            </div>
          </div>
        )
      },
      {
        header: t("department"),
        render: (item) => (
          <span className="text-sm text-gray-600">{getDepartmentName(item)}</span>
        )
      },
      {
        header: t("date"),
        render: (item) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(item.doneAt || item.trainingDate)}</span>
          </div>
        )
      },
      {
        header: t("done_by"),
        render: (item) => (
          <span className="text-sm text-gray-600">{item.doneBy || "-"}</span>
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
          const trainingId = extractId(item);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(trainingId)}
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

  const getKeyExtractor = useCallback((item: InitialTraining) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

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
            <CheckCircle size={18} className="text-green-600" />
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
            <p className="text-xs text-gray-500">{t("canceled_failed")}</p>
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
        keyExtractor={getKeyExtractor}
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