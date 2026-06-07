import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
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
import { CustomerModal } from "../../components/sales/CustomerModal";
import { useData } from "../../context/DataContext";
import { Customer } from "../../types";
import { toast } from "sonner";

export const Customers: React.FC = () => {
  const { t } = useTranslation();
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = useCallback(
    (customer: Customer) => {
      // Extract ID correctly from the customer object
      const customerId = (customer as any)._id || customer.id;

      if (!customerId) {
        console.error("Customer ID not found", customer);
        toast.error(t("customer_id_not_found"));
        return;
      }

      const customerToEdit = {
        _id: customerId,
        id: customerId,
        customerName: customer.customerName || "",
        customerCode: customer.customerCode || "",
        email: customer.email || "",
        phoneNumber: customer.phoneNumber || "",
        address: customer.address || "",
        companyName: customer.companyName || "",
        status: customer.status || "ACTIVE",
        taxNumber: (customer as any).taxNumber || "",
        website: (customer as any).website || "",
      };

      setEditingCustomer(customerToEdit);
      setIsModalOpen(true);
    },
    [t],
  );

  const handleSave = async (customerData: Partial<Customer>) => {
    try {
      setIsLoading(true);

      if (editingCustomer) {
        // Get the ID from editingCustomer, not from customerData
        const customerId = (editingCustomer as any)._id || editingCustomer.id;

        if (!customerId) {
          toast.error(t("customer_id_missing"));
          return;
        }

        // Create a clean object with the ID
        const updateData = {
          ...customerData,
          _id: customerId,
          id: customerId,
        } as Customer;

        console.log("Updating customer with ID:", customerId, updateData);
        await updateCustomer(updateData);
        toast.success(t("customer_updated_successfully"));
      } else {
        await addCustomer(customerData as Customer);
        toast.success(t("customer_created_successfully"));
      }

      await fetchCustomers(); // Refresh list
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error: any) {
      console.error("Error saving customer:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("failed_to_save_customer");
      toast.error(message);
      await fetchCustomers();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteCustomer(deleteId);
        toast.success(t("customer_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
        await fetchCustomers(); // Refresh list
      } catch (error) {
        toast.error(t("failed_to_delete_customer"));
        await fetchCustomers(); // Refresh list to ensure UI is up to date
      }
    }
  }, [deleteId, deleteCustomer, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteCustomer(id)));
      toast.success(
        t("customers_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error: any) {
      console.error("Bulk delete failed", error);
      toast.error(error.message || t("failed_to_delete_customers"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Apply filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phoneNumber?.includes(searchTerm);

      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Statistics
  const totalCustomers = filteredCustomers.length;
  const activeCustomers = filteredCustomers.filter(
    (c) => c.status === "ACTIVE",
  ).length;
  const inactiveCustomers = filteredCustomers.filter(
    (c) => c.status === "INACTIVE",
  ).length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Customer>[] = useMemo(
    () => [
      {
        header: t("customer_info"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {c.customerName}
              </span>
              <span className="text-xs text-gray-500">{c.customerCode}</span>
            </div>
          </div>
        ),
      },
      {
        header: t("contact"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            {c.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{c.email}</span>
              </div>
            )}
            {c.phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{c.phoneNumber}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        header: t("location"),
        render: (c) => (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 line-clamp-1">
              {c.address || "-"}
            </span>
          </div>
        ),
      },
      {
        header: t("company"),
        render: (c) => (
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {c.companyName || "-"}
            </span>
          </div>
        ),
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.status),
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
          <h1 className="text-2xl font-bold text-gray-900">{t("customers")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_customers")}</p>
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
          <ExportDropdown data={filteredCustomers} filename="customers" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_customer")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_customers")}</p>
              <p className="text-xl font-bold text-gray-900">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <User size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active")}</p>
              <p className="text-xl font-bold text-green-600">
                {activeCustomers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <User size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("inactive")}</p>
              <p className="text-xl font-bold text-red-600">
                {inactiveCustomers}
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
            placeholder={t("search_customers")}
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
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        customerToEdit={editingCustomer}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_customer")}
        message={t("are_you_sure_delete_customer")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_customers")}
        message={t("are_you_sure_delete_customers", {
          count: selectedIds.length,
        })}
      />
    </div>
  );
};
