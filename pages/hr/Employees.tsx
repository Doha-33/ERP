import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  ExportDropdown,
  StatCard,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { EmployeeModal } from "../../components/hr/EmployeeModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Employee } from "../../types";
import { toast } from "sonner";

export const Employees: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    currentUserEmployee,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  // Fetch employees logic (assuming useData handles this)
  const accessibleEmployees = useMemo(() => {
    if (isAdmin) return employees;
    return currentUserEmployee ? [currentUserEmployee] : [];
  }, [isAdmin, employees, currentUserEmployee]);

  const handleSave = async (employeeData: Partial<Employee>) => {
    try {
      setIsLoading(true);
      if (editingEmployee) {
        // Get the correct ID - use _id if it exists, otherwise fall back to id
        const employeeId = editingEmployee._id || editingEmployee.id;

        if (!employeeId) {
          toast.error("Employee ID is missing");
          return;
        }

        await updateEmployee({ ...employeeData, id: employeeId } as Employee);
        toast.success(t("employee_updated_successfully"));
      } else {
        await addEmployee(employeeData as Employee);
        toast.success(t("employee_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Operation failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = useCallback((employee: Employee) => {
    // Make sure the employee object has the ID in a consistent place
    const employeeWithId = {
      ...employee,
      id: employee._id || employee.id, // Ensure id property exists
    };
    setEditingEmployee(employeeWithId);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteEmployee(deleteId);
        toast.success(t("employee_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_employee"));
      }
    }
  }, [deleteId, deleteEmployee, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteEmployee(id)));
      toast.success(
        t("employees_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_employees"));
    } finally {
      setIsLoading(false);
    }
  };

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // تحديث handleView لتستخدم extractId
  const handleView = useCallback(
    (id: string) => {
      navigate(`/hr/employees/${id}`);
    },
    [navigate],
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "danger" | "warning" | "info"; label: string }
    > = {
      Active: { variant: "success", label: t("active") },
      Inactive: { variant: "danger", label: t("inactive") },
      OnLeave: { variant: "warning", label: t("on_leave") },
      Suspended: { variant: "warning", label: t("suspended") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredEmployees = useMemo(() => {
    return accessibleEmployees.filter((emp) => {
      const matchesSearch =
        (emp.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (emp.phoneNumber || "").includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || emp.employeeStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accessibleEmployees, searchTerm, statusFilter]);

  // Statistics
  const totalEmployees = accessibleEmployees.length;
  const activeEmployees = accessibleEmployees.filter(
    (e) => e.employeeStatus === "ACTIVE",
  ).length;
  const inactiveEmployees = accessibleEmployees.filter(
    (e) => e.employeeStatus !== "ACTIVE",
  ).length;

  const columns: Column<Employee>[] = useMemo(
    () => [
      {
        header: t("employee_code"),
        accessorKey: "employeeCode",
        render: (emp) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users size={14} className="text-indigo-600" />
            </div>
            <span className="font-mono text-sm font-medium text-gray-900">
              {emp.employeeCode || "-"}
            </span>
          </div>
        ),
      },
      {
        header: t("employee_name"),
        render: (emp) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{emp.fullName}</span>
            <span className="text-xs text-gray-500">
              {emp.jobId?.jobName || "-"}
            </span>
          </div>
        ),
      },
      {
        header: t("contact"),
        render: (emp) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">{emp.email || "-"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {emp.phoneNumber || "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("company_branch"),
        render: (emp) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {emp.companyId?.name || "-"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {emp.branchId?.name || "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("join_date"),
        render: (emp) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : "-"}
            </span>
          </div>
        ),
      },
      {
        header: t("status"),
        render: (emp) => getStatusBadge(emp.employeeStatus || "ACTIVE"),
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (emp) => {
          const empId = emp._id || emp.id;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleView(empId)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("view_details")}
              >
                <Eye size={16} />
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleEdit(emp)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                    title={t("edit")}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(empId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [t, handleEdit, handleDelete, handleView, isAdmin],
  );

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("employees")}</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t("manage_all_employees") : t("view_your_profile")}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={accessibleEmployees} filename="employees" />
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingEmployee(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} />
              {t("add_employee")}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards - Only for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_employees")}</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalEmployees}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <UserCheck size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("active_employees")}</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeEmployees}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <UserX size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("inactive_employees")}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {inactiveEmployees}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_employees_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
        {isAdmin && (
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
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredEmployees}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable={isAdmin}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modals */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSave}
        employeeToEdit={editingEmployee}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_employee")}
        message={t("are_you_sure_delete_employee")}
      />

      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_employees")}
        message={t("are_you_sure_delete_employees", {
          count: selectedIds.length,
        })}
      />
    </div>
  );
};
