import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  Button,
  Badge,
  ExportDropdown,
  Input,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { useData } from "../../context/DataContext";
import { Account } from "../../types";
import { AccountModal } from "../../components/accounting/AccountModal";
import { toast } from "sonner";

export const ChartOfAccounts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accounts, addAccount, updateAccount, deleteAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountIdToDelete, setAccountIdToDelete] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const isRTL = i18n.language === 'ar';

  // Function to get parent account name from ID or object
  const getParentAccountName = (account: Account): string => {
    if (!account.parentAccountId) return "-";
    
    // If parentAccountId is an object with name property
    if (typeof account.parentAccountId === 'object' && account.parentAccountId !== null) {
      const parent = account.parentAccountId as any;
      return `${parent.accountCode || ''} - ${parent.accountName || ''}`.replace(/^- /, '');
    }
    
    // If parentAccountId is a string ID, find the parent account from accounts list
    const parentId = account.parentAccountId as string;
    const parentAccount = accounts.find(a => a._id === parentId || a.id === parentId);
    
    if (parentAccount) {
      return `${parentAccount.accountCode} - ${parentAccount.accountName}`;
    }
    
    return "-";
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        (account.accountName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (account.accountCode?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (account.accountType?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ),
    );
  }, [accounts, searchTerm]);

  const handleSave = async (data: any) => {
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount._id || selectedAccount.id, data);
        toast.success(t("account_updated_successfully"));
      } else {
        await addAccount(data);
        toast.success(t("account_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save account:", error);
      toast.error(t("failed_to_save_account"));
    }
  };

  const handleDelete = async () => {
    if (!accountIdToDelete) return;
    try {
      await deleteAccount(accountIdToDelete);
      setIsDeleteModalOpen(false);
      setAccountIdToDelete(null);
      toast.success(t("account_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(t("failed_to_delete_account"));
    }
  };

  const columns: Column<Account>[] = [
    { 
      header: t("account_code"), 
      accessorKey: "accountCode",
      render: (item: Account) => (
        <span className="font-mono text-sm">{item.accountCode}</span>
      )
    },
    { 
      header: t("account_name"), 
      accessorKey: "accountName",
      render: (item: Account) => (
        <span className="font-medium">{item.accountName}</span>
      )
    },
    {
      header: t("account_type"),
      render: (item) => {
        const typeColors: Record<string, string> = {
          ASSET: 'success',
          LIABILITY: 'warning',
          EQUITY: 'info',
          REVENUE: 'primary',
          EXPENSE: 'danger'
        };
        return (
          <Badge status={typeColors[item.accountType] || 'info'}>
            {t(item.accountType.toLowerCase())}
          </Badge>
        );
      },
    },
    {
      header: t("parent_account"),
      render: (item) => getParentAccountName(item),
    },
    {
      header: t("level"),
      render: (item) => item.level || 0,
    },
    {
      header: t("status"),
      render: (item) => (
        <Badge status={item.isActive ? "success" : "danger"}>
          {item.isActive ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAccount(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setAccountIdToDelete(item._id || item.id);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors border border-gray-300 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("chart_of_accounts")}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t("manage_your_accounts_structure")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={accounts} filename="chart_of_accounts" />
          </div>
          <Button
            onClick={() => {
              setSelectedAccount(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t("add_account")}
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white rounded-lg border border-gray-200">
        <Input
          placeholder={t("search_accounts")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
          fullWidth
        />
        <div className="text-sm text-gray-500">
          {t("total_accounts")}: {filteredAccounts.length}
        </div>
      </div>

      {/* Table Section - Responsive with horizontal scroll */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table
            data={filteredAccounts}
            columns={columns}
            keyExtractor={(item) => item._id || item.id || ""}
            selectable
          />
        </div>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        accountToEdit={selectedAccount}
        parentAccounts={accounts}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_account")}
        message={t("are_you_sure_delete_account")}
      />
    </div>
  );
};