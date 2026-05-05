import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Building2,
  Shield,
  FileText,
  Filter,
  X,
} from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { UserModal } from "../../components/users/UserModal";
import { DocumentModal } from "../../components/hr/DocumentModal";
import userService, { User as UserType } from "../../services/user.service";
import { toast } from "sonner";

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("failed_to_fetch_users"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (data: any) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, data);
        toast.success(t("user_updated_successfully"));
      } else {
        await userService.createUser(data);
        toast.success(t("user_created_successfully"));
      }
      await fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(t("failed_to_save_user"));
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await userService.deleteUser(deleteId);
        toast.success(t("user_deleted_successfully"));
        await fetchUsers();
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(t("failed_to_delete_user"));
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => userService.deleteUser(id)));
      toast.success(t("users_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_users"));
    }
  };

  const handleDocSave = async (data: any) => {
    console.log("Saving document...", data);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
      ACTIVE: { variant: "success", label: t("active") },
      INACTIVE: { variant: "danger", label: t("inactive") },
      SUSPENDED: { variant: "warning", label: t("suspended") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "SUSPENDED", label: t("suspended") },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || u.state === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const columns: Column<UserType>[] = useMemo(
    () => [
      {
        header: t("user_info"),
        render: (u) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{u.username}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
            </div>
          </div>
        )
      },
      {
        header: t("role"),
        render: (u) => (
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {typeof u.roleId === "object" ? (u.roleId as any)?.name : u.roleId || "-"}
            </span>
          </div>
        )
      },
      {
        header: t("branch"),
        render: (u) => (
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {typeof u.branchId === "object" ? (u.branchId as any)?.name : u.branchId || "-"}
            </span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (u) => getStatusBadge(u.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (u) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setEditingUser(u);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteId(u._id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("users")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("user_management_desc")}
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
          <ExportDropdown data={filteredUsers} filename="users" />
          <Button
            variant="outline"
            onClick={() => setIsDocModalOpen(true)}
            className="border-gray-200"
          >
            <FileText size={18} />
            {t("add_document")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_user")}
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
              <p className="text-xs text-gray-500">{t("total_users")}</p>
              <p className="text-xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active")}</p>
              <p className="text-xl font-bold text-green-600">
                {users.filter(u => u.state === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("inactive")}</p>
              <p className="text-xl font-bold text-red-600">
                {users.filter(u => u.state !== "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_users_placeholder")}
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
          data={filteredUsers}
          columns={columns}
          keyExtractor={(u) => u._id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
        userToEdit={editingUser}
        isLoading={isLoading}
      />

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleDocSave}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("delete_user")}
        message={t("are_you_sure_delete_user")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_users")}
        message={t("are_you_sure_delete_users", { count: selectedIds.length })}
      />
    </div>
  );
};