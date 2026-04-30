import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, User, Clock, CheckCircle, XCircle, Filter, X, TrendingUp, Target } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { TaskModal } from "../../components/crm/TaskModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMTask } from "../../types";
import { toast } from "sonner";

export const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, loading, addTask, updateTask, deleteTask } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (task: Partial<CRMTask>) => {
    try {
      setIsLoading(true);
      if (editingTask) {
        await updateTask(editingTask.id || editingTask._id!, task);
        toast.success(t("task_updated_successfully"));
      } else {
        await addTask(task);
        toast.success(t("task_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(t("failed_to_save_task"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((task: CRMTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteTask(deleteId);
        toast.success(t("task_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_task"));
      }
    }
  }, [deleteId, deleteTask, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteTask(id)));
      toast.success(t("tasks_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_tasks"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = 
        t.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = !stateFilter || t.state === stateFilter;
      
      return matchesSearch && matchesState;
    });
  }, [tasks, searchTerm, stateFilter]);

  // Statistics
  const totalTasks = filteredTasks.length;
  const inProgressTasks = filteredTasks.filter(t => t.state === "In Progress").length;
  const completedTasks = filteredTasks.filter(t => t.state === "Completed").length;
  const cancelledTasks = filteredTasks.filter(t => t.state === "Cancelled").length;
  const overdueTasks = filteredTasks.filter(t => {
    if (t.state !== "Completed" && t.dueDate) {
      return new Date(t.dueDate) < new Date();
    }
    return false;
  }).length;

  const getStateBadge = (state: string) => {
    const stateMap: Record<string, { variant: "info" | "success" | "danger"; label: string; icon: any }> = {
      "In Progress": { variant: "info", label: t("in_progress"), icon: Clock },
      "Completed": { variant: "success", label: t("completed"), icon: CheckCircle },
      "Cancelled": { variant: "danger", label: t("cancelled"), icon: XCircle },
    };
    const config = stateMap[state] || { variant: "info", label: state, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const isOverdue = (task: CRMTask) => {
    if (task.state === "Completed" || task.state === "Cancelled") return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  const stateOptions = [
    { value: "", label: t("all_statuses") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const columns: Column<CRMTask>[] = useMemo(
    () => [
      {
        header: t("task"),
        render: (t) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{t.taskTitle}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6 line-clamp-1">{t.description}</span>
          </div>
        )
      },
      {
        header: t("assignee"),
        render: (t) => (
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t.assignee}</span>
          </div>
        )
      },
      {
        header: t("due_date"),
        render: (ta) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span className={`text-sm ${isOverdue(ta) ? "text-red-600 font-medium" : "text-gray-600"}`}>
                {ta.dueDate ? new Date(ta.dueDate).toLocaleDateString() : "-"}
              </span>
            </div>
            {ta.startDate && (
              <span className="text-xs text-gray-400 ml-5">
                {t("started")}: {new Date(ta.startDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )
      },
      {
        header: t("status"),
        render: (ta) => getStateBadge(ta.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (ta) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(ta)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(ta.id || ta._id!)}
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
            {t("crm_tasks")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_tasks")}
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
          <ExportDropdown data={filteredTasks} filename="tasks" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_task")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_tasks")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("in_progress")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("completed")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{completedTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("cancelled")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{cancelledTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("overdue")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{overdueTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_tasks")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {stateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(stateFilter || searchTerm) && (
          <button
            onClick={() => {
              setStateFilter("");
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
          data={filteredTasks}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        taskToEdit={editingTask}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_task")}
        message={t("are_you_sure_delete_task")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_tasks")}
        message={t("are_you_sure_delete_tasks", { count: selectedIds.length })}
      />
    </div>
  );
};