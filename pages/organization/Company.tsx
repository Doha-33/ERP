import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Mail,
  CreditCard,
  Hash,
  Filter,
  X,
  ChevronDown,
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
import { CompanyModal } from "../../components/organization/CompanyModal";
import { useData } from "../../context/DataContext";
import { Company } from "../../types";
import { toast } from "sonner";

export const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const { companies, addCompany, updateCompany, deleteCompany } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (company: Partial<Company>) => {
    try {
      setIsLoading(true);
      if (editingCompany) {
        // تأكد من أن لدينا _id صالح
        const companyId = editingCompany._id || editingCompany.id;
        if (!companyId) {
          toast.error(t("invalid_company_id"));
          return;
        }
        console.log("Updating company with ID:", companyId);
        await updateCompany({ ...company, id: companyId } as Company);
        toast.success(t("company_updated_successfully"));
      } else {
        await addCompany(company as Company);
        toast.success(t("company_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingCompany(null);
      // إعادة تحميل البيانات بعد التحديث
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Operation failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((company: Company) => {
    const companyWithId = {
      ...company,
      id: company._id || company.id, // تأكد من وجود خاصية id
    };
    setEditingCompany(companyWithId);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteCompany(deleteId);
        toast.success(t("company_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_company"));
      }
    }
  }, [deleteId, deleteCompany, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteCompany(id)));
      toast.success(
        t("companies_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_companies"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [companies, searchTerm]);

  // Statistics
  const totalCompanies = filteredCompanies.length;

  const columns: Column<Company>[] = useMemo(
    () => [
      {
        header: t("company_info"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-xs text-gray-500">{c.taxNumber}</span>
            </div>
          </div>
        ),
      },
      {
        header: t("contact"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{c.email}</span>
            </div>
            {(c as any).phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {(c as any).phoneNumber}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        header: t("currency"),
        render: (c) => (
          <div className="flex items-center gap-1.5">
            <CreditCard size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700 uppercase">
              {c.defaultCurrency}
            </span>
          </div>
        ),
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
              onClick={() => handleDelete(c._id || c.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t, handleEdit, handleDelete],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("company_page_title")}
          </h1>
          <p className="text-gray-500 mt-1">{t("manage_company")}</p>
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
          <ExportDropdown data={filteredCompanies} filename="companies" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingCompany(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_company")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_companies")}</p>
              <p className="text-xl font-bold text-gray-900">
                {totalCompanies}
              </p>
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
            placeholder={t("search_companies")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredCompanies}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSave}
        companyToEdit={editingCompany}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_company")}
        message={t("are_you_sure_delete_company")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_companies")}
        message={t("are_you_sure_delete_companies", {
          count: selectedIds.length,
        })}
      />
    </div>
  );
};

// Add missing import
import { Phone } from "lucide-react";
