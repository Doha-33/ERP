import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  DollarSign,
  CreditCard,
  Receipt,
  Calendar,
  Building,
  FileText,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  StatCard,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { IncomeFormModal } from "../../components/accounting/IncomeFormModal";
import { useData } from "../../context/DataContext";
import { Income as IncomeType } from "../../types";
import { toast } from "sonner";

export const Income: React.FC = () => {
  const { t } = useTranslation();
  const { incomes, accountingLoading, addIncome, updateIncome, deleteIncome } =
    useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeType | null>(null);
  const [incomeIdToDelete, setIncomeIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch =
      (income.note?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (income.companyName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (income.source?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  // تحديث حسب الحالات الجديدة
  const paidIncome = incomes
    .filter((i) => i.status === "Paid")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidIncome = incomes
    .filter((i) => i.status === "Unpaid")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const partialIncome = incomes
    .filter((i) => i.status === "partial")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSave = async (data: Partial<IncomeType>) => {
    try {
      const processedData = {
        ...data,
      };

      if (selectedIncome) {
        await updateIncome(
          selectedIncome._id || selectedIncome.id!,
          processedData,
        );
        toast.success(t("income_updated_successfully"));
      } else {
        await addIncome(processedData);
        toast.success(t("income_added_successfully"));
      }
      setIsModalOpen(false);
      setSelectedIncome(null);
    } catch (error) {
      console.error("Failed to save income:", error);
      toast.error(t("failed_to_save_income"));
    }
  };

  const handleDelete = async () => {
    if (!incomeIdToDelete) return;
    try {
      await deleteIncome(incomeIdToDelete);
      setIsDeleteModalOpen(false);
      setIncomeIdToDelete(null);
      toast.success(t("income_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete income:", error);
      toast.error(t("failed_to_delete_income"));
    }
  };

  // تحديث دالة الـ Badge حسب الحالات الجديدة
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; variant: string }
    > = {
      Paid: { label: t("paid"), color: "green", variant: "success" },
      Unpaid: { label: t("unpaid"), color: "red", variant: "danger" },
      partial: { label: t("partial"), color: "orange", variant: "warning" },
    };

    const { label, color, variant } = statusMap[status] || {
      label: status || t("unknown"),
      color: "gray",
      variant: "info",
    };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <span>{label}</span>
      </div>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap: Record<string, { label: string; color: string }> = {
      "Bank Transfer": { label: t("bank_transfer"), color: "blue" },
      Cash: { label: t("cash"), color: "green" },
      Online: { label: t("online"), color: "orange" },
    };

    const { label, color } = methodMap[method] || {
      label: method || t("unknown"),
      color: "gray",
    };

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <CreditCard size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const columns: Column<IncomeType>[] = [
    { header: t("income_id"), accessorKey: "incomeId" },
    {
      header: t("date"),
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          <span className="text-sm">
            {new Date(item.date).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: t("source"),
      accessorKey: "source",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Building size={12} className="text-gray-400" />
          <span className="text-sm">{item.source}</span>
        </div>
      ),
    },
    {
      header: t("payment_method"),
      accessorKey: "paymentMethod",
      render: (item) => getPaymentMethodBadge(item.paymentMethod),
    },
    {
      header: t("vat_percent"),
      accessorKey: "vatPercent",
      render: (item) => (item.vatPercent ? `${item.vatPercent}%` : "-"),
    },
    {
      header: t("vat_amount"),
      accessorKey: "vatAmount",
      render: (item) =>
        item.vatAmount ? `${item.vatAmount.toLocaleString()} USD` : "-",
    },
    {
      header: t("amount"),
      render: (item) => (
        <div className="font-medium text-green-600">
          {item.amount?.toLocaleString()} USD
        </div>
      ),
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("note"),
      accessorKey: "note",
      render: (item) => (
        <div className="max-w-[150px] truncate cursor-help" title={item.note}>
          {item.note?.length > 15
            ? `${item.note.substring(0, 15)}...`
            : item.note}
        </div>
      ),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedIncome(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setIncomeIdToDelete(item._id || item.id!);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("income")}</h1>
          <p className="text-gray-500">{t("manage_your_income")}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={incomes} filename="income" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedIncome(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_income")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t("total_income")}
          value={`${totalIncome.toLocaleString()} USD`}
          icon={<DollarSign size={20} />}
          color="blue"
        />
        <StatCard
          title={t("paid_income")}
          value={`${paidIncome.toLocaleString()} USD`}
          icon={<CreditCard size={20} />}
          color="green"
        />
        <StatCard
          title={t("partial_income")}
          value={`${partialIncome.toLocaleString()} USD`}
          icon={<Receipt size={20} />}
          color="orange"
        />
        <StatCard
          title={t("no_of_transactions")}
          value={incomes.length}
          icon={<Receipt size={20} />}
          color="green"
        />
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center bg-white rounded-lg border border-gray-100">
        <Input
          placeholder={t("search_income")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredIncomes}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={accountingLoading}
        selectable
      />

      <IncomeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIncome(null);
        }}
        selectedIncome={selectedIncome}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_income")}
        message={t("are_you_sure_delete_income")}
      />
    </div>
  );
};
