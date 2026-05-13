import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Ruler,
  Hash,
  Filter,
  X,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { UnitModal } from "../../components/inventory/UnitModal";
import { useData } from "../../context/DataContext";
import { Unit } from "../../types";
import { toast } from "sonner";

export const Units: React.FC = () => {
  const { t } = useTranslation();
  const { units, addUnit, updateUnit, deleteUnit, fetchUnits } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID - IMPORTANT: returns string ID, not object
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      // Handle both _id and id properties
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
      // If it's a MongoDB ObjectId-like object with toString method
      if (value.toString && typeof value.toString === "function") {
        const str = value.toString();
        if (str && !str.includes('Object')) return str;
      }
    }
    return "";
  }, []);

  const handleSave = async (unitData: Partial<Unit>) => {
    try {
      setIsLoading(true);

      if (editingUnit) {
        const unitId = extractId(editingUnit);

        if (!unitId) {
          toast.error(t("unit_id_missing"));
          return;
        }

        // Create update data with ID - ensure _id is a string
        const updateData = {
          ...unitData,
          _id: unitId,
          id: unitId,
        } as Unit;

        console.log("Updating unit with ID:", unitId, updateData);
        await updateUnit(updateData);
        toast.success(t("unit_updated_successfully"));
      } else {
        await addUnit(unitData as Unit);
        toast.success(t("unit_created_successfully"));
      }

      await fetchUnits();
      setIsModalOpen(false);
      setEditingUnit(null);
    } catch (error: any) {
      console.error("Error saving unit:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("failed_to_save_unit");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback(
    (unit: Unit) => {
      // Extract ID correctly from the unit object
      const unitId = extractId(unit);

      if (!unitId) {
        console.error("Unit ID not found", unit);
        toast.error(t("unit_id_not_found"));
        return;
      }

      // Create a clean unit object with proper ID as string
      const unitToEdit: Unit = {
        ...unit,
        _id: unitId,
        id: unitId,
      };

      console.log("Editing unit:", unitToEdit);
      setEditingUnit(unitToEdit);
      setIsModalOpen(true);
    },
    [extractId, t],
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        console.log("Deleting unit with ID:", deleteId);
        await deleteUnit(deleteId);
        toast.success(t("unit_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
        await fetchUnits();
      } catch (error: any) {
        console.error("Error deleting unit:", error);
        toast.error(error?.response?.data?.message || t("failed_to_delete_unit"));
      }
    }
  }, [deleteId, deleteUnit, fetchUnits, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      // Ensure we have valid IDs
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map((id) => deleteUnit(id)));
      toast.success(
        t("units_deleted_successfully", { count: validIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchUnits();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_units"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    return (
      <Badge variant={s === "ACTIVE" ? "success" : "danger"}>
        {s === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply filters
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.abbreviation || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (u.status || "").toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, statusFilter]);

  // Statistics
  const totalUnits = filteredUnits.length;
  const activeUnits = filteredUnits.filter(
    (u) => (u.status || "").toUpperCase() === "ACTIVE",
  ).length;
  const baseUnits = filteredUnits.filter(
    (u) => !u.parentUnit && !u.parentUnitId,
  ).length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Unit>[] = useMemo(
    () => [
      {
        header: t("unit_info"),
        render: (u) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Ruler size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{u.name}</span>
              <span className="text-xs text-gray-500">{u.abbreviation}</span>
            </div>
          </div>
        ),
      },
      {
        header: t("code"),
        render: (u) => (
          <span className="text-sm font-mono text-gray-500">{u.code || "-"}</span>
        ),
      },
      {
        header: t("conversion"),
        render: (u) => (
          <div className="flex items-center gap-1.5">
            <Hash size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              1 {u.abbreviation} = {u.conversionFactor} × base
            </span>
            {(u.parentUnit || u.parentUnitId) && (
              <span className="text-xs text-gray-400 ml-1">
                (sub-unit)
              </span>
            )}
          </div>
        ),
      },
      {
        header: t("created_at"),
        render: (u) => (
          <span className="text-sm text-gray-500">
            {formatDate(u.createdAt)}
          </span>
        ),
      },
      {
        header: t("status"),
        render: (u) => getStatusBadge(u.status),
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (u) => {
          const unitId = extractId(u);
          if (!unitId) {
            console.warn("Could not extract ID for unit:", u);
            return null;
          }
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(u)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(unitId)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                title={t("delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [t, handleEdit, handleDelete, extractId],
  );

  // Get valid key extractor
  const getKeyExtractor = useCallback((item: Unit) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("units_of_measure")}
          </h1>
          <p className="text-gray-500 mt-1">{t("manage_product_units")}</p>
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
          <ExportDropdown data={filteredUnits} filename="units" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingUnit(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_unit")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Ruler size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_units")}</p>
              <p className="text-xl font-bold text-gray-900">{totalUnits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Ruler size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active")}</p>
              <p className="text-xl font-bold text-green-600">{activeUnits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Hash size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("base_units")}</p>
              <p className="text-xl font-bold text-blue-600">{baseUnits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={t("search_units")}
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
        data={filteredUnits}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSave}
        unitToEdit={editingUnit}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_unit")}
        message={t("are_you_sure_delete_unit")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_units")}
        message={t("are_you_sure_delete_units", { count: selectedIds.length })}
      />
    </div>
  );
};