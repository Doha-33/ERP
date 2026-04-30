import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Building, User, Phone, Filter, X, Users, Target, TrendingUp, Briefcase } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { LeadModal } from "../../components/crm/LeadModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMLead } from "../../types";
import { toast } from "sonner";

export const Leads: React.FC = () => {
  const { t } = useTranslation();
  const { leads, loading, addLead, updateLead, deleteLead } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (lead: Partial<CRMLead>) => {
    try {
      setIsLoading(true);
      if (editingLead) {
        await updateLead(editingLead.id || editingLead._id!, lead);
        toast.success(t("lead_updated_successfully"));
      } else {
        await addLead(lead);
        toast.success(t("lead_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error(t("failed_to_save_lead"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((lead: CRMLead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteLead(deleteId);
        toast.success(t("lead_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_lead"));
      }
    }
  }, [deleteId, deleteLead, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteLead(id)));
      toast.success(t("leads_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_leads"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.includes(searchTerm) ||
        l.leadOwner?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || l.leadStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Statistics
  const totalLeads = filteredLeads.length;
  const newLeads = filteredLeads.filter(l => l.leadStatus === "New").length;
  const connectedLeads = filteredLeads.filter(l => l.leadStatus === "Connected").length;
  const qualifiedLeads = filteredLeads.filter(l => l.leadStatus === "Not Contacted").length;
  const lostLeads = filteredLeads.filter(l => l.leadStatus === "Lost").length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "info" | "danger" | "purple"; label: string }> = {
      "Connected": { variant: "success", label: t("connected") },
      "Not Contacted": { variant: "warning", label: t("not_contacted") },
      "Lost": { variant: "danger", label: t("lost") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Not Contacted", label: t("not_contacted") },
    { value: "Connected", label: t("connected") },
    { value: "Lost", label: t("lost") },
  ];

  const columns: Column<CRMLead>[] = useMemo(
    () => [
      {header: t("lead_code"),
        render: (l) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{l.leadCode}</span>
          </div>
        )
      },
      {
        header: t("lead_info"),
        render: (l) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <User size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{l.leadName}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-6 mt-0.5">
              <Phone size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{l.phone}</span>
            </div>
          </div>
        )
      },
      {
        header: t("company"),
        render: (l) => (
          <div className="flex items-center gap-1.5">
            <Building size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{l.company}</span>
          </div>
        )
      },
      {
        header: t("owner"),
        render: (l) => (
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{l.leadOwner}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (l) => getStatusBadge(l.leadStatus)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (l) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(l)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(l.id || l._id!)}
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
            {t("leads")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_leads")}
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
          <ExportDropdown data={filteredLeads} filename="leads" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingLead(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_lead")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_leads")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("connected")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{connectedLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-yellow-600" />
            <p className="text-xs text-gray-500">{t("not_contacted")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{qualifiedLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <X size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("lost")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{lostLeads}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_leads")}
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
          data={filteredLeads}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSave}
        leadToEdit={editingLead}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_lead")}
        message={t("are_you_sure_delete_lead")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_leads")}
        message={t("are_you_sure_delete_leads", { count: selectedIds.length })}
      />
    </div>
  );
};