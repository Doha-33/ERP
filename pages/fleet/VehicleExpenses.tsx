import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, DollarSign, Wallet, Calendar, FileText } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ExpenseFormModal } from "../../components/fleet/ExpenseFormModal";
import { fleetService } from "../../services/fleet.service";
import { VehicleExpense as VehicleExpenseType, Vehicle } from "../../types";
import { toast } from "sonner";

export const VehicleExpenses: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<VehicleExpenseType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<VehicleExpenseType | null>(null);
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, vehiclesData] = await Promise.all([
        fleetService.getExpenses(),
        fleetService.getVehicles(),
      ]);
      setExpenses(expensesData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("failed_to_fetch_expenses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<VehicleExpenseType>) => {
    try {
      if (selectedExpense) {
        await fleetService.updateExpense(selectedExpense._id, data);
        toast.success(t("expense_updated_successfully"));
      } else {
        await fleetService.createExpense(data);
        toast.success(t("expense_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to save expense:", error);
      toast.error(t("failed_to_save_expense"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!expenseIdToDelete) return;
    try {
      await fleetService.deleteExpense(expenseIdToDelete);
      setIsDeleteModalOpen(false);
      setExpenseIdToDelete(null);
      toast.success(t("expense_deleted_successfully"));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error(t("failed_to_delete_expense"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "neutral"; label: string; icon: any }> = {
      Paid: { variant: "success", label: t("paid"), icon: Wallet },
      Pending: { variant: "warning", label: t("pending"), icon: DollarSign },
    };
    const config = statusMap[status] || { variant: "neutral", label: status, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<VehicleExpenseType>[] = [
    {
      header: t("date"),
      accessorKey: "date",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Calendar size={14} className="text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("vehicle"),
      render: (item) => {
        const vehicle = typeof item.vehicleId === "object" ? item.vehicleId : null;
        return vehicle ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{vehicle.plateNumber}</span>
            <span className="text-xs text-gray-500">{vehicle.model}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("unknown")}</span>
        );
      },
    },
    {
      header: t("type"),
      accessorKey: "type",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{item.type}</span>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessorKey: "amount",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">
            {item.amount.toLocaleString()} EGP
          </span>
        </div>
      ),
    },
    {
      header: t("description"),
      accessorKey: "description",
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {item.description || "-"}
          </p>
        </div>
      ),
    },
    {
      header: t("status"),
      accessorKey: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedExpense(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setExpenseIdToDelete(item._id);
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

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "Paid", label: t("paid") },
    { value: "Pending", label: t("pending") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("vehicle_expenses")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_vehicle_expenses")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={expenses} filename="vehicle-expenses" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedExpense(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_vehicle_expense")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_expense_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={filteredExpenses}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        selectedExpense={selectedExpense}
        vehicles={vehicles}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_expense")}
        message={t("are_you_sure_delete_expense")}
      />
    </div>
  );
};