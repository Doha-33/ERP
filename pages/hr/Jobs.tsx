import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Briefcase, Building2, FileText, Filter, X, ChevronDown } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { JobModal } from "../../components/hr/JobModal";
import { useData } from "../../context/DataContext";
import { Job } from "../../types";
import { toast } from "sonner";

export const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const { jobs, departments, addJob, updateJob, deleteJob } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (job: Partial<Job>) => {
    try {
      setIsLoading(true);
      if (editingJob) {
        const jobId = editingJob._id;
        if (!jobId) {
          toast.error(t("invalid_job_id"));
          return;
        }
        await updateJob({ ...editingJob, ...job, _id: jobId } as Job);
        toast.success(t("job_updated_successfully"));
      } else {
        await addJob(job as Job);
        toast.success(t("job_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error?.response?.data?.message || t("failed_to_save_job"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteJob(deleteId);
        toast.success(t("job_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_job"));
      }
    }
  }, [deleteId, deleteJob, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteJob(id)));
      toast.success(t("jobs_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_jobs"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get department name
  const getDepartmentName = (job: Job): string => {
    if (!job.departmentId) return "-";
    if (typeof job.departmentId === "object") {
      return (job.departmentId as any)?.departmentName || "-";
    }
    const department = departments.find(d => (d._id || d.id) === job.departmentId);
    return department?.departmentName || "-";
  };

  const getDepartmentId = (job: Job): string => {
    if (typeof job.departmentId === "object") {
      return (job.departmentId as any)?._id || "";
    }
    return job.departmentId || "";
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Apply filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const departmentName = getDepartmentName(j).toLowerCase();
      const matchesSearch = 
        j.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        departmentName.includes(searchTerm.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || getDepartmentId(j) === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [jobs, searchTerm, departmentFilter]);

  // Statistics
  const totalJobs = filteredJobs.length;
  const activeJobs = filteredJobs.filter(j => j.state === "ACTIVE").length;

  const departmentOptions = [
    { value: "", label: t("all_departments") },
    ...departments.map(d => ({ 
      value: d._id || d.id, 
      label: d.departmentName 
    }))
  ];

  const columns: Column<Job>[] = useMemo(
    () => [
      {
        header: t("job_info"),
        render: (j) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Briefcase size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{j.jobName}</span>
              <span className="text-xs text-gray-500">{getDepartmentName(j)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("description"),
        render: (j) => (
          <div className="flex items-start gap-1.5">
            <FileText size={14} className="text-gray-400 mt-0.5" />
            <span className="text-sm text-gray-600 line-clamp-2">{j.description || "-"}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (j) => getStatusBadge(j.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (j) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(j)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(j._id)}
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
            {t("jobs")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_jobs")}
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
          <ExportDropdown data={filteredJobs} filename="jobs" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_job")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_jobs")}</p>
              <p className="text-xl font-bold text-gray-900">{totalJobs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active_jobs")}</p>
              <p className="text-xl font-bold text-green-600">{activeJobs}</p>
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
            placeholder={t("search_jobs")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(searchTerm || departmentFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredJobs}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSave}
        jobToEdit={editingJob}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_job")}
        message={t("are_you_sure_delete_job")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_jobs")}
        message={t("are_you_sure_delete_jobs", { count: selectedIds.length })}
      />
    </div>
  );
};