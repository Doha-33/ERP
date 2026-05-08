import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  CreditCard,
  Landmark,
  DollarSign,
  Filter,
  X,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { BankAccountModal } from "../../components/accounting/BankAccountModal";
import { useData } from "../../context/DataContext";
import { BankAccount } from "../../types";
import { toast } from "sonner";

export const BankAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { bankAccounts, accountingLoading, addBankAccount, updateBankAccount, deleteBankAccount } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountIdToDelete, setAccountIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (account: Partial<BankAccount>) => {
    try {
      setIsLoading(true);
      if (editingAccount) {
        await updateBankAccount(editingAccount._id || editingAccount.id, account);
        toast.success(t("bank_account_updated_successfully"));
      } else {
        await addBankAccount(account);
        toast.success(t("bank_account_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error("Error saving bank account:", error);
      toast.error(t("failed_to_save_bank_account"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((account: BankAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAccountIdToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (accountIdToDelete) {
      try {
        await deleteBankAccount(accountIdToDelete);
        toast.success(t("bank_account_deleted_successfully"));
        setAccountIdToDelete(null);
        setIsDeleteModalOpen(false);
        setSelectedIds(prev => prev.filter(sid => sid !== accountIdToDelete));
      } catch (error) {
        console.error("Error deleting bank account:", error);
        toast.error(t("failed_to_delete_bank_account"));
      }
    }
  }, [accountIdToDelete, deleteBankAccount, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteBankAccount(id)));
      toast.success(t("bank_accounts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_bank_accounts"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "success" : "danger"}>
        {isActive ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Get unique currencies for filter
  const uniqueCurrencies = useMemo(() => {
    const currencies = bankAccounts.map(a => a.currency).filter(Boolean);
    return Array.from(new Set(currencies));
  }, [bankAccounts]);

  // Apply filters
  const filteredAccounts = useMemo(() => {
    return bankAccounts.filter(a => {
      const matchesSearch = 
        a.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCurrency = !currencyFilter || a.currency === currencyFilter;
      const matchesStatus = !statusFilter || 
        (statusFilter === "active" && a.isActive) ||
        (statusFilter === "inactive" && !a.isActive);
      
      return matchesSearch && matchesCurrency && matchesStatus;
    });
  }, [bankAccounts, searchTerm, currencyFilter, statusFilter]);

  // Statistics
  const totalAccounts = filteredAccounts.length;
  const totalBalance = filteredAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const activeAccounts = filteredAccounts.filter(a => a.isActive).length;
  const inactiveAccounts = filteredAccounts.filter(a => !a.isActive).length;

  const currencyOptions = [
    { value: "", label: t("all_currencies") },
    ...uniqueCurrencies.map(c => ({ value: c, label: c })),
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
  ];

  const columns: Column<BankAccount>[] = useMemo(
    () => [
      {
        header: t("account_info"),
        render: (a) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Landmark size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{a.accountName}</span>
            </div>
          </div>
        )
      },
      {
        header: t("bank_details"),
        render: (a) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{a.bankName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{a.accountNumber}</span>
            </div>
          </div>
        )
      },
      {
        header: t("balance"),
        render: (a) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">
              {a.balance?.toLocaleString()} {a.currency}
            </span>
          </div>
        )
      },
      {
        header: t("iban"),
        render: (a) => (
          <span className="text-sm font-mono text-gray-500">{a.iban || "-"}</span>
        )
      },
      {
        header: t("status"),
        render: (a) => getStatusBadge(a.isActive)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (a) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(a)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(a._id || a.id)}
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
            {t("bank_accounts")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_bank_accounts")}
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
          <ExportDropdown data={filteredAccounts} filename="bank-accounts" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_bank_account")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_accounts")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalAccounts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_balance")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalBalance.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeAccounts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("inactive")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{inactiveAccounts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_bank_accounts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {currencyOptions.map((option) => (
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

        {(currencyFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setCurrencyFilter("");
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
          data={filteredAccounts}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={accountingLoading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSave}
        accountToEdit={editingAccount}
        isLoading={accountingLoading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("delete_bank_account")}
        message={t("are_you_sure_delete_bank_account")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_bank_accounts")}
        message={t("are_you_sure_delete_bank_accounts", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { CheckCircle, XCircle } from "lucide-react";