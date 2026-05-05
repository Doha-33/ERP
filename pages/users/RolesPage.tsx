import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Shield, Search, Lock, Users } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { RoleModal } from "../../components/users/RoleModal";
import { PermissionsModal } from "../../components/users/PermissionsModal";
import roleService, { Role } from "../../services/role.service";
import { toast } from "sonner";

export const RolesPage: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error(t("failed_to_fetch_roles"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSave = async (data: any) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, data);
        toast.success(t("role_updated_successfully"));
      } else {
        await roleService.createRole(data);
        toast.success(t("role_created_successfully"));
      }
      await fetchRoles();
      setIsModalOpen(false);
      setEditingRole(null);
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(t("failed_to_save_role"));
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await roleService.deleteRole(deleteId);
        toast.success(t("role_deleted_successfully"));
        await fetchRoles();
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error(t("failed_to_delete_role"));
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => roleService.deleteRole(id)));
      toast.success(t("roles_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchRoles();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_roles"));
    }
  };

  const handleOpenPermissions = (role: Role) => {
    setEditingRole(role);
    setIsPermModalOpen(true);
  };

  const getStatusBadge = (state: string) => {
    return (
      <Badge variant={state === "ACTIVE" ? "success" : "danger"}>
        {state === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      const matchesSearch = 
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || r.state === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roles, searchTerm, statusFilter]);

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Role>[] = useMemo(
    () => [
      {
        header: t("role_info"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Shield size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{r.name}</span>
              <span className="text-xs text-gray-500">{r.description || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        header: t("users"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{(r as any).userCount || 0}</span>
          </div>
        ),
      },
      {
        header: t("status"),
        render: (r) => getStatusBadge(r.state),
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenPermissions(r)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
              title={t("manage_permissions")}
            >
              <Lock size={16} />
            </button>
            <button
              onClick={() => {
                setEditingRole(r);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteId(r._id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("roles")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_roles_desc")}</p>
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
          <ExportDropdown data={filteredRoles} filename="roles" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRole(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_role")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_roles")}</p>
              <p className="text-xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_users_assigned")}</p>
              <p className="text-xl font-bold text-green-600">
                {roles.reduce((sum, r) => sum + ((r as any).userCount || 0), 0)}
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
            placeholder={t("search_roles")}
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
          data={filteredRoles}
          columns={columns}
          keyExtractor={(r) => r._id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modals */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSave}
        roleToEdit={editingRole}
        isLoading={isLoading}
      />

      <PermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => {
          setIsPermModalOpen(false);
          setEditingRole(null);
        }}
        role={editingRole}
      />

      {/* Delete Confirmations */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("delete_role")}
        message={t("are_you_sure_delete_role")}
      />

      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_roles")}
        message={t("are_you_sure_delete_roles", { count: selectedIds.length })}
      />
    </div>
  );
};