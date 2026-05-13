import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, CreditCard, User, Calendar, UserCheck, Filter, X, ChevronDown, CheckCircle, Clock } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { AccessCardModal } from "../../components/hr/AccessCardModal";
import { useData } from "../../context/DataContext";
import { AccessCard } from "../../types";
import { toast } from "sonner";

export const AccessCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { accessCards, addAccessCard, updateAccessCard, deleteAccessCard, fetchAccessCards } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AccessCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSave = async (cardData: Partial<AccessCard>) => {
    try {
      setIsLoading(true);
      
      if (editingCard) {
        const cardId = extractId(editingCard);
        
        if (!cardId) {
          toast.error(t("access_card_id_missing"));
          return;
        }
        
        const updateData = {
          ...cardData,
          _id: cardId,
          id: cardId
        } as AccessCard;
        
        console.log("Updating access card with ID:", cardId, updateData);
        await updateAccessCard(updateData);
        toast.success(t("access_card_updated_successfully"));
      } else {
        await addAccessCard(cardData as AccessCard);
        toast.success(t("access_card_created_successfully"));
      }
      
      await fetchAccessCards();
      setIsModalOpen(false);
      setEditingCard(null);
    } catch (error: any) {
      console.error("Error saving access card:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_access_card");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((card: AccessCard) => {
    const cardId = extractId(card);
    
    if (!cardId) {
      console.error("Access card ID not found", card);
      toast.error(t("access_card_id_not_found"));
      return;
    }
    
    const cardToEdit: AccessCard = {
      ...card,
      _id: cardId,
      id: cardId,
    };
    
    console.log("Editing access card:", cardToEdit);
    setEditingCard(cardToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteAccessCard(deleteId);
        toast.success(t("access_card_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchAccessCards();
      } catch (error) {
        toast.error(t("failed_to_delete_access_card"));
      }
    }
  }, [deleteId, deleteAccessCard, fetchAccessCards, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map(id => deleteAccessCard(id)));
      toast.success(t("access_cards_deleted_successfully", { count: validIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchAccessCards();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_access_cards"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (card: AccessCard): string => {
    if (!card.employeeInfo) return card.empCode || "-";
    if (typeof card.employeeInfo === "object") {
      return (card.employeeInfo as any)?.fullName || card.empCode || "-";
    }
    return card.empCode || "-";
  };

  const getEmployeeCode = (card: AccessCard): string => {
    if (typeof card.employeeInfo === "object") {
      return (card.employeeInfo as any)?.employeeCode || card.empCode || "-";
    }
    return card.empCode || "-";
  };

  // Apply filters
  const filteredCards = useMemo(() => {
    return accessCards.filter(c => {
      const employeeName = getEmployeeName(c).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        c.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getEmployeeCode(c).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [accessCards, searchTerm, statusFilter]);

  // Statistics
  const totalCards = filteredCards.length;
  const doneCards = filteredCards.filter(c => c.status === "Done").length;
  const pendingCards = filteredCards.filter(c => c.status === "Pending").length;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Done" ? "success" : "warning"}>
        {status === "Done" ? t("done") : t("pending")}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Done", label: t("done") },
    { value: "Pending", label: t("pending") },
  ];

  const columns: Column<AccessCard>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getEmployeeName(c)}</span>
              <span className="text-xs text-gray-500">{getEmployeeCode(c)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("card_number"),
        render: (c) => (
          <div className="flex items-center gap-1.5">
            <CreditCard size={14} className="text-gray-400" />
            <span className="text-sm font-mono text-gray-600">{c.cardNumber}</span>
          </div>
        )
      },
      {
        header: t("done_info"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{formatDate(c.doneAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{c.doneBy}</span>
            </div>
          </div>
        )
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (c) => {
          const cardId = extractId(c);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(c)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(cardId)}
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

  const getKeyExtractor = useCallback((item: AccessCard) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("manage_access_cards")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_employee_access_cards")}
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
          <ExportDropdown data={filteredCards} filename="access-cards" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingCard(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_access_card")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_cards")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalCards}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("done")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{doneCards}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingCards}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_access_cards")}
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
        data={filteredCards}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <AccessCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSave}
        cardToEdit={editingCard}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_access_card")}
        message={t("are_you_sure_delete_access_card")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_access_cards")}
        message={t("are_you_sure_delete_access_cards", { count: selectedIds.length })}
      />
    </div>
  );
};