import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Search, FolderTree } from "lucide-react";
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
  const [accountIdToDelete, setAccountIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isRTL = i18n.language === 'ar';

  // Get parent account name - now parentAccountId is always a string ID
  const getParentAccountName = (account: Account): string => {
    if (!account.parentAccountId) return "-";
    
    const parentId = account.parentAccountId as string;
    const parentAccount = accounts.find(a => a._id === parentId);
    
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
        ) ||
        (account.accountCategory?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (account.paymentMethod?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ),
    );
  }, [accounts, searchTerm]);

  const handleSave = async (data: any) => {
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount._id, data);
        toast.success(t("account_updated_successfully"));
      } else {
        await addAccount(data);
        toast.success(t("account_added_successfully"));
      }
      setIsModalOpen(false);
      setSelectedAccount(null);
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

  // Get category badge color
  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      CASH: 'success',
      BANK: 'info',
      RECEIVABLE: 'warning',
      PAYABLE: 'danger',
      INVENTORY: 'primary',
      SALES: 'success',
      COGS: 'danger',
      EXPENSE: 'warning',
      EQUITY: 'purple',
      OTHER: 'secondary'
    };
    return categoryColors[category] || 'secondary';
  };

  const columns: Column<Account>[] = [
    { 
      header: t("account_code"), 
      accessorKey: "accountCode",
      render: (item: Account) => <span>{item.accountCode}</span>
    },
    { 
      header: t("account_name"), 
      accessorKey: "accountName",
      render: (item: Account) => <span>{item.accountName}</span>
    },
    {
      header: t("account_type"),
      accessorKey: "accountType",
      render: (item: Account) => {
        const typeColors: Record<string, string> = {
          ASSET: 'success',
          LIABILITY: 'warning',
          EQUITY: 'info',
          REVENUE: 'primary',
          EXPENSE: 'danger'
        };
        return (
          <Badge variant={typeColors[item.accountType] as any}>
            {t(item.accountType.toLowerCase())}
          </Badge>
        );
      },
    },
    {
      header: t("account_category"),
      accessorKey: "accountCategory",
      render: (item: Account) => {
        if (!item.accountCategory) return <span>-</span>;
        return (
          <Badge variant={getCategoryBadge(item.accountCategory) as any}>
            {t(`account_category_${item.accountCategory.toLowerCase()}`)}
          </Badge>
        );
      }
    },
    {
      header: t("payment_method"),
      accessorKey: "paymentMethod",
      render: (item: Account) => {
        if (!item.paymentMethod) return <span>-</span>;
        const methodColors: Record<string, string> = {
          CASH: 'success',
          BANK: 'info',
          NONE: 'secondary'
        };
        return (
          <Badge variant={methodColors[item.paymentMethod] as any}>
            {t(`payment_method_${item.paymentMethod.toLowerCase()}`)}
          </Badge>
        );
      }
    },
    {
      header: t("parent_account"),
      render: (item: Account) => <span>{getParentAccountName(item)}</span>,
    },
    {
      header: t("level"),
      render: (item: Account) => <span>{item.level || 0}</span>,
    },
    {
      header: t("status"),
      render: (item: Account) => (
        <Badge variant={item.isActive ? 'success' : 'secondary'}>
          {item.isActive ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      render: (item: Account) => (
        <div className="flex gap-2" dir="ltr">
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
              setAccountIdToDelete(item._id);
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("chart_of_accounts")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_accounts_structure")}</p>
        </div>
        <Button
          onClick={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="ml-2" />
          {t("add_account")}
        </Button>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <Input
          placeholder={t("search_accounts")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
          fullWidth
        />
        <div className="text-sm text-gray-500">
          {t("total_accounts")}: {filteredAccounts.length}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <Table
          data={filteredAccounts}
          columns={columns}
          keyExtractor={(item) => item._id}
          selectable
        />
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleSave}
        accountToEdit={selectedAccount}
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