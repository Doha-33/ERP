import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Star, Building2, Filter, X, FileText } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { SupplierRatingModal } from "../../components/purchase/SupplierRatingModal";
import { useData } from "../../context/DataContext";
import { SupplierRating } from "../../types";
import { toast } from "sonner";

export const SupplierRatings: React.FC = () => {
  const { t } = useTranslation();
  const { supplierRatings, addSupplierRating, updateSupplierRating, deleteSupplierRating, suppliers } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<SupplierRating | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (rating: Partial<SupplierRating>) => {
    try {
      setIsLoading(true);
      if (editingRating) {
        await updateSupplierRating({ ...rating, id: editingRating._id || editingRating.id } as SupplierRating);
        toast.success(t("supplier_rating_updated_successfully"));
      } else {
        await addSupplierRating(rating as SupplierRating);
        toast.success(t("supplier_rating_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingRating(null);
    } catch (error) {
      console.error("Error saving supplier rating:", error);
      toast.error(t("failed_to_save_supplier_rating"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((rating: SupplierRating) => {
    setEditingRating(rating);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteSupplierRating(deleteId);
        toast.success(t("supplier_rating_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_supplier_rating"));
      }
    }
  }, [deleteId, deleteSupplierRating, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteSupplierRating(id)));
      toast.success(t("supplier_ratings_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_supplier_ratings"));
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplierName = (rating: SupplierRating): string => {
    if (typeof rating.supplierId === "object" && rating.supplierId !== null) {
      return (rating.supplierId as any)?.supplierName || "-";
    }
    const supplier = suppliers.find(s => (s._id || s.id) === rating.supplierId);
    return supplier?.supplierName || "-";
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  // Apply filters
  const filteredRatings = useMemo(() => {
    return supplierRatings.filter(r => {
      const supplierName = getSupplierName(r).toLowerCase();
      const matchesSearch = supplierName.includes(searchTerm.toLowerCase());
      const matchesMinRating = !minRatingFilter || (r.overallRating || 0) >= parseInt(minRatingFilter);
      return matchesSearch && matchesMinRating;
    });
  }, [supplierRatings, searchTerm, minRatingFilter]);

  // Statistics
  const totalRatings = filteredRatings.length;
  const avgQuality = totalRatings > 0 
    ? Math.round(filteredRatings.reduce((sum, r) => sum + (r.quality || 0), 0) / totalRatings)
    : 0;
  const avgDelivery = totalRatings > 0 
    ? Math.round(filteredRatings.reduce((sum, r) => sum + (r.delivery || 0), 0) / totalRatings)
    : 0;
  const avgService = totalRatings > 0 
    ? Math.round(filteredRatings.reduce((sum, r) => sum + (r.service || 0), 0) / totalRatings)
    : 0;
  const avgOverall = totalRatings > 0 
    ? Math.round(filteredRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / totalRatings)
    : 0;

  const ratingOptions = [
    { value: "", label: t("all_ratings") },
    { value: "1", label: "1 ★" },
    { value: "2", label: "2 ★" },
    { value: "3", label: "3 ★" },
    { value: "4", label: "4 ★" },
    { value: "5", label: "5 ★" },
  ];

  const columns: Column<SupplierRating>[] = useMemo(
    () => [
      {
        header: t("supplier"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getSupplierName(r)}</span>
              <span className="text-xs text-gray-500">{r.ratingCode}</span>
            </div>
          </div>
        )
      },
      {
        header: t("quality"),
        render: (r) => renderStars(r.quality)
      },
      {
        header: t("delivery"),
        render: (r) => renderStars(r.delivery)
      },
      {
        header: t("service"),
        render: (r) => renderStars(r.service)
      },
      {
        header: t("compliance"),
        render: (r) => renderStars(r.compliance)
      },
      {
        header: t("overall"),
        render: (r) => (
          <div className="flex items-center gap-2">
            {renderStars(r.overallRating)}
            <span className="text-sm font-semibold text-indigo-600">{r.overallRating}/5</span>
          </div>
        )
      },
      {
        header: t("date"),
        render: (r) => (
          <span className="text-sm text-gray-500">
            {new Date(r.createdAt).toLocaleDateString()}
          </span>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(r)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(r._id || r.id)}
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
            {t("supplier_rating")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_supplier_performance")}
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
          <ExportDropdown data={filteredRatings} filename="supplier-ratings" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRating(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_supplier_rating")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_ratings")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalRatings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-blue-500" />
            <p className="text-xs text-gray-500">{t("avg_quality")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{avgQuality}/5</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("avg_delivery")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{avgDelivery}/5</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-purple-500" />
            <p className="text-xs text-gray-500">{t("avg_service")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{avgService}/5</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            <p className="text-xs text-gray-500">{t("avg_overall")}</p>
          </div>
          <p className="text-xl font-bold text-amber-600 mt-1">{avgOverall}/5</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_supplier_ratings")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={minRatingFilter}
          onChange={(e) => setMinRatingFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {ratingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(minRatingFilter || searchTerm) && (
          <button
            onClick={() => {
              setMinRatingFilter("");
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
          data={filteredRatings}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <SupplierRatingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRating(null);
        }}
        onSave={handleSave}
        ratingToEdit={editingRating}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_supplier_rating")}
        message={t("are_you_sure_delete_supplier_rating")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_supplier_ratings")}
        message={t("are_you_sure_delete_supplier_ratings", { count: selectedIds.length })}
      />
    </div>
  );
};