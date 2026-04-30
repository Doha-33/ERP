import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, User, Phone, MapPin, Tag, Star, Filter, X, Users } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ContactModal } from "../../components/crm/ContactModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMContact } from "../../types";
import { toast } from "sonner";

export const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const { contacts, loading, addContact, updateContact, deleteContact } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (contact: Partial<CRMContact>) => {
    try {
      setIsLoading(true);
      if (editingContact) {
        await updateContact(editingContact.id || editingContact._id!, contact);
        toast.success(t("contact_updated_successfully"));
      } else {
        await addContact(contact);
        toast.success(t("contact_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error(t("failed_to_save_contact"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((contact: CRMContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteContact(deleteId);
        toast.success(t("contact_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_contact"));
      }
    }
  }, [deleteId, deleteContact, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteContact(id)));
      toast.success(t("contacts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_contacts"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = !tagFilter || c.tags === tagFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      
      return matchesSearch && matchesTag && matchesStatus;
    });
  }, [contacts, searchTerm, tagFilter, statusFilter]);

  // Statistics
  const totalContacts = filteredContacts.length;
  const activeCount = filteredContacts.filter(c => c.status === "Active").length;
  const vipCount = filteredContacts.filter(c => c.tags === "VIP").length;
  const coldLeadCount = filteredContacts.filter(c => c.tags === "Cold Lead").length;
  const avgRating = filteredContacts.length > 0
    ? (filteredContacts.reduce((sum, c) => sum + (c.rating || 0), 0) / filteredContacts.length).toFixed(1)
    : 0;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Active" ? "success" : "danger"}>
        {status === "Active" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const getTagBadge = (tag: string) => {
    const tagMap: Record<string, { variant: "success" | "warning" | "info" | "purple"; label: string }> = {
      VIP: { variant: "purple", label: t("vip") },
      Promotion: { variant: "warning", label: t("promotion") },
      "Cold Lead": { variant: "info", label: t("cold_lead") },
    };
    const config = tagMap[tag] || { variant: "info", label: tag };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-medium text-gray-700 mr-1">{rating}</span>
        {[...Array(Math.floor(rating))].map((_, i) => (
          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
        {[...Array(5 - Math.floor(rating))].map((_, i) => (
          <Star key={i} size={14} className="text-gray-300" />
        ))}
      </div>
    );
  };

  const tagOptions = [
    { value: "", label: t("all_tags") },
    { value: "VIP", label: t("vip") },
    { value: "Promotion", label: t("promotion") },
    { value: "Cold Lead", label: t("cold_lead") },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const columns: Column<CRMContact>[] = useMemo(
    () => [
      {
        header: t("contact"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{c.name}</span>
              <div className="flex items-center gap-1 mt-0.5">
                {c.tags && getTagBadge(c.tags)}
              </div>
            </div>
          </div>
        )
      },
      {
        header: t("contact_info"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{c.phone}</span>
            </div>
            {c.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{c.location}</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("rating"),
        render: (c) => renderRating(c.rating || 0)
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (c) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(c)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(c.id || c._id!)}
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
            {t("contacts")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_contacts")}
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
          <ExportDropdown data={filteredContacts} filename="contacts" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_contact")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_contacts")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalContacts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <User size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("vip")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{vipCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("cold_lead")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{coldLeadCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            <p className="text-xs text-gray-500">{t("avg_rating")}</p>
          </div>
          <p className="text-xl font-bold text-yellow-600 mt-1">{avgRating}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_contacts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {tagOptions.map((option) => (
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

        {(tagFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setTagFilter("");
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
          data={filteredContacts}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        contactToEdit={editingContact}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_contact")}
        message={t("are_you_sure_delete_contact")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_contacts")}
        message={t("are_you_sure_delete_contacts", { count: selectedIds.length })}
      />
    </div>
  );
};