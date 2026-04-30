import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, User, Briefcase, Target, Filter, X, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ProjectModal } from "../../components/crm/ProjectModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMProject } from "../../types";
import { toast } from "sonner";

export const Projects: React.FC = () => {
  const { t } = useTranslation();
  const { projects, loading, addProject, updateProject, deleteProject } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CRMProject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (project: Partial<CRMProject>) => {
    try {
      setIsLoading(true);
      if (editingProject) {
        await updateProject(editingProject.id || editingProject._id!, project);
        toast.success(t("project_updated_successfully"));
      } else {
        await addProject(project);
        toast.success(t("project_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(t("failed_to_save_project"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((project: CRMProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteProject(deleteId);
        toast.success(t("project_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_project"));
      }
    }
  }, [deleteId, deleteProject, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteProject(id)));
      toast.success(t("projects_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_projects"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teamLeader?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Statistics
  const totalProjects = filteredProjects.length;
  const completedProjects = filteredProjects.filter(p => p.status === "Completed").length;
  const inProgressProjects = filteredProjects.filter(p => p.status === "In Progress").length;
  const cancelledProjects = filteredProjects.filter(p => p.status === "Cancelled").length;
  const avgProgress = totalProjects > 0 
    ? Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
    : 0;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "info" | "danger"; label: string; icon: any }> = {
      "Completed": { variant: "success", label: t("completed"), icon: CheckCircle },
      "In Progress": { variant: "info", label: t("in_progress"), icon: Clock },
      "Cancelled": { variant: "danger", label: t("cancelled"), icon: XCircle },
    };
    const config = statusMap[status] || { variant: "info", label: status, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const columns: Column<CRMProject>[] = useMemo(
    () => [
      {
        header: t("project"),
        render: (p) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{p.projectName}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">{p.client}</span>
          </div>
        )
      },
      {
        header: t("team_leader"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{p.teamLeader}</span>
          </div>
        )
      },
      {
        header: t("progress"),
        render: (p) => (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{p.progress}%</span>
            </div>
            <div className="w-full max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(p.progress)}`}
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>
        )
      },
      {
        header: t("deadline"),
        render: (p) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {p.deadline ? new Date(p.deadline).toLocaleDateString() : "-"}
              </span>
            </div>
            {p.startDate && (
              <span className="text-xs text-gray-400 ml-5">
                {t("started")}: {new Date(p.startDate).toLocaleDateString()}
              </span>
            )}
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
        render: (p) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(p)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(p.id || p._id!)}
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
            {t("crm_projects")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_projects")}
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
          <ExportDropdown data={filteredProjects} filename="projects" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_project")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_projects")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalProjects}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("in_progress")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{inProgressProjects}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("completed")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{completedProjects}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("cancelled")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{cancelledProjects}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("avg_progress")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{avgProgress}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_projects")}
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
          data={filteredProjects}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        projectToEdit={editingProject}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_project")}
        message={t("are_you_sure_delete_project")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_projects")}
        message={t("are_you_sure_delete_projects", { count: selectedIds.length })}
      />
    </div>
  );
};